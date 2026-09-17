import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import {
  getDashboardSummary,
  getLiveVibration,
  getNetworkPosture,
  getRecentEvents,
  ingestTelemetry,
  scenarioFromInput,
  setScenario,
  type TelemetryInput,
} from "../services/telemetry";

const router: IRouter = Router();

const telemetrySchema = z.object({
  node_id: z.string().optional(),
  bridge_id: z.string().optional(),
  sampling_rate: z.number().int().positive(),
  rms_g: z.number().nonnegative(),
  peak_to_peak_g: z.number().nonnegative(),
  fft_peak_hz: z.number().nonnegative(),
  anomaly_score: z.number().min(0).max(1),
  status: z.enum(["NORMAL", "WARNING", "ANOMALY", "CRITICAL"]),
  rssi_dbm: z.number().int(),
  waveform_samples: z.array(z.number()).min(1).max(4096),
});

router.post("/v1/telemetry/ingest", async (req, res, next) => {
  const parsed = telemetrySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  try {
    const record = await ingestTelemetry(parsed.data as TelemetryInput);
    res.status(201).json({
      id: record.id,
      node_id: record.nodeId,
      bridge_id: record.bridgeId,
      sampling_rate: record.samplingRate,
      rms_g: record.rmsG,
      peak_to_peak_g: record.peakToPeakG,
      fft_peak_hz: record.fftPeakHz,
      anomaly_score: record.anomalyScore,
      status: record.status,
      waveform_samples: record.rawWaveform,
      timestamp: record.timestamp.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/v1/dashboard/summary", async (_req, res, next) => {
  try {
    res.json(await getDashboardSummary());
  } catch (error) {
    next(error);
  }
});

router.get("/v1/telemetry/live-vibration", async (_req, res, next) => {
  try {
    res.json(await getLiveVibration());
  } catch (error) {
    next(error);
  }
});

router.get("/v1/events/recent", async (req, res, next) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 10) || 10, 1), 100);
  try {
    res.json(await getRecentEvents(limit));
  } catch (error) {
    next(error);
  }
});

router.get("/v1/network/posture", async (_req, res, next) => {
  try {
    res.json(await getNetworkPosture());
  } catch (error) {
    next(error);
  }
});

router.post("/v1/simulation/scenario", async (req, res, next) => {
  const scenario = scenarioFromInput(req.body?.scenario);
  if (!scenario) {
    res.status(400).json({ message: "scenario must be one of the supported scenario names" });
    return;
  }
  try {
    await setScenario(scenario);
    res.json(await getDashboardSummary());
  } catch (error) {
    next(error);
  }
});

export default router;
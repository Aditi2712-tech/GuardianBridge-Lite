import { desc, eq } from "drizzle-orm";
import {
  db,
  networkPosture,
  systemEvents,
  telemetryLogs,
  type TelemetryLog,
} from "@workspace/db";
import { logger } from "../lib/logger";

export const scenarioNames = [
  "Normal Operation",
  "Increased Vibration",
  "Loose Joint",
  "Excess Load",
] as const;

export type ScenarioName = (typeof scenarioNames)[number];
export type TelemetryStatus = "NORMAL" | "WARNING" | "ANOMALY" | "CRITICAL";
export type Mode = "LIVE" | "DEMO";

export interface TelemetryInput {
  node_id?: string;
  bridge_id?: string;
  sampling_rate: number;
  rms_g: number;
  peak_to_peak_g: number;
  fft_peak_hz: number;
  anomaly_score: number;
  status: TelemetryStatus;
  rssi_dbm: number;
  waveform_samples: number[];
}

export interface LiveVibration {
  node_id: string;
  sampling_rate: number;
  rms_g: number;
  peak_to_peak_g: number;
  fft_peak_hz: number;
  waveform: number[];
  anomaly_score: number;
  status: TelemetryStatus;
  timestamp: string;
}

export interface DashboardSummary {
  bridge_health: number;
  tinyml_status: TelemetryStatus;
  anomaly_score: number;
  lora_network_status: "CONNECTED" | "DISCONNECTED" | "DEGRADED";
  active_nodes: string;
  rssi_dbm: number;
  active_alerts_count: number;
  mode: Mode;
  scenario: ScenarioName;
  last_updated: string;
}

type Profile = {
  rms: number;
  peak: number;
  fft: number;
  anomaly: number;
  health: number;
  rssi: number;
  delivery: number;
  latency: number;
  status: TelemetryStatus;
  lora: "CONNECTED" | "DISCONNECTED" | "DEGRADED";
  amplitude: number;
};

const profiles: Record<ScenarioName, Profile> = {
  "Normal Operation": {
    rms: 0.31,
    peak: 0.72,
    fft: 14.2,
    anomaly: 0.08,
    health: 98,
    rssi: -72,
    delivery: 98.7,
    latency: 184,
    status: "NORMAL",
    lora: "CONNECTED",
    amplitude: 0.08,
  },
  "Increased Vibration": {
    rms: 0.85,
    peak: 1.86,
    fft: 18.7,
    anomaly: 0.45,
    health: 85,
    rssi: -75,
    delivery: 96.2,
    latency: 246,
    status: "WARNING",
    lora: "CONNECTED",
    amplitude: 0.24,
  },
  "Loose Joint": {
    rms: 0.98,
    peak: 2.32,
    fft: 7.8,
    anomaly: 0.78,
    health: 65,
    rssi: -77,
    delivery: 94.8,
    latency: 298,
    status: "ANOMALY",
    lora: "DEGRADED",
    amplitude: 0.34,
  },
  "Excess Load": {
    rms: 1.62,
    peak: 3.48,
    fft: 22.6,
    anomaly: 0.91,
    health: 42,
    rssi: -84,
    delivery: 91.4,
    latency: 428,
    status: "CRITICAL",
    lora: "DEGRADED",
    amplitude: 0.58,
  },
};

const bridgeId = "NORTH_CHANNEL_BRIDGE";
const defaultNodeId = "GS-01";
const clients = new Set<{ send: (payload: string) => void }>();
let activeScenario: ScenarioName = "Normal Operation";
let mode: Mode = "DEMO";
let tick = 0;
let simulatorStarted = false;

function isScenarioName(value: unknown): value is ScenarioName {
  return typeof value === "string" && scenarioNames.includes(value as ScenarioName);
}

function getProfile(scenario = activeScenario) {
  return profiles[scenario];
}

function waveformFor(profile: Profile, offset = tick) {
  return Array.from({ length: 56 }, (_, index) => {
    const baseline = Math.sin((index + offset) * 0.55) * profile.amplitude;
    const secondary = Math.sin((index + offset) * 0.17) * profile.amplitude * 0.45;
    const jointShift =
      activeScenario === "Loose Joint" && index % 9 === 0 ? profile.amplitude * 2.1 : 0;
    const loadSpike =
      activeScenario === "Excess Load" && index % 17 === 0 ? profile.amplitude * 1.5 : 0;
    return Number((baseline + secondary + jointShift + loadSpike).toFixed(3));
  });
}

function statusFromScore(score: number): TelemetryStatus {
  if (score >= 0.85) return "CRITICAL";
  if (score >= 0.7) return "ANOMALY";
  if (score >= 0.2) return "WARNING";
  return "NORMAL";
}

function toLiveVibration(record: TelemetryLog): LiveVibration {
  return {
    node_id: record.nodeId,
    sampling_rate: record.samplingRate,
    rms_g: record.rmsG,
    peak_to_peak_g: record.peakToPeakG,
    fft_peak_hz: record.fftPeakHz,
    waveform: record.rawWaveform,
    anomaly_score: record.anomalyScore,
    status: record.status,
    timestamp: record.timestamp.toISOString(),
  };
}

async function writeEvent(
  eventType: string,
  input: { nodeId?: string; severity: "NORMAL" | "WARNING" | "CRITICAL"; anomalyScore?: number; message: string },
) {
  await db.insert(systemEvents).values({
    eventType,
    nodeId: input.nodeId ?? defaultNodeId,
    bridgeId,
    severity: input.severity,
    anomalyScore: input.anomalyScore,
    message: input.message,
  });
}

function broadcast(event: "telemetry_stream" | "alert_triggered", data: unknown) {
  const payload = JSON.stringify({ event, data });
  for (const client of clients) {
    try {
      client.send(payload);
    } catch (error) {
      logger.warn({ error }, "Unable to broadcast telemetry event");
    }
  }
}

export function registerClient(client: { send: (payload: string) => void }) {
  clients.add(client);
  return () => clients.delete(client);
}

async function persistFrame(input: TelemetryInput, source: Mode) {
  const nodeId = input.node_id ?? defaultNodeId;
  const bridge = input.bridge_id ?? bridgeId;
  const status = input.status;
  const [record] = await db
    .insert(telemetryLogs)
    .values({
      nodeId,
      bridgeId: bridge,
      samplingRate: input.sampling_rate,
      rmsG: input.rms_g,
      peakToPeakG: input.peak_to_peak_g,
      fftPeakHz: input.fft_peak_hz,
      rawWaveform: input.waveform_samples,
      anomalyScore: input.anomaly_score,
      status,
    })
    .returning();

  const profile = getProfile();
  await db
    .insert(networkPosture)
    .values({
      nodeId,
      loraStatus: input.anomaly_score >= 0.85 ? "DEGRADED" : profile.lora,
      rssiDbm: input.rssi_dbm,
      activeNodesCount: input.anomaly_score >= 0.85 ? 1 : 2,
      totalNodesCount: 2,
      packetDeliveryPct: input.anomaly_score >= 0.85 ? 91.4 : profile.delivery,
      gatewayLatencyMs: input.anomaly_score >= 0.85 ? 428 : profile.latency,
      bridgeHealthPct: profile.health,
    })
    .onConflictDoUpdate({
      target: networkPosture.nodeId,
      set: {
        loraStatus: input.anomaly_score >= 0.85 ? "DEGRADED" : profile.lora,
        rssiDbm: input.rssi_dbm,
        activeNodesCount: input.anomaly_score >= 0.85 ? 1 : 2,
        packetDeliveryPct: input.anomaly_score >= 0.85 ? 91.4 : profile.delivery,
        gatewayLatencyMs: input.anomaly_score >= 0.85 ? 428 : profile.latency,
        bridgeHealthPct: profile.health,
        updatedAt: new Date(),
      },
    });

  const severity = status === "CRITICAL" ? "CRITICAL" : status === "NORMAL" ? "NORMAL" : "WARNING";
  await writeEvent(
    source === "LIVE" ? "Sensor packet received" : status === "NORMAL" ? "System heartbeat" : "Alert Triggered",
    {
      nodeId,
      severity,
      anomalyScore: input.anomaly_score,
      message:
        status === "NORMAL"
          ? "Telemetry frame accepted and compared with the healthy baseline."
          : status === "CRITICAL"
            ? "Structural vibration exceeds the critical operating envelope."
            : "Telemetry deviation requires operator review.",
    },
  );

  const vibration = toLiveVibration(record);
  const currentPosture = {
    bridge_health: profile.health,
    lora_network_status: input.anomaly_score >= 0.85 ? "DEGRADED" : profile.lora,
    active_nodes: input.anomaly_score >= 0.85 ? "1/2" : "2/2",
    rssi_dbm: input.rssi_dbm,
    active_alerts_count: status === "NORMAL" ? 0 : 1,
  };
  broadcast("telemetry_stream", { ...vibration, ...currentPosture, source });
  if (input.anomaly_score > 0.7) {
    broadcast("alert_triggered", {
      node_id: nodeId,
      bridge_id: bridge,
      anomaly_score: input.anomaly_score,
      status,
      timestamp: vibration.timestamp,
    });
  }
  return record;
}

function frameForScenario(): TelemetryInput {
  const profile = getProfile();
  return {
    node_id: defaultNodeId,
    bridge_id: bridgeId,
    sampling_rate: 100,
    rms_g: Number((profile.rms + Math.sin(tick * 0.4) * profile.rms * 0.04).toFixed(3)),
    peak_to_peak_g: profile.peak,
    fft_peak_hz: profile.fft,
    anomaly_score: profile.anomaly,
    status: profile.status,
    rssi_dbm: profile.rssi,
    waveform_samples: waveformFor(profile),
  };
}

export async function ingestTelemetry(input: TelemetryInput) {
  mode = "LIVE";
  return persistFrame(input, "LIVE");
}

export async function setScenario(scenario: ScenarioName) {
  activeScenario = scenario;
  mode = "DEMO";
  tick += 1;
  return persistFrame(frameForScenario(), "DEMO");
}

export async function setMode(nextMode: Mode) {
  mode = nextMode;
  if (nextMode === "DEMO") {
    tick += 1;
    await persistFrame(frameForScenario(), "DEMO");
  }
  return getDashboardSummary();
}

export async function resetSystem() {
  activeScenario = "Normal Operation";
  mode = "DEMO";
  tick = 0;
  const record = await persistFrame(frameForScenario(), "DEMO");
  await writeEvent("System heartbeat", {
    severity: "NORMAL",
    anomalyScore: 0.08,
    message: "System reset completed. Active anomalies cleared and nominal telemetry restored.",
  });
  return record;
}

export async function getLatestTelemetry() {
  const [record] = await db.select().from(telemetryLogs).orderBy(desc(telemetryLogs.timestamp)).limit(1);
  if (!record) {
    await setScenario("Normal Operation");
    const [seeded] = await db.select().from(telemetryLogs).orderBy(desc(telemetryLogs.timestamp)).limit(1);
    return seeded;
  }
  return record;
}

export async function getLiveVibration() {
  const record = await getLatestTelemetry();
  return toLiveVibration(record);
}

export async function getNetworkPosture() {
  const latest = await getLatestTelemetry();
  const [posture] = await db
    .select()
    .from(networkPosture)
    .where(eq(networkPosture.nodeId, latest.nodeId))
    .limit(1);
  return posture
    ? {
        node_id: posture.nodeId,
        lora_status: posture.loraStatus,
        rssi_dbm: posture.rssiDbm,
        active_nodes_count: posture.activeNodesCount,
        total_nodes_count: posture.totalNodesCount,
        packet_delivery_pct: posture.packetDeliveryPct,
        gateway_latency_ms: posture.gatewayLatencyMs,
        bridge_health_pct: posture.bridgeHealthPct,
        updated_at: posture.updatedAt.toISOString(),
      }
    : {
        node_id: latest.nodeId,
        lora_status: "CONNECTED" as const,
        rssi_dbm: -72,
        active_nodes_count: 2,
        total_nodes_count: 2,
        packet_delivery_pct: 98.7,
        gateway_latency_ms: 184,
        bridge_health_pct: 98,
        updated_at: new Date().toISOString(),
      };
}

export async function getRecentEvents(limit: number) {
  const events = await db.select().from(systemEvents).orderBy(desc(systemEvents.timestamp)).limit(limit);
  return events.map((event) => ({
    id: event.id,
    event_type: event.eventType,
    node_id: event.nodeId,
    bridge_id: event.bridgeId,
    severity: event.severity,
    anomaly_score: event.anomalyScore,
    message: event.message,
    timestamp: event.timestamp.toISOString(),
  }));
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const latest = await getLatestTelemetry();
  const posture = await getNetworkPosture();
  return {
    bridge_health: posture.bridge_health_pct,
    tinyml_status: latest.status,
    anomaly_score: latest.anomalyScore,
    lora_network_status: posture.lora_status,
    active_nodes: `${posture.active_nodes_count}/${posture.total_nodes_count}`,
    rssi_dbm: posture.rssi_dbm,
    active_alerts_count: latest.status === "NORMAL" ? 0 : 1,
    mode,
    scenario: activeScenario,
    last_updated: latest.timestamp.toISOString(),
  };
}

export async function initializeTelemetry() {
  const [latest] = await db.select({ id: telemetryLogs.id }).from(telemetryLogs).limit(1);
  if (!latest) await setScenario("Normal Operation");
}

export function startSimulator() {
  if (simulatorStarted) return;
  simulatorStarted = true;
  setInterval(() => {
    if (mode !== "DEMO") return;
    tick += 1;
    void persistFrame(frameForScenario(), "DEMO").catch((error) =>
      logger.error({ error }, "Demo telemetry tick failed"),
    );
  }, 1500);
}

export function scenarioFromInput(value: unknown): ScenarioName | null {
  return isScenarioName(value) ? value : null;
}
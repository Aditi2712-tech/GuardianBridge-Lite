import { Router, type IRouter } from "express";
import { getDashboardSummary, resetSystem, setMode, type Mode } from "../services/telemetry";

const router: IRouter = Router();

router.post("/v1/system/reset", async (_req, res, next) => {
  try {
    await resetSystem();
    res.json(await getDashboardSummary());
  } catch (error) {
    next(error);
  }
});

router.post("/v1/system/mode", async (req, res, next) => {
  const requested = req.body?.mode;
  if (requested !== "LIVE" && requested !== "DEMO") {
    res.status(400).json({ message: "mode must be LIVE or DEMO" });
    return;
  }
  try {
    res.json(await setMode(requested as Mode));
  } catch (error) {
    next(error);
  }
});

export default router;
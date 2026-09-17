import { Router, type IRouter } from "express";
import healthRouter from "./health";
import telemetryRouter from "./telemetry";
import systemRouter from "./system";

const router: IRouter = Router();

router.use(healthRouter);
router.use(telemetryRouter);
router.use(systemRouter);

export default router;

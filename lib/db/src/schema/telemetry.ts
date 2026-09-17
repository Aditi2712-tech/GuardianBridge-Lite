import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const telemetryStatusEnum = pgEnum("telemetry_status", [
  "NORMAL",
  "WARNING",
  "ANOMALY",
  "CRITICAL",
]);

export const loraStatusEnum = pgEnum("lora_status", [
  "CONNECTED",
  "DISCONNECTED",
  "DEGRADED",
]);

export const eventSeverityEnum = pgEnum("event_severity", [
  "NORMAL",
  "WARNING",
  "CRITICAL",
]);

export const telemetryLogs = pgTable("telemetry_logs", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull(),
  bridgeId: text("bridge_id").notNull(),
  samplingRate: integer("sampling_rate").notNull(),
  rmsG: real("rms_g").notNull(),
  peakToPeakG: real("peak_to_peak_g").notNull(),
  fftPeakHz: real("fft_peak_hz").notNull(),
  rawWaveform: jsonb("raw_waveform").$type<number[]>().notNull(),
  anomalyScore: real("anomaly_score").notNull(),
  status: telemetryStatusEnum("status").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const networkPosture = pgTable("network_posture", {
  nodeId: text("node_id").primaryKey(),
  loraStatus: loraStatusEnum("lora_status").notNull(),
  rssiDbm: integer("rssi_dbm").notNull(),
  activeNodesCount: integer("active_nodes_count").notNull(),
  totalNodesCount: integer("total_nodes_count").notNull(),
  packetDeliveryPct: real("packet_delivery_pct").notNull(),
  gatewayLatencyMs: integer("gateway_latency_ms").notNull(),
  bridgeHealthPct: integer("bridge_health_pct").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const systemEvents = pgTable("system_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  nodeId: text("node_id").notNull(),
  bridgeId: text("bridge_id").notNull(),
  severity: eventSeverityEnum("severity").notNull(),
  anomalyScore: real("anomaly_score"),
  message: text("message"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export type TelemetryLog = typeof telemetryLogs.$inferSelect;
export type NetworkPosture = typeof networkPosture.$inferSelect;
export type SystemEvent = typeof systemEvents.$inferSelect;
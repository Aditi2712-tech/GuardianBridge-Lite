export type DemoScenario = 'normal' | 'vibration' | 'joint' | 'load';

export interface Bridge {
  id: string;
  name: string;
  location: string;
  health: number;
  sensors: string[];
}

export interface SensorNode {
  id: string;
  bridgeId: string;
  status: 'online' | 'warning' | 'offline';
  battery: number;
  rssi: number;
  vibration: number;
  tilt: number;
  lastPacket: string;
  position: { x: number; y: number };
}

export interface SensorReading {
  time: string;
  value: number;
}

export interface TinyMLResult {
  status: 'NORMAL' | 'WARNING' | 'ANOMALY';
  anomalyScore: number;
}

export interface Alert {
  id: string;
  title: string;
  bridgeId: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  time: string;
}

export interface LoRaStatus {
  state: 'CONNECTED' | 'DEGRADED' | 'OFFLINE';
  nodes: number;
  totalNodes: number;
  rssi: number;
}
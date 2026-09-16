import type { Alert, Bridge, DemoScenario, LoRaStatus, SensorNode, SensorReading, TinyMLResult } from '@/types';

export const bridge: Bridge = {
  id: 'GB-01',
  name: 'North Channel Bridge',
  location: 'Bay District · Span 04',
  health: 94,
  sensors: ['GB-01-N01', 'GB-01-N02'],
};

export const sensorNodes: SensorNode[] = [
  { id: 'GB-01-N01', bridgeId: 'GB-01', status: 'online', battery: 87, rssi: -68, vibration: 0.28, tilt: 0.04, lastPacket: '21:51:42', position: { x: 28, y: 54 } },
  { id: 'GB-01-N02', bridgeId: 'GB-01', status: 'online', battery: 92, rssi: -72, vibration: 0.31, tilt: 0.06, lastPacket: '21:51:40', position: { x: 72, y: 54 } },
];

export const loraStatus: LoRaStatus = { state: 'CONNECTED', nodes: 2, totalNodes: 2, rssi: -72 };

type ScenarioStats = {
  sampling: string; rms: string; peak: string; fft: string; tilt: string;
  score: number; health: number; nodeVibration: number; nodeTilt: number;
  risk: 'LOW' | 'WARNING' | 'CRITICAL'; tinyMlStatus: TinyMLResult['status'];
};

const scenarioValues: Record<DemoScenario, ScenarioStats> = {
  normal: { sampling: '100 Hz', rms: '0.31 g', peak: '0.72 g', fft: '14.2 Hz', tilt: '0.8°', score: 0.08, health: 94, nodeVibration: 0.31, nodeTilt: 0.05, risk: 'LOW', tinyMlStatus: 'NORMAL' },
  vibration: { sampling: '100 Hz', rms: '0.58 g', peak: '1.46 g', fft: '18.7 Hz', tilt: '1.4°', score: 0.55, health: 78, nodeVibration: 0.58, nodeTilt: 0.08, risk: 'WARNING', tinyMlStatus: 'ANOMALY' },
  joint: { sampling: '100 Hz', rms: '0.76 g', peak: '2.12 g', fft: '7.8 Hz', tilt: '2.6°', score: 0.73, health: 67, nodeVibration: 0.76, nodeTilt: 0.19, risk: 'WARNING', tinyMlStatus: 'ANOMALY' },
  load: { sampling: '100 Hz', rms: '1.02 g', peak: '2.88 g', fft: '22.6 Hz', tilt: '3.9°', score: 0.88, health: 48, nodeVibration: 1.02, nodeTilt: 0.32, risk: 'CRITICAL', tinyMlStatus: 'CRITICAL ANOMALY' },
};

export function getScenarioStats(scenario: DemoScenario) {
  return scenarioValues[scenario];
}

export function getTinyMlResult(scenario: DemoScenario): TinyMLResult {
  const stats = scenarioValues[scenario];
  return { anomalyScore: stats.score, status: stats.tinyMlStatus, risk: stats.risk };
}

export function getScenarioNodes(scenario: DemoScenario): SensorNode[] {
  const stats = scenarioValues[scenario];
  return sensorNodes.map((node, index) => ({
    ...node,
    vibration: stats.nodeVibration + (index ? 0.03 : 0),
    tilt: stats.nodeTilt + (index ? 0.02 : 0),
    status: scenario === 'load' && index === 1 ? 'offline' : scenario === 'joint' && index === 1 ? 'warning' : 'online',
    rssi: scenario === 'joint' ? node.rssi - 5 : scenario === 'load' ? node.rssi - 9 : node.rssi,
  }));
}

export function getScenarioLoRaStatus(scenario: DemoScenario): LoRaStatus {
  return { ...loraStatus, state: scenario === 'load' ? 'DEGRADED' : 'CONNECTED', rssi: scenario === 'joint' ? -77 : scenario === 'load' ? -84 : -72 };
}

export function getAlerts(scenario: DemoScenario): Alert[] {
  const base: Alert[] = [
    { id: 'evt-01', title: 'System heartbeat', bridgeId: 'GB-01', severity: 'NORMAL', time: '21:52:14', message: 'Gateway and sensor fabric responding within expected latency.', loraStatus: 'CONNECTED' },
    { id: 'evt-02', title: 'Sensor packet received', bridgeId: 'GB-01', nodeId: 'GB-01-N01', severity: 'NORMAL', time: '21:51:42', message: 'Telemetry packet accepted by GB-GW-01.', loraStatus: 'CONNECTED' },
    { id: 'evt-04', title: 'TinyML classification', bridgeId: 'GB-01', severity: 'NORMAL', time: '21:47:10', message: 'Baseline comparison completed with no anomaly detected.', anomalyScore: 0.08, loraStatus: 'STANDBY' },
  ];
  if (scenario === 'vibration') base.unshift({ id: 'evt-vibration', title: 'Vibration deviation', bridgeId: 'GB-01', nodeId: 'GB-01-N01', severity: 'WARNING', time: '21:52:03', message: 'Acceleration RMS is above the healthy baseline.', anomalyScore: 0.55, loraStatus: 'CONNECTED' });
  if (scenario === 'joint') base.unshift({ id: 'evt-joint', title: 'Loose joint signature', bridgeId: 'GB-01', nodeId: 'GB-01-N02', severity: 'WARNING', time: '21:51:56', message: 'Low-frequency vibration and tilt deviation detected.', anomalyScore: 0.73, loraStatus: 'PACKET TRANSMITTED' });
  if (scenario === 'load') base.unshift({ id: 'evt-load', title: 'Excess load anomaly', bridgeId: 'GB-01', nodeId: 'GB-01-N02', severity: 'CRITICAL', time: '21:51:48', message: 'Structural vibration exceeds critical operating envelope.', anomalyScore: 0.88, loraStatus: 'PACKET TRANSMITTED' });
  return base;
}

export const alerts = getAlerts('normal');

export function getBridges(scenario: DemoScenario): Bridge[] {
  return [
    { ...bridge, health: scenarioValues[scenario].health },
    { id: 'GB-02', name: 'East Approach Bridge', location: 'Bay District · Span 09', health: 72, sensors: ['GB-02-N01', 'GB-02-N02'] },
  ];
}

export function getWaveform(scenario: DemoScenario): SensorReading[] {
  const labels = Array.from({ length: 56 }, (_, index) => `${21 + Math.floor(index / 56)}:${String(Math.floor((index / 56) * 60)).padStart(2, '0')}`);
  return labels.map((time, index) => {
    const wave = Math.sin(index * 0.55) * 0.05 + Math.sin(index * 0.17) * 0.025;
    const variation =
      scenario === 'normal' ? wave :
      scenario === 'vibration' ? Math.sin(index * 0.92) * 0.15 + Math.sin(index * 0.21) * 0.08 :
      scenario === 'joint' ? wave + (index % 9 === 0 ? 0.36 : index % 9 === 1 ? -0.22 : 0) + Math.sin(index * 1.4) * 0.08 :
      Math.sin(index * 0.37) * 0.11 + Math.sin(index * 0.86) * 0.055 + 0.09;
    const multiplier = scenario === 'normal' ? 1 : scenario === 'vibration' ? 1.45 : scenario === 'joint' ? 1.8 : 2.25;
    return { time, value: Number((variation * multiplier + 0.5).toFixed(3)) };
  });
}

export const scenarioLabels: Record<DemoScenario, string> = {
  normal: 'Normal Operation',
  vibration: 'Increased Vibration',
  joint: 'Loose Joint',
  load: 'Excess Load',
};
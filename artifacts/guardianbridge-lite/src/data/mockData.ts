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

export const alerts: Alert[] = [
  { id: 'evt-01', title: 'System heartbeat', bridgeId: 'GB-01', severity: 'NORMAL', time: '21:52:14' },
  { id: 'evt-02', title: 'Sensor packet received', bridgeId: 'GB-01', severity: 'NORMAL', time: '21:51:42' },
  { id: 'evt-03', title: 'Vibration deviation', bridgeId: 'GB-02', severity: 'WARNING', time: '21:47:08' },
  { id: 'evt-04', title: 'TinyML classification', bridgeId: 'GB-02', severity: 'NORMAL', time: '21:47:10' },
];

const scenarioValues: Record<DemoScenario, { sampling: string; rms: string; peak: string; fft: string; score: number; health: number; nodeVibration: number; nodeTilt: number }> = {
  normal: { sampling: '100 Hz', rms: '0.31 g', peak: '0.72 g', fft: '14.2 Hz', score: 0.08, health: 94, nodeVibration: 0.31, nodeTilt: 0.05 },
  vibration: { sampling: '100 Hz', rms: '0.58 g', peak: '1.46 g', fft: '18.7 Hz', score: 0.34, health: 83, nodeVibration: 0.58, nodeTilt: 0.08 },
  joint: { sampling: '100 Hz', rms: '0.76 g', peak: '2.12 g', fft: '7.8 Hz', score: 0.71, health: 68, nodeVibration: 0.76, nodeTilt: 0.19 },
  load: { sampling: '100 Hz', rms: '0.49 g', peak: '1.21 g', fft: '11.6 Hz', score: 0.29, health: 86, nodeVibration: 0.49, nodeTilt: 0.12 },
};

export function getScenarioStats(scenario: DemoScenario) {
  return scenarioValues[scenario];
}

export function getTinyMlResult(scenario: DemoScenario): TinyMLResult {
  const score = scenarioValues[scenario].score;
  return { anomalyScore: score, status: score > 0.6 ? 'ANOMALY' : score > 0.2 ? 'WARNING' : 'NORMAL' };
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
    return { time, value: Number((variation + 0.5).toFixed(3)) };
  });
}

export const scenarioLabels: Record<DemoScenario, string> = {
  normal: 'Normal Operation',
  vibration: 'Increased Vibration',
  joint: 'Loose Joint',
  load: 'Excess Load',
};
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getDashboardSummary,
  getLiveVibration,
  getNetworkPosture,
  getRecentEvents,
  resetSystem as resetSystemRequest,
  setSimulationScenario,
  setSystemMode,
  type DashboardSummary,
  type LiveVibration,
  type NetworkPosture,
  type RecentEvent,
  type Scenario,
} from '@workspace/api-client-react';
import type { DemoScenario } from '@/types';
import { scenarioLabels } from '@/data/mockData';

const scenarioKeys: DemoScenario[] = ['normal', 'vibration', 'joint', 'load'];
const scenarioToLabel = (scenario: DemoScenario): Scenario => scenarioLabels[scenario] as Scenario;
const labelToScenario = (label: string): DemoScenario => scenarioKeys.find((key) => scenarioLabels[key] === label) ?? 'normal';

const defaultSummary: DashboardSummary = {
  bridge_health: 98,
  tinyml_status: 'NORMAL',
  anomaly_score: 0.08,
  lora_network_status: 'CONNECTED',
  active_nodes: '2/2',
  rssi_dbm: -72,
  active_alerts_count: 0,
  mode: 'DEMO',
  scenario: 'Normal Operation',
  last_updated: new Date(0).toISOString(),
};

const defaultVibration: LiveVibration = {
  node_id: 'GS-01',
  sampling_rate: 100,
  rms_g: 0.31,
  peak_to_peak_g: 0.72,
  fft_peak_hz: 14.2,
  waveform: Array.from({ length: 56 }, (_, index) => Number((Math.sin(index * 0.55) * 0.08 + Math.sin(index * 0.17) * 0.03).toFixed(3))),
  anomaly_score: 0.08,
  status: 'NORMAL',
  timestamp: new Date(0).toISOString(),
};

const defaultPosture: NetworkPosture = {
  node_id: 'GS-01',
  lora_status: 'CONNECTED',
  rssi_dbm: -72,
  active_nodes_count: 2,
  total_nodes_count: 2,
  packet_delivery_pct: 98.7,
  gateway_latency_ms: 184,
  bridge_health_pct: 98,
  updated_at: new Date(0).toISOString(),
};

interface DemoContextValue {
  isDemo: boolean;
  scenario: DemoScenario;
  summary: DashboardSummary;
  vibration: LiveVibration;
  posture: NetworkPosture;
  events: RecentEvent[];
  pipelineStage: number;
  connected: boolean;
  error: string | null;
  setIsDemo: (value: boolean) => void;
  setMode: (value: 'LIVE' | 'DEMO') => Promise<void>;
  setScenario: (value: DemoScenario) => Promise<void>;
  resetSystem: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(true);
  const [scenario, setScenario] = useState<DemoScenario>('normal');
  const [summary, setSummary] = useState(defaultSummary);
  const [vibration, setVibration] = useState(defaultVibration);
  const [posture, setPosture] = useState(defaultPosture);
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [pipelineStage, setPipelineStage] = useState(4);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSnapshot = useCallback(async () => {
    try {
      const [nextSummary, nextVibration, nextPosture, nextEvents] = await Promise.all([
        getDashboardSummary(),
        getLiveVibration(),
        getNetworkPosture(),
        getRecentEvents({ limit: 10 }),
      ]);
      setSummary(nextSummary);
      setVibration(nextVibration);
      setPosture(nextPosture);
      setEvents(nextEvents);
      setIsDemo(nextSummary.mode === 'DEMO');
      setScenario(labelToScenario(nextSummary.scenario));
      setError(null);
    } catch {
      setError('Telemetry API unavailable');
    }
  }, []);

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshSnapshot]);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: number | undefined;
    let socket: WebSocket | undefined;
    const connect = () => {
      if (disposed) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/ws/hardware`);
      socket.onopen = () => setConnected(true);
      socket.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data) as { event: string; data: LiveVibration & Partial<DashboardSummary> & { source?: 'LIVE' | 'DEMO' } };
          if (payload.event !== 'telemetry_stream') return;
          const next = payload.data;
          setVibration(next);
          setSummary((current) => ({
            ...current,
            bridge_health: next.bridge_health ?? current.bridge_health,
            tinyml_status: next.status,
            anomaly_score: next.anomaly_score,
            lora_network_status: next.lora_network_status ?? current.lora_network_status,
            active_nodes: next.active_nodes ?? current.active_nodes,
            rssi_dbm: next.rssi_dbm ?? current.rssi_dbm,
            active_alerts_count: next.active_alerts_count ?? current.active_alerts_count,
            mode: next.source === 'LIVE' ? 'LIVE' : 'DEMO',
            last_updated: next.timestamp,
          }));
          setPipelineStage((current) => (current + 1) % 5);
          if (next.source === 'DEMO') setIsDemo(true);
          void getRecentEvents({ limit: 10 }).then(setEvents).catch(() => undefined);
        } catch {
          setError('Received an invalid telemetry frame');
        }
      };
      socket.onclose = () => {
        setConnected(false);
        if (!disposed) reconnectTimer = window.setTimeout(connect, 2000);
      };
      socket.onerror = () => setConnected(false);
    };
    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const chooseScenario = useCallback(async (value: DemoScenario) => {
    setScenario(value);
    setIsDemo(true);
    try {
      const next = await setSimulationScenario({ scenario: scenarioToLabel(value) });
      setSummary(next);
      setError(null);
    } catch {
      setError('Unable to change simulation scenario');
    }
  }, []);

  const chooseMode = useCallback(async (value: 'LIVE' | 'DEMO') => {
    setIsDemo(value === 'DEMO');
    try {
      const next = await setSystemMode({ mode: value });
      setSummary(next);
      setScenario(labelToScenario(next.scenario));
      setError(null);
    } catch {
      setError('Unable to change telemetry mode');
    }
  }, []);

  const resetSystem = useCallback(async () => {
    setIsDemo(true);
    setScenario('normal');
    try {
      const next = await resetSystemRequest();
      setSummary(next);
      await refreshSnapshot();
    } catch {
      setError('Unable to reset telemetry system');
    }
  }, [refreshSnapshot]);

  const value = useMemo(() => ({
    isDemo,
    scenario,
    summary,
    vibration,
    posture,
    events,
    pipelineStage,
    connected,
    error,
    setIsDemo,
    setMode: chooseMode,
    setScenario: chooseScenario,
    resetSystem,
  }), [isDemo, scenario, summary, vibration, posture, events, pipelineStage, connected, error, chooseMode, chooseScenario, resetSystem]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
}
import { Activity, BrainCircuit, CheckCircle2, CircleAlert, Radio, ShieldCheck } from 'lucide-react';
import { useDemo } from '@/context/DemoContext';
import { bridge, getAlerts, getScenarioLoRaStatus, getScenarioStats, getTinyMlResult } from '@/data/mockData';
import { BridgeVisualization } from '@/components/BridgeVisualization';
import { DemoControls } from '@/components/DemoControls';
import { EventList } from '@/components/EventList';
import { Pipeline } from '@/components/Pipeline';
import { SensorChart } from '@/components/SensorChart';
import { StatusCard } from '@/components/StatusCard';

export function Dashboard() {
  const { scenario, isDemo } = useDemo();
  const activeScenario = isDemo ? scenario : 'normal';
  const stats = getScenarioStats(activeScenario);
  const tinyMl = getTinyMlResult(activeScenario);
  const radio = getScenarioLoRaStatus(activeScenario);
  const activeAlerts = getAlerts(activeScenario).filter((item) => item.severity !== 'NORMAL').length;
  const critical = stats.risk === 'CRITICAL';
  const warning = stats.risk === 'WARNING';
  const postureLabel = critical ? 'Critical review' : warning ? 'Monitor closely' : 'Nominal';
  const postureDescription = critical ? 'Critical simulated telemetry requires immediate review.' : warning ? 'Elevated simulated telemetry requires operator attention.' : 'All field devices responding within expected latency.';
  return (
    <main className="technical-grid min-h-[calc(100dvh-72px)] px-4 py-6 md:px-8 md:py-7">
      <div className="mx-auto max-w-[1480px] space-y-5">
        <div className="animate-rise-in flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mono mb-2 text-[10px] tracking-[0.2em] text-cyan-300/70">OPERATIONS / OVERVIEW / {bridge.id}</div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-[29px]">Good evening, Monitoring Team</h2>
            <p className="mt-1.5 text-[12px] text-slate-500">Here is the current state of the bridge monitoring network.</p>
          </div>
          <div className="mono border-l-2 border-cyan-300/60 pl-3 text-[10px] leading-relaxed text-slate-500">
            <div className="text-slate-300">FIELD WINDOW / NIGHT SHIFT</div>
            <div>UTC−07:00 · 21:52:14</div>
          </div>
        </div>

        <div className="animate-rise-in" style={{ animationDelay: '50ms' }}><DemoControls /></div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" style={{ animationDelay: '100ms' }}>
          <StatusCard label="BRIDGE HEALTH" value={`${stats.health}%`} detail={stats.health > 90 ? 'Healthy' : stats.health > 75 ? 'Monitor' : 'Inspect'} icon={<ShieldCheck size={15} />} tone={critical ? 'red' : warning ? 'amber' : 'green'} />
          <StatusCard label="TINYML STATUS" value={tinyMl.status} detail={`Anomaly Score ${tinyMl.anomalyScore.toFixed(2)}`} icon={<BrainCircuit size={15} />} tone={critical ? 'red' : tinyMl.status === 'NORMAL' ? 'cyan' : 'amber'} />
          <StatusCard label="LORA NETWORK" value={radio.state} detail={`${radio.nodes} / ${radio.totalNodes} Nodes · RSSI ${radio.rssi} dBm`} icon={<Radio size={15} />} tone={critical ? 'red' : radio.state === 'CONNECTED' ? 'cyan' : 'amber'} />
          <StatusCard label="ACTIVE ALERTS" value={`${activeAlerts}`} detail={activeAlerts ? 'Review required' : 'No critical anomalies'} icon={<CircleAlert size={15} />} tone={critical ? 'red' : activeAlerts ? 'amber' : 'green'} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,.85fr)]">
          <SensorChart />
          <BridgeVisualization />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(390px,.8fr)]">
          <EventList />
          <section className="panel p-5" data-testid="card-network-posture">
            <div className="flex items-start justify-between"><div><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">NETWORK POSTURE</div><div className="mono mt-1 text-[9px] text-slate-500">CURRENT FIELD CONNECTIVITY</div></div><Activity size={16} className="text-cyan-300" /></div>
            <div className="mt-5 flex items-center gap-4"><div className={`flex h-14 w-14 items-center justify-center rounded-full border ${critical ? 'border-rose-300/30 bg-rose-300/[0.06]' : warning ? 'border-amber-300/30 bg-amber-300/[0.06]' : 'border-emerald-300/30 bg-emerald-300/[0.06]'}`}><CheckCircle2 size={26} className={critical ? 'text-rose-300' : warning ? 'text-amber-300' : 'text-emerald-300'} /></div><div><div className="text-lg font-semibold text-slate-100">{postureLabel}</div><p className="mt-1 text-[11px] text-slate-500">{postureDescription}</p></div></div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="border border-slate-700/70 bg-slate-950/15 p-3"><div className="mono text-[9px] text-slate-500">PACKET DELIVERY</div><div className="mt-1 text-[15px] text-slate-200">{critical ? '91.4%' : warning ? '96.2%' : '98.7%'}</div></div>
              <div className="border border-slate-700/70 bg-slate-950/15 p-3"><div className="mono text-[9px] text-slate-500">GATEWAY LATENCY</div><div className="mt-1 text-[15px] text-slate-200">{critical ? '428 ms' : warning ? '246 ms' : '184 ms'}</div></div>
            </div>
          </section>
        </div>

        <Pipeline />
        <footer className="flex flex-col justify-between gap-2 pb-2 pt-1 text-[10px] text-slate-600 sm:flex-row"><span>GUARDIANBRIDGE LITE · INFRASTRUCTURE SIGNAL INTELLIGENCE</span><span className="mono">MOCK DATA FABRIC / BUILD 0.8.4</span></footer>
      </div>
    </main>
  );
}
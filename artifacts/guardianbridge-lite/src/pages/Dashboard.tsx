import { Activity, BrainCircuit, CheckCircle2, CircleAlert, Radio, ShieldCheck } from 'lucide-react';
import { useDemo } from '@/context/DemoContext';
import { bridge, getScenarioStats, getTinyMlResult, loraStatus } from '@/data/mockData';
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
          <StatusCard label="BRIDGE HEALTH" value={`${stats.health}%`} detail={stats.health > 90 ? 'Healthy' : stats.health > 75 ? 'Monitor' : 'Inspect'} icon={<ShieldCheck size={15} />} tone={stats.health > 90 ? 'green' : 'amber'} />
          <StatusCard label="TINYML STATUS" value={tinyMl.status} detail={`Anomaly Score ${tinyMl.anomalyScore.toFixed(2)}`} icon={<BrainCircuit size={15} />} tone={tinyMl.status === 'NORMAL' ? 'cyan' : 'amber'} />
          <StatusCard label="LORA NETWORK" value={loraStatus.state} detail={`${loraStatus.nodes} / ${loraStatus.totalNodes} Nodes · RSSI ${loraStatus.rssi} dBm`} icon={<Radio size={15} />} tone="cyan" />
          <StatusCard label="ACTIVE ALERTS" value="0" detail="No critical anomalies" icon={<CircleAlert size={15} />} tone="green" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,.85fr)]">
          <SensorChart />
          <BridgeVisualization />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(390px,.8fr)]">
          <EventList />
          <section className="panel p-5" data-testid="card-network-posture">
            <div className="flex items-start justify-between"><div><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">NETWORK POSTURE</div><div className="mono mt-1 text-[9px] text-slate-500">CURRENT FIELD CONNECTIVITY</div></div><Activity size={16} className="text-cyan-300" /></div>
            <div className="mt-5 flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/[0.06]"><CheckCircle2 size={26} className="text-emerald-300" /></div><div><div className="text-lg font-semibold text-slate-100">Nominal</div><p className="mt-1 text-[11px] text-slate-500">All field devices responding within expected latency.</p></div></div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="border border-slate-700/70 bg-slate-950/15 p-3"><div className="mono text-[9px] text-slate-500">PACKET DELIVERY</div><div className="mt-1 text-[15px] text-slate-200">98.7%</div></div>
              <div className="border border-slate-700/70 bg-slate-950/15 p-3"><div className="mono text-[9px] text-slate-500">GATEWAY LATENCY</div><div className="mt-1 text-[15px] text-slate-200">184 ms</div></div>
            </div>
          </section>
        </div>

        <Pipeline />
        <footer className="flex flex-col justify-between gap-2 pb-2 pt-1 text-[10px] text-slate-600 sm:flex-row"><span>GUARDIANBRIDGE LITE · INFRASTRUCTURE SIGNAL INTELLIGENCE</span><span className="mono">MOCK DATA FABRIC / BUILD 0.8.4</span></footer>
      </div>
    </main>
  );
}
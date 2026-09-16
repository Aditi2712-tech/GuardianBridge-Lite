import { ArrowLeft, BatteryMedium, CircleAlert, Radio, ShieldCheck, Waves } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useDemo } from '@/context/DemoContext';
import { getBridges, getScenarioNodes, getScenarioStats, getTinyMlResult } from '@/data/mockData';
import { ConsolePage } from '@/components/layout/ConsolePage';
import { MetricTile } from '@/components/MetricTile';
import { TelemetryChart } from '@/components/TelemetryCharts';

export function BridgeDetails() {
  const { id = 'GB-01' } = useParams<{ id: string }>();
  const { scenario, isDemo } = useDemo();
  const active = isDemo ? scenario : 'normal';
  const bridge = getBridges(active).find((item) => item.id === id) ?? getBridges(active)[0];
  const stats = getScenarioStats(active);
  const tiny = getTinyMlResult(active);
  const nodes = getScenarioNodes(active).map((node) => ({ ...node, id: bridge.id === 'GB-01' ? node.id : node.id.replace('GB-01', bridge.id), bridgeId: bridge.id }));
  const onlineNodes = nodes.filter((node) => node.status === 'online').length;
  return <ConsolePage eyebrow={`OPERATIONS / BRIDGES / ${bridge.id}`} title="Bridge Details" subtitle={`${bridge.name} · ${bridge.location}`}>
    <Link href="/bridges" data-testid="link-back-bridges" className="inline-flex items-center gap-2 text-[11px] text-cyan-300 transition-colors hover:text-cyan-100"><ArrowLeft size={14} />BACK TO BRIDGES</Link>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="BRIDGE ID" value={bridge.id} detail="ACTIVE ASSET" icon={<ShieldCheck size={15} />} />
      <MetricTile label="HEALTH" value={`${bridge.health}%`} detail={tiny.risk} tone={tiny.risk === 'CRITICAL' ? 'red' : tiny.risk === 'WARNING' ? 'amber' : 'green'} icon={<ShieldCheck size={15} />} />
      <MetricTile label="STATUS" value={tiny.risk === 'LOW' ? 'HEALTHY' : 'MONITOR'} detail="SIMULATED" tone={tiny.risk === 'LOW' ? 'green' : 'amber'} icon={<CircleAlert size={15} />} />
      <MetricTile label="LAST UPDATE" value="21:52:14" detail="UTC" icon={<Radio size={15} />} />
    </div>
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <section className="panel p-5"><div className="flex items-center justify-between"><div><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">SENSOR NODES</div><div className="mono mt-1 text-[9px] text-slate-500">FIELD TELEMETRY / {bridge.id}</div></div><span className={`mono text-[9px] ${onlineNodes === nodes.length ? 'text-emerald-300' : 'text-amber-300'}`}>{onlineNodes}/{nodes.length} ONLINE</span></div><div className="mt-4 space-y-2">{nodes.map((node) => <div key={node.id} className="border border-slate-700/70 bg-slate-950/15 p-3" data-testid={`bridge-node-${node.id}`}><div className="flex items-center justify-between"><div className="mono text-[11px] text-cyan-200">{node.id}</div><span className={`text-[9px] font-semibold ${node.status === 'online' ? 'text-emerald-300' : node.status === 'offline' ? 'text-rose-300' : 'text-amber-300'}`}>{node.status.toUpperCase()}</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-[10px]"><span className="text-slate-500"><Waves size={12} className="mb-1 text-cyan-300" />{node.vibration.toFixed(2)} g</span><span className="text-slate-500"><BatteryMedium size={12} className="mb-1 text-cyan-300" />{node.battery}%</span><span className="text-slate-500"><Radio size={12} className="mb-1 text-cyan-300" />{node.rssi} dBm</span></div></div>)}</div></section>
      <section className="panel p-5"><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">MONITORING SUMMARY</div><div className="mt-4 grid grid-cols-2 gap-px border border-slate-700/70 bg-slate-700/70 sm:grid-cols-4">{[['RMS', stats.rms], ['PEAK-TO-PEAK', stats.peak], ['FFT PEAK', stats.fft], ['TILT DEVIATION', stats.tilt]].map(([label, value]) => <div key={label} className="bg-[#152638] p-3"><div className="mono text-[8px] text-slate-500">{label}</div><div className="mono mt-2 text-[14px] text-slate-100">{value}</div></div>)}</div><div className="mt-5 text-[10px] text-slate-500">Values are simulated for demonstration and are not live structural measurements.</div></section>
    </div>
    <div className="grid gap-5 lg:grid-cols-2"><TelemetryChart kind="vibration" title="VIBRATION TREND" subtitle={`${bridge.id} · RMS envelope · SIMULATED`} /><TelemetryChart kind="health" title="HEALTH TREND" subtitle={`${bridge.id} · projected posture · SIMULATED`} /></div>
    <section className="panel p-5"><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">RECENT EVENTS</div><div className="mt-3 divide-y divide-slate-700/50">{['Telemetry window synchronized', `${tiny.status} classification recorded`, 'Gateway acknowledged node packets'].map((event, index) => <div key={event} className="flex items-center justify-between py-3 first:pt-0"><span className="text-[11px] text-slate-300">{event}</span><span className="mono text-[9px] text-slate-500">{index === 1 && tiny.risk !== 'LOW' ? '21:51:48' : '21:52:14'} UTC</span></div>)}</div></section>
  </ConsolePage>;
}
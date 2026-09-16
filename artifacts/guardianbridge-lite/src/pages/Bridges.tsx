import { ArrowUpRight, CircleAlert, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useDemo } from '@/context/DemoContext';
import { getBridges, getScenarioNodes, getScenarioStats } from '@/data/mockData';
import { ConsolePage } from '@/components/layout/ConsolePage';

export function Bridges() {
  const { scenario, isDemo } = useDemo();
  const active = isDemo ? scenario : 'normal';
  const stats = getScenarioStats(active);
  const bridges = getBridges(active);
  const primaryNodes = getScenarioNodes(active);
  return <ConsolePage eyebrow="OPERATIONS / ASSETS" title="Bridges" subtitle="Monitor the health and connectivity of your bridge infrastructure.">
    <div className="flex items-center justify-between border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-3"><div><div className="text-[11px] font-medium text-cyan-100">Infrastructure register</div><div className="mono mt-1 text-[9px] text-slate-500">DEMO DATA · LAST POLLED 21:52:14 UTC</div></div><div className="mono text-[10px] text-cyan-200">{bridges.length.toString().padStart(2, '0')} ASSETS / {isDemo ? 'SIMULATED' : 'READ ONLY'}</div></div>
    <div className="grid gap-5 lg:grid-cols-2">{bridges.map((item, index) => {
      const risk = index === 0 ? stats.risk : 'MEDIUM';
      const isCritical = risk === 'CRITICAL';
      const isWarning = risk === 'WARNING' || risk === 'MEDIUM';
      const health = index === 0 ? item.health : item.health;
      const onlineNodes = index === 0 ? primaryNodes.filter((node) => node.status === 'online').length : item.sensors.length;
      return <Link href={`/bridges/${item.id}`} key={item.id} data-testid={`link-bridge-${item.id}`} className="panel group block p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-cyan-300/35">
        <div className="flex items-start justify-between"><div><div className="mono text-[10px] tracking-[0.16em] text-cyan-300">{item.id}</div><h3 className="mt-1 text-lg font-semibold text-slate-100">{item.name}</h3><div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><MapPin size={12} />{item.location}</div></div><ArrowUpRight size={17} className="text-slate-600 transition-colors group-hover:text-cyan-300" /></div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-slate-700/60 py-4"><div><div className="mono text-[9px] text-slate-500">HEALTH</div><div className={`mt-1 text-2xl font-semibold ${isCritical ? 'text-rose-200' : isWarning ? 'text-amber-200' : 'text-emerald-200'}`}>{health}%</div></div><div><div className="mono text-[9px] text-slate-500">RISK</div><div className={`mt-2 flex items-center gap-1.5 text-[10px] font-semibold ${isCritical ? 'text-rose-300' : isWarning ? 'text-amber-300' : 'text-emerald-300'}`}>{isCritical ? <ShieldAlert size={13} /> : isWarning ? <CircleAlert size={13} /> : <ShieldCheck size={13} />}{risk}</div></div><div><div className="mono text-[9px] text-slate-500">NODES</div><div className="mt-2 text-[12px] text-slate-200">{onlineNodes}/{item.sensors.length} ONLINE</div></div></div>
        <div className="mt-4 h-2 overflow-hidden bg-slate-800"><div className={`h-full ${isCritical ? 'bg-rose-300' : isWarning ? 'bg-amber-300' : 'bg-emerald-300'}`} style={{ width: `${health}%` }} /></div><div className="mt-3 flex justify-between mono text-[9px] text-slate-500"><span>LAST UPDATE 21:52:14 UTC</span><span>{risk}</span></div>
      </Link>;
    })}</div>
  </ConsolePage>;
}
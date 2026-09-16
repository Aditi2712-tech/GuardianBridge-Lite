import { ArrowUpRight, CheckCircle2, CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { getAlerts } from '@/data/mockData';
import { useDemo } from '@/context/DemoContext';

export function EventList() {
  const [expanded, setExpanded] = useState(false);
  const { scenario, isDemo } = useDemo();
  const alerts = getAlerts(isDemo ? scenario : 'normal');
  return (
    <section className="panel p-5" data-testid="card-recent-events">
      <div className="flex items-start justify-between">
        <div><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">RECENT EVENTS</div><div className="mono mt-1 text-[9px] text-slate-500">NETWORK ACTIVITY / LAST 15 MIN</div></div>
        <button data-testid="button-view-all-events" onClick={() => setExpanded((value) => !value)} className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200">{expanded ? 'COLLAPSE' : 'VIEW ALL'} <ArrowUpRight size={12} /></button>
      </div>
      <div className="mt-4 divide-y divide-slate-700/50">
        {alerts.map((event) => {
          const warning = event.severity === 'WARNING';
          return <div key={event.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" data-testid={`event-row-${event.id}`}>
            {warning ? <CircleAlert size={15} className="shrink-0 text-amber-300" /> : <CheckCircle2 size={15} className="shrink-0 text-emerald-300" />}
            <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-medium text-slate-200">{event.title}</div><div className="mono mt-1 text-[9px] text-slate-500">{event.bridgeId}</div></div>
            <div className="text-right"><div className="mono text-[10px] text-slate-400">{event.time}</div><span className={`mt-1 inline-block text-[8px] font-semibold tracking-[0.12em] ${warning ? 'text-amber-300' : 'text-emerald-300'}`}>{event.severity}</span></div>
          </div>;
        })}
      </div>
      {expanded && <div className="mt-4 border-t border-cyan-300/20 pt-3 text-[10px] text-cyan-200">Event archive is ready for the next telemetry window. No additional events in the current mock feed.</div>}
    </section>
  );
}
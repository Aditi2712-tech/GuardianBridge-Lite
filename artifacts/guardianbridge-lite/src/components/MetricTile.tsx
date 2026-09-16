import type { ReactNode } from 'react';

export function MetricTile({ label, value, detail, tone = 'cyan', icon }: { label: string; value: string; detail?: string; tone?: 'cyan' | 'green' | 'amber' | 'red'; icon?: ReactNode }) {
  const toneMap = { cyan: 'text-cyan-200 border-cyan-300/20 bg-cyan-300/[0.05]', green: 'text-emerald-300 border-emerald-300/20 bg-emerald-300/[0.05]', amber: 'text-amber-200 border-amber-300/20 bg-amber-300/[0.05]', red: 'text-rose-200 border-rose-300/20 bg-rose-300/[0.05]' };
  return <div className="panel min-h-[102px] p-4 transition-transform duration-200 hover:-translate-y-0.5" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
    <div className="flex items-start justify-between gap-3"><div className="mono text-[9px] tracking-[0.16em] text-slate-500">{label}</div>{icon && <div className={`flex h-7 w-7 items-center justify-center border ${toneMap[tone]}`}>{icon}</div>}</div>
    <div className="mt-3 flex items-end justify-between gap-2"><div className="mono text-[19px] text-slate-100">{value}</div>{detail && <div className={`text-right text-[9px] font-semibold ${toneMap[tone].split(' ')[0]}`}>{detail}</div>}</div>
  </div>;
}
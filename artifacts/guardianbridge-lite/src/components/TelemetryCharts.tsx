import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getScenarioStats, getWaveform } from '@/data/mockData';
import { useDemo } from '@/context/DemoContext';

type ChartKind = 'acceleration' | 'gyroscope' | 'vibration' | 'health';

export function TelemetryChart({ kind, title, subtitle }: { kind: ChartKind; title: string; subtitle?: string }) {
  const { scenario, isDemo } = useDemo();
  const active = isDemo ? scenario : 'normal';
  const stats = getScenarioStats(active);
  const data = useMemo(() => getWaveform(active).map((item, index) => {
    const base = item.value - 0.5;
    if (kind === 'gyroscope') return { ...item, value: Number((base * 42 + Math.sin(index * .28) * 2).toFixed(3)) };
    if (kind === 'acceleration') return { ...item, value: Number((base * 1.6 + Math.cos(index * .38) * .06).toFixed(3)) };
    if (kind === 'health') return { ...item, value: Number((stats.health + Math.sin(index * .22) * (active === 'normal' ? 1 : 4) - index * (active === 'load' ? .06 : .015)).toFixed(2)) };
    return item;
  }), [active, kind]);
  const color = kind === 'health' ? '#63e6a3' : kind === 'gyroscope' ? '#b9a8ff' : '#5de0ed';
  return <section className="panel min-w-0 p-4 md:p-5" data-testid={`chart-${kind}`}>
    <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-semibold tracking-[0.17em] text-slate-100">{title}</div><div className="mono mt-1 text-[9px] text-slate-500">{subtitle ?? 'MPU6050 · 100 Hz · SIMULATED STREAM'}</div></div><span className="mono border border-slate-700/80 px-2 py-1 text-[9px] text-slate-500">{kind === 'health' ? '%' : 'LIVE'}</span></div>
    <div className="mt-4 h-[205px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="rgba(130, 166, 183, .11)" strokeDasharray="2 5" vertical={false} /><XAxis dataKey="time" tick={{ fill: '#647b8a', fontSize: 9, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} interval={13} /><YAxis tick={{ fill: '#647b8a', fontSize: 9, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#16283a', border: '1px solid rgba(122,181,198,.28)', borderRadius: 2, fontSize: 10 }} labelStyle={{ color: '#8aa0ad' }} itemStyle={{ color }} formatter={(value) => [value, kind]} /><Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive animationDuration={500} /></LineChart></ResponsiveContainer></div>
  </section>;
}
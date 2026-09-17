import { Activity } from 'lucide-react';
import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDemo } from '@/context/DemoContext';

export function SensorChart() {
  const { vibration, isDemo } = useDemo();
  const readings = useMemo(() => vibration.waveform.map((value, index) => ({
    time: `${String(Math.floor(index / 60)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}`,
    value: Number((value + 0.5).toFixed(3)),
  })), [vibration.waveform]);
  return (
    <section className="panel panel-accent min-w-0 p-5" data-testid="card-live-vibration">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-100"><Activity size={15} className="text-cyan-300" />LIVE VIBRATION</div>
          <div className="mono mt-1 text-[9px] text-slate-500">MPU6050 <span className="text-slate-700">•</span> GB-01</div>
        </div>
        <div className="flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-cyan-300" />
          <span className="mono text-[9px] tracking-[0.12em] text-cyan-200">{isDemo ? 'SIMULATION' : 'STREAMING'}</span>
        </div>
      </div>
      <div className="mt-5 h-[215px] w-full" data-testid="chart-vibration-waveform">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={readings} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="rgba(130, 166, 183, .11)" strokeDasharray="2 5" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#647b8a', fontSize: 9, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} interval={13} />
            <YAxis domain={[0, 1.15]} tick={{ fill: '#647b8a', fontSize: 9, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value.toFixed(1)}`} />
            <Tooltip contentStyle={{ background: '#16283a', border: '1px solid rgba(122,181,198,.28)', borderRadius: 2, fontSize: 10 }} labelStyle={{ color: '#8aa0ad' }} itemStyle={{ color: '#68e5f1' }} formatter={(value) => [`${value} g`, 'vibration']} />
            <Line type="monotone" dataKey="value" stroke="#5de0ed" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#b7f8ff', stroke: '#102030', strokeWidth: 2 }} isAnimationActive animationDuration={500} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 border-t border-slate-700/60 pt-4 sm:grid-cols-4">
        {[
           ['SAMPLING RATE', `${vibration.sampling_rate} Hz`],
           ['RMS', `${vibration.rms_g.toFixed(2)} g`],
           ['PEAK-TO-PEAK', `${vibration.peak_to_peak_g.toFixed(2)} g`],
           ['FFT PEAK', `${vibration.fft_peak_hz.toFixed(1)} Hz`],
        ].map(([label, value]) => (
          <div key={label} className="border-r border-slate-700/60 px-3 first:pl-0 last:border-0">
            <div className="mono text-[8px] tracking-[0.11em] text-slate-500">{label}</div>
            <div className="mono mt-1 text-[12px] text-slate-200" data-testid={`value-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
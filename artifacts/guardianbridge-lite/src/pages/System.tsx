import { CheckCircle2, Cpu, DatabaseZap, Radio, RotateCcw, Router, Settings2, Waves } from 'lucide-react';
import { useDemo } from '@/context/DemoContext';
import { getScenarioLoRaStatus, getScenarioStats } from '@/data/mockData';
import { ConsolePage } from '@/components/layout/ConsolePage';
import { MetricTile } from '@/components/MetricTile';
import { Pipeline } from '@/components/Pipeline';

const systemToneClasses = {
  emerald: {
    panel: 'border-emerald-300/20 bg-emerald-300/[0.04]',
    icon: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300',
    title: 'text-emerald-100',
  },
  amber: {
    panel: 'border-amber-300/20 bg-amber-300/[0.04]',
    icon: 'border-amber-300/30 bg-amber-300/10 text-amber-300',
    title: 'text-amber-100',
  },
  rose: {
    panel: 'border-rose-300/20 bg-rose-300/[0.04]',
    icon: 'border-rose-300/30 bg-rose-300/10 text-rose-300',
    title: 'text-rose-100',
  },
} as const;

export function System() {
  const { scenario, isDemo, resetSystem } = useDemo();
  const active = isDemo ? scenario : 'normal';
  const stats = getScenarioStats(active);
  const lora = getScenarioLoRaStatus(active);
  const systemState = stats.risk === 'CRITICAL' ? 'ELEVATED' : stats.risk === 'WARNING' ? 'MONITORING' : 'ONLINE';
  const systemTone = stats.risk === 'CRITICAL' ? 'rose' : stats.risk === 'WARNING' ? 'amber' : 'emerald';
  const stateClasses = systemToneClasses[systemTone];
  const hardware = [['ESP32', 'MICROCONTROLLER', Cpu], ['MPU6050', 'ACCEL / GYRO SENSOR', Waves], ['LORA NODE', 'RADIO TRANSCEIVER', Radio], ['LORA GATEWAY', 'GB-GW-01', Router]] as const;
  return <ConsolePage eyebrow="SYSTEM / CONFIGURATION" title="System" subtitle="Inspect connected hardware, signal processing, and the GuardianBridge Lite project architecture.">
    <div className={`flex flex-col justify-between gap-4 ${stateClasses.panel} p-4 sm:flex-row sm:items-center`}><div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center ${stateClasses.icon}`}><CheckCircle2 size={18} /></div><div><div className={`text-[12px] font-semibold ${stateClasses.title}`}>SYSTEM STATUS · {systemState}</div><div className="mono mt-1 text-[9px] text-slate-500">SIMULATED FABRIC / SCENARIO AWARE</div></div></div><button data-testid="button-reset-system" onClick={() => { if (window.confirm('Reset the simulated system to Normal Operation?')) resetSystem(); }} className="inline-flex items-center justify-center gap-2 border border-amber-300/30 bg-amber-300/[0.06] px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-amber-200 transition-colors hover:border-amber-300/70 hover:bg-amber-300/10"><RotateCcw size={13} />RESET SYSTEM</button></div>
    <section className="panel p-5"><div className="flex items-center justify-between"><div><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">CONNECTED HARDWARE</div><div className="mono mt-1 text-[9px] text-slate-500">FIELD DEVICES / READ ONLY</div></div><DatabaseZap size={17} className="text-cyan-300" /></div><div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{hardware.map(([name, detail, Icon]) => <div key={name} className="border border-slate-700/70 bg-slate-950/15 p-4"><div className="flex items-center justify-between"><Icon size={17} className="text-cyan-300" /><span className="h-2 w-2 rounded-full bg-emerald-300" /></div><div className="mt-4 text-[12px] font-medium text-slate-200">{name}</div><div className="mono mt-1 text-[9px] text-slate-500">{detail}</div><div className="mt-3 text-[9px] font-semibold tracking-[0.12em] text-emerald-300">CONNECTED</div></div>)}</div></section>
    <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]"><section className="panel p-5"><div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">CONFIGURATION</div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{[['SAMPLING RATE', stats.sampling], ['COMMUNICATION', 'LoRa 433 MHz'], ['SENSOR', 'MPU6050'], ['MICROCONTROLLER', 'ESP32'], ['ML ENGINE', 'TinyML'], ['RADIO STATE', lora.state]].map(([label, value]) => <MetricTile key={label} label={label} value={value} detail="CONFIGURED" />)}</div></section><section className="panel p-5"><div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-100"><Settings2 size={15} className="text-cyan-300" />RUNTIME</div><div className="mt-5 space-y-4">{[['MODEL VERSION', 'GB-TINYML-0.8'], ['UPTIME', '18D 04H 32M'], ['GATEWAY LATENCY', '184 ms'], ['DATA MODE', isDemo ? 'SIMULATED' : 'READ ONLY']].map(([label, value]) => <div key={label} className="flex justify-between border-b border-slate-700/50 pb-3"><span className="mono text-[9px] text-slate-500">{label}</span><span className="mono text-[10px] text-slate-200">{value}</span></div>)}</div></section></div>
    <section className="panel p-5"><div className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-100">PROJECT ARCHITECTURE</div><Pipeline /><div className="mt-4 flex flex-wrap gap-2 text-[9px] text-slate-500"><span className="border border-slate-700 px-2 py-1">FRONTEND CONSOLE</span><span className="border border-slate-700 px-2 py-1">CENTRAL MOCK DATA</span><span className="border border-slate-700 px-2 py-1">REST / WEBSOCKET READY</span></div></section>
  </ConsolePage>;
}
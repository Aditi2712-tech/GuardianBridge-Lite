import { FlaskConical, RadioTower } from 'lucide-react';
import { useDemo } from '@/context/DemoContext';
import { scenarioLabels } from '@/data/mockData';
import type { DemoScenario } from '@/types';

const scenarios: DemoScenario[] = ['normal', 'vibration', 'joint', 'load'];

export function DemoControls() {
  const { isDemo, setIsDemo, scenario, setScenario } = useDemo();
  return (
    <section className="panel flex flex-col gap-4 p-3.5 md:flex-row md:items-center md:justify-between" data-testid="section-demo-controls">
      <div className="flex items-center gap-3">
        <div className="flex rounded border border-slate-700 bg-slate-950/20 p-0.5">
          <button data-testid="button-mode-live" onClick={() => setIsDemo(false)} className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] transition-colors ${!isDemo ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}><RadioTower size={13} />LIVE</button>
          <button data-testid="button-mode-demo" onClick={() => setIsDemo(true)} className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] transition-colors ${isDemo ? 'bg-cyan-300 text-[#102030]' : 'text-slate-500 hover:text-slate-300'}`}><FlaskConical size={13} />DEMO</button>
        </div>
        <div className="hidden h-5 w-px bg-slate-700 md:block" />
        <div>
          <div className="text-[11px] font-semibold text-slate-200">{isDemo ? 'Test scenario' : 'Live telemetry'}</div>
          <div className="mono text-[9px] text-slate-500">{isDemo ? 'SIMULATED SENSOR INPUT' : 'CONNECTED TO FIELD GATEWAY'}</div>
        </div>
      </div>
      {isDemo && (
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((item) => (
            <button key={item} data-testid={`button-scenario-${item}`} onClick={() => setScenario(item)} className={`border px-2.5 py-1.5 text-[10px] transition-colors ${scenario === item ? 'border-cyan-300/70 bg-cyan-300/10 text-cyan-200' : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}>{scenarioLabels[item]}</button>
          ))}
        </div>
      )}
    </section>
  );
}
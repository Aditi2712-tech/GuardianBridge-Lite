import { ArrowRight, Cpu, Radio, Router, ScanLine, Waves } from 'lucide-react';

const steps = [
  { label: 'SENSING', detail: 'MPU6050', icon: Waves },
  { label: 'FEATURE EXTRACTION', detail: 'RMS · Peak-to-Peak · FFT', icon: ScanLine },
  { label: 'TINYML', detail: 'Anomaly Score', icon: Cpu },
  { label: 'LORA', detail: 'Emergency Packet', icon: Radio },
  { label: 'GATEWAY', detail: 'Monitoring', icon: Router },
];

export function Pipeline({ activeStage = 4 }: { activeStage?: number }) {
  return (
    <section className="panel overflow-hidden p-4 md:p-5" data-testid="card-engineering-pipeline">
      <div className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-slate-400">SIGNAL PATH / ENGINEERING PIPELINE</div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
        {steps.map(({ label, detail, icon: Icon }, index) => (
          <div key={label} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 border border-slate-700/70 bg-slate-950/15 px-3 py-2.5">
               <Icon size={16} className={`shrink-0 ${index === activeStage ? 'text-cyan-200' : 'text-slate-600'}`} />
               <div className="min-w-0"><div className={`truncate text-[9px] font-semibold tracking-[0.12em] ${index === activeStage ? 'text-cyan-100' : 'text-slate-500'}`}>{label}</div><div className="mono mt-1 truncate text-[9px] text-slate-500">{index === activeStage ? 'PROCESSING FRAME' : detail}</div></div>
            </div>
            {index < steps.length - 1 && <ArrowRight size={15} className="mx-2 hidden shrink-0 text-slate-600 md:block" />}
          </div>
        ))}
      </div>
    </section>
  );
}
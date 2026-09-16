import { DemoControls } from '@/components/DemoControls';
import type { ReactNode } from 'react';

export function ConsolePage({ children, eyebrow, title, subtitle }: { children: ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return (
    <main className="technical-grid min-h-[calc(100dvh-72px)] px-4 py-6 md:px-8 md:py-7">
      <div className="mx-auto max-w-[1480px] space-y-5">
        <div className="animate-rise-in flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mono mb-2 text-[10px] tracking-[0.2em] text-cyan-300/70">{eyebrow}</div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-[29px]">{title}</h2>
            <p className="mt-1.5 max-w-2xl text-[12px] text-slate-500">{subtitle}</p>
          </div>
          <div className="mono border-l-2 border-cyan-300/60 pl-3 text-[10px] leading-relaxed text-slate-500">
            <div className="text-slate-300">FIELD WINDOW / NIGHT SHIFT</div>
            <div>UTC−07:00 · 21:52:14</div>
          </div>
        </div>
        <DemoControls />
        {children}
        <footer className="flex flex-col justify-between gap-2 pb-2 pt-1 text-[10px] text-slate-600 sm:flex-row"><span>GUARDIANBRIDGE LITE · INFRASTRUCTURE SIGNAL INTELLIGENCE</span><span className="mono">SIMULATED TELEMETRY / BUILD 0.8.4</span></footer>
      </div>
    </main>
  );
}
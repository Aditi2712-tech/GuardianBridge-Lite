import type { ReactNode } from 'react';

interface StatusCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: 'cyan' | 'green' | 'amber';
}

const toneClasses = {
  cyan: 'text-cyan-300 bg-cyan-300/10 border-cyan-300/20',
  green: 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20',
  amber: 'text-amber-300 bg-amber-300/10 border-amber-300/20',
};

export function StatusCard({ label, value, detail, icon, tone }: StatusCardProps) {
  return (
    <div className="panel group min-h-[124px] p-4 transition-transform duration-200 hover:-translate-y-0.5" data-testid={`card-status-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="flex items-start justify-between">
        <div className="text-[9px] font-semibold tracking-[0.2em] text-slate-500">{label}</div>
        <div className={`flex h-7 w-7 items-center justify-center border ${toneClasses[tone]}`}>{icon}</div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-[24px] font-semibold tracking-tight text-slate-100">{value}</div>
        <div className={`mb-1 text-right text-[10px] font-medium ${toneClasses[tone].split(' ')[0]}`}>{detail}</div>
      </div>
    </div>
  );
}
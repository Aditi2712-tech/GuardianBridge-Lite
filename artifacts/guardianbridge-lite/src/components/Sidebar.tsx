import { Activity, BellRing, Cable, ChevronRight, CircleDot, LayoutDashboard, Radio, ScanLine, Settings2, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const primaryNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Bridges', icon: Cable, href: '/bridges' },
  { label: 'Live Monitoring', icon: Activity, href: '/live-monitoring' },
  { label: 'TinyML Analysis', icon: ScanLine, href: '/tinyml' },
  { label: 'Alerts', icon: BellRing, href: '/alerts' },
  { label: 'LoRa Network', icon: Radio, href: '/lora' },
];

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  return (
    <>
      {mobileOpen && <button aria-label="Close navigation" data-testid="button-close-navigation" className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-slate-700/60 bg-[#101d2c] px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-start justify-between px-2">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-7 w-7 items-center justify-center border border-cyan-300/70 bg-cyan-400/10">
                <div className="h-3.5 w-3.5 border border-cyan-300/90 rotate-45" />
                <span className="absolute h-px w-5 bg-cyan-300/80" />
              </div>
              <div>
                <div className="text-[13px] font-bold tracking-[0.14em] text-slate-100">GUARDIANBRIDGE</div>
                <div className="mono mt-0.5 text-[9px] tracking-[0.25em] text-cyan-300/75">LITE / v0.8.4</div>
              </div>
            </div>
            <p className="mt-5 pl-0.5 text-[9px] font-semibold tracking-[0.19em] text-slate-500">SMART INFRASTRUCTURE MONITORING</p>
          </div>
          <button aria-label="Close navigation" data-testid="button-close-sidebar" className="rounded p-1 text-slate-500 hover:bg-slate-700/40 hover:text-cyan-300 lg:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 space-y-1" aria-label="Primary navigation">
          {primaryNav.map(({ label, icon: Icon, href }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return <Link
              key={label}
              href={href}
              data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`}
              onClick={onClose}
              className={`group flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-[12px] font-medium tracking-wide transition-colors ${active ? 'border-cyan-300 bg-cyan-300/[0.08] text-cyan-200' : 'border-transparent text-slate-400 hover:border-slate-500 hover:bg-slate-800/45 hover:text-slate-200'}`}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.7} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-cyan-300/70" />}
            </Link>;
          })}
        </nav>

        <div className="mt-8 border-t border-slate-700/60 pt-5">
          <div className="px-3 text-[9px] font-semibold tracking-[0.22em] text-slate-600">SYSTEM</div>
          <div className="mt-3 flex items-center gap-3 px-3 text-[11px] text-slate-400">
            <CircleDot size={14} className="text-emerald-400" />
            <span>Telemetry fabric</span>
            <span className="ml-auto mono text-[9px] text-emerald-400">OK</span>
          </div>
          <Link href="/system" onClick={onClose} data-testid="nav-system" className={`mt-3 flex items-center gap-3 border-l-2 px-3 py-2.5 text-[12px] font-medium tracking-wide ${location.startsWith('/system') ? 'border-cyan-300 bg-cyan-300/[0.08] text-cyan-200' : 'border-transparent text-slate-400 hover:border-slate-500 hover:bg-slate-800/45 hover:text-slate-200'}`}>
            <Settings2 size={16} />
            <span>System</span>
            {location.startsWith('/system') && <ChevronRight size={14} className="ml-auto text-cyan-300/70" />}
          </Link>
        </div>

        <div className="mt-auto border-t border-slate-700/60 pt-4">
          <div className="flex items-center gap-2.5 px-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-semibold tracking-[0.16em] text-emerald-300">SYSTEM ONLINE</span>
          </div>
          <div className="mono mt-2 px-2 text-[9px] text-slate-600">UPTIME 18D 04H 32M</div>
        </div>
      </aside>
    </>
  );
}
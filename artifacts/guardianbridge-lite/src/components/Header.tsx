import { Bell, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onMenu: () => void;
}

export function Header({ onMenu }: HeaderProps) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="flex min-h-[72px] items-center justify-between border-b border-slate-700/60 bg-[#101d2c]/90 px-5 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <button aria-label="Open navigation" data-testid="button-open-navigation" onClick={onMenu} className="rounded border border-slate-700 p-2 text-slate-400 hover:border-cyan-400/50 hover:text-cyan-300 lg:hidden">
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-slate-100 md:text-[19px]">Dashboard</h1>
          <p className="mt-0.5 text-[11px] text-slate-500 md:text-xs">Real-time overview of your bridge monitoring network</p>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.5)]" />
          <span className="text-[10px] font-medium tracking-[0.14em] text-emerald-300">SYSTEM ONLINE</span>
        </div>
        <div className="hidden border-l border-slate-700/70 pl-5 text-right md:block">
          <div className="mono text-[10px] text-slate-400">LAST SYNC</div>
          <div className="mono mt-0.5 text-[10px] text-slate-600">21:52:14 UTC</div>
        </div>
        <div className="relative">
          <button aria-label="Notifications" data-testid="button-notifications" onClick={() => { setNoticeOpen((open) => !open); setProfileOpen(false); }} className={`relative rounded border p-2 transition-colors ${noticeOpen ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-200' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>
            <Bell size={17} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300" />
          </button>
          {noticeOpen && (
            <div className="panel absolute right-0 top-11 z-30 w-64 p-3">
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
                <span className="text-[11px] font-semibold text-slate-200">Notifications</span>
                <button aria-label="Close notifications" data-testid="button-close-notifications" onClick={() => setNoticeOpen(false)} className="text-slate-500 hover:text-slate-200"><X size={13} /></button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">No new critical anomalies. The telemetry fabric is operating within expected parameters.</p>
            </div>
          )}
        </div>
        <div className="relative">
          <button aria-label="Open profile" data-testid="button-profile" onClick={() => { setProfileOpen((open) => !open); setNoticeOpen(false); }} className="flex items-center gap-2 rounded border border-slate-700/80 bg-slate-800/40 px-2 py-1.5 text-slate-300 hover:border-cyan-300/40">
            <span className="flex h-6 w-6 items-center justify-center bg-slate-700 text-[10px] font-semibold text-cyan-200">MT</span>
            <span className="hidden text-[11px] font-medium text-slate-300 sm:block">Monitoring Team</span>
          </button>
          {profileOpen && (
            <div className="panel absolute right-0 top-11 z-30 w-48 p-3">
              <div className="flex items-center gap-2 border-b border-slate-700/70 pb-3">
                <UserRound size={15} className="text-cyan-300" />
                <div><div className="text-[11px] text-slate-200">Monitoring Team</div><div className="mono text-[9px] text-slate-500">READ ONLY CONSOLE</div></div>
              </div>
              <button data-testid="button-profile-settings" onClick={() => setProfileOpen(false)} className="mt-2 w-full rounded px-2 py-1.5 text-left text-[11px] text-slate-400 hover:bg-slate-700/50 hover:text-slate-200">Console preferences</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
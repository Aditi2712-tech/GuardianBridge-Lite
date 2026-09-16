import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DemoScenario } from '@/types';

interface DemoContextValue {
  isDemo: boolean;
  scenario: DemoScenario;
  setIsDemo: (value: boolean) => void;
  setScenario: (value: DemoScenario) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(true);
  const [scenario, setScenario] = useState<DemoScenario>('normal');
  const value = useMemo(() => ({ isDemo, scenario, setIsDemo, setScenario }), [isDemo, scenario]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
}
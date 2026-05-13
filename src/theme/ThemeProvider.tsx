import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Mode = 'light' | 'dark' | 'system';
export interface Theme {
  bg: string; card: string; text: string; sub: string; border: string; brand: string; muted: string; brandLight: string;
}

const Light: Theme = { bg: '#F8FAFC', card: '#FFFFFF', text: '#101828', sub: '#667085', border: '#E5E7EB', brand: '#FF7A2F', muted: '#F3F4F6', brandLight: '#FFF0E6' };
const Dark: Theme = { bg: '#141821', card: '#1B2230', text: '#F2F6FA', sub: '#C3CDD5', border: '#2E3A46', brand: '#FF7A2F', muted: '#222A33', brandLight: '#3A2010' };

function resolveAppearance(mode: Mode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

const Ctx = createContext<{ mode: Mode; appearance: 'light' | 'dark'; colors: Theme; setMode: (m: Mode) => void; cycleMode: () => void }>({
  mode: 'light',
  appearance: 'light',
  colors: Light,
  setMode: () => {},
  cycleMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('app_theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'light';
  });

  /** Follow OS light/dark when mode is system */
  const [systemTicks, setSystemTicks] = useState(0);
  const bumpSystem = useCallback(() => setSystemTicks((t) => t + 1), []);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => bumpSystem();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, bumpSystem]);

  const appearance = useMemo(() => resolveAppearance(mode), [mode, systemTicks]);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem('app_theme_mode', m);
  };

  const cycleMode = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  const colors = useMemo(() => (appearance === 'dark' ? Dark : Light), [appearance]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appearance);
    document.documentElement.style.setProperty('--bg', colors.bg);
    document.documentElement.style.setProperty('--card', colors.card);
    document.documentElement.style.setProperty('--text', colors.text);
    document.documentElement.style.setProperty('--brand', colors.brand);
    document.documentElement.style.setProperty('--border', colors.border);
    document.documentElement.style.colorScheme = appearance === 'dark' ? 'dark' : 'light';
  }, [appearance, colors]);

  const value = useMemo(
    () => ({ mode, appearance, colors, setMode, cycleMode }),
    [mode, appearance, colors, cycleMode],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

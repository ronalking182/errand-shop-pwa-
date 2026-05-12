import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Mode = 'light' | 'dark';
export interface Theme {
  bg: string; card: string; text: string; sub: string; border: string; brand: string; muted: string; brandLight: string;
}

const Light: Theme = { bg: '#F8FAFC', card: '#FFFFFF', text: '#101828', sub: '#667085', border: '#E5E7EB', brand: '#FF7A2F', muted: '#F3F4F6', brandLight: '#FFF0E6' };
const Dark: Theme = { bg: '#141821', card: '#1B2230', text: '#F2F6FA', sub: '#C3CDD5', border: '#2E3A46', brand: '#FF7A2F', muted: '#222A33', brandLight: '#3A2010' };

const Ctx = createContext<{ mode: Mode; colors: Theme; setMode: (m: Mode) => void }>({ mode: 'light', colors: Light, setMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('app_theme_mode');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const setMode = (m: Mode) => { setModeState(m); localStorage.setItem('app_theme_mode', m); };
  const colors = useMemo(() => mode === 'dark' ? Dark : Light, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.setProperty('--bg', colors.bg);
    document.documentElement.style.setProperty('--card', colors.card);
    document.documentElement.style.setProperty('--text', colors.text);
    document.documentElement.style.setProperty('--brand', colors.brand);
    document.documentElement.style.setProperty('--border', colors.border);
  }, [mode, colors]);

  return <Ctx.Provider value={{ mode, colors, setMode }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

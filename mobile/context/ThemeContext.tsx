// ธีม Context — สลับโหมดสว่าง/มืด
import React, { createContext, useContext, useMemo, useState } from 'react';
import { darkTheme, lightTheme, Theme } from '../constants/theme';

type ThemeCtx = { theme: Theme; isDark: boolean; toggle: () => void };
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const value = useMemo(
    () => ({ theme: isDark ? darkTheme : lightTheme, isDark, toggle: () => setIsDark((v) => !v) }),
    [isDark]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used within ThemeProvider');
  return v;
}


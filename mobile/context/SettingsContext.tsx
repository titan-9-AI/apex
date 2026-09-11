// SettingsContext — ค่าตั้งค่าระบบที่แอดมินแก้ได้ + บันทึก AsyncStorage และซิงก์ขึ้น Supabase
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { PLATFORMS, DURATIONS, SERVICE_PER_DAY, PAYMENT, CONTACT } from '../data/business';
import type { Platform, DurationOption } from '../data/business';

export type AppSettings = {
  servicePerDay: number;
  platforms: Platform[];
  durations: DurationOption[];
  payment: typeof PAYMENT;
  contact: typeof CONTACT;
};

const STORAGE = 'apex_settings';
const SUPABASE_TABLE = 'settings';

export function defaultSettings(): AppSettings {
  return {
    servicePerDay: SERVICE_PER_DAY,
    platforms: PLATFORMS.map((p) => ({ ...p })),
    durations: DURATIONS.map((d) => ({ ...d })),
    payment: { ...PAYMENT },
    contact: { ...CONTACT },
  };
}

type Ctx = {
  settings: AppSettings;
  loaded: boolean;
  synced: boolean;
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
  syncToCloud: () => Promise<{ ok: boolean; error?: string }>;
};

const C = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings());
  const [loaded, setLoaded] = useState(false);
  const [synced, setSynced] = useState(false);

  const mergeParsed = useCallback((parsed: Partial<AppSettings>): AppSettings => {
    const d = defaultSettings();
    return {
      servicePerDay: Number(parsed.servicePerDay) || d.servicePerDay,
      platforms: Array.isArray(parsed.platforms) && parsed.platforms.length ? parsed.platforms : d.platforms,
      durations: Array.isArray(parsed.durations) && parsed.durations.length ? parsed.durations : d.durations,
      payment: { ...d.payment, ...(parsed.payment ?? {}) },
      contact: { ...d.contact, ...(parsed.contact ?? {}) },
    };
  }, []);

  // โหลดจาก AsyncStorage ก่อน แล้วพยายามโหลดค่าล่าสุดจาก Supabase
  useEffect(() => {
    (async () => {
      let local: AppSettings | null = null;
      const raw = await AsyncStorage.getItem(STORAGE).catch(() => null);
      if (raw) {
        try { local = mergeParsed(JSON.parse(raw)); } catch { /* ignore */ }
      }
      if (local) setSettings(local);
      setLoaded(true);
      // โหลดค่าจาก cloud (ถ้ามี) — ใช้ค่าล่าสุด
      const { data } = await supabase.from(SUPABASE_TABLE).select('value').eq('id', 1).maybeSingle();
      if (data?.value) {
        const cloud = mergeParsed(typeof data.value === 'string' ? JSON.parse(data.value) : data.value);
        setSettings((prev) => {
          const next = { ...prev, ...cloud };
          AsyncStorage.setItem(STORAGE, JSON.stringify(next)).catch(() => {});
          return next;
        });
        setSynced(true);
      }
    })();
  }, [mergeParsed]);

  const persist = useCallback((s: AppSettings) => {
    AsyncStorage.setItem(STORAGE, JSON.stringify(s)).catch(() => {});
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next: AppSettings = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, [persist]);

  const reset = useCallback(() => {
    const d = defaultSettings();
    setSettings(d);
    persist(d);
  }, [persist]);

  const syncToCloud = useCallback(async () => {
    // upsert ค่าลงตาราง settings (row id=1) — ใช้ได้ทุกเครื่อง
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert({ id: 1, value: settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) return { ok: false, error: error.message };
    setSynced(true);
    return { ok: true };
  }, [settings]);

  return <C.Provider value={{ settings, loaded, synced, update, reset, syncToCloud }}>{children}</C.Provider>;
}

export function useSettings(): Ctx {
  const v = useContext(C);
  if (!v) throw new Error('useSettings must be used within SettingsProvider');
  return v;
}

// คำนวณราคารวมจากค่าตั้งค่าปัจจุบัน
export function calcTotal(s: AppSettings, platformIds: string[], days: number): number {
  const dur = s.durations.find((d) => d.days === days) ?? s.durations[0];
  const n = platformIds.length;
  const budget = platformIds.reduce((sum, id) => sum + (s.platforms.find((p) => p.id === id)?.dailyBudget ?? 0), 0);
  return s.servicePerDay * days + (dur?.aiFee ?? 0) * n + budget * days;
}


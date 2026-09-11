// Auth context — ระบบสมาชิก (รองรับ demo + Supabase Auth)
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// อีเมลเจ้าของระบบ (แอดมินจริง)
export const ADMIN_EMAIL = 'apexopus.t9@gmail.com';

export type Member = {
  email: string;
  name: string;
  role: 'member' | 'admin';
};

type AuthCtx = {
  member: Member | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const STORAGE = 'apex_member';
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE).then((raw) => {
      if (raw) {
        try { setMember(JSON.parse(raw)); } catch { /* ignore */ }
      }
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (m: Member | null) => {
    setMember(m);
    if (m) await AsyncStorage.setItem(STORAGE, JSON.stringify(m));
    else await AsyncStorage.removeItem(STORAGE);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const e = email.trim().toLowerCase();
    // บัญชี demo รองรับการเข้าสู่ระบบทันที
    if (e === 'demo@titan9.ai' && password === 'demo1234') {
      await persist({ email: e, name: 'สมาชิกทดลอง', role: 'member' });
      return { ok: true };
    }
    // พยายาม Supabase Auth สำหรับอีเมลจริง
    const { error } = await supabase.auth.signInWithPassword({ email: e, password });
    if (error) return { ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    const { data } = await supabase.auth.getUser();
    const em = data.user?.email ?? e;
    const isAdmin = em === ADMIN_EMAIL;
    await persist({ email: em, name: em.split('@')[0], role: isAdmin ? 'admin' : 'member' });
    return { ok: true };
  }, [persist]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const e = email.trim().toLowerCase();
    const { error } = await supabase.auth.signUp({ email: e, password, options: { data: { name } } });
    if (error) return { ok: false, error: error.message };
    const isAdmin = e === ADMIN_EMAIL;
    await persist({ email: e, name: name || e.split('@')[0], role: isAdmin ? 'admin' : 'member' });
    return { ok: true };
  }, [persist]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await persist(null);
  }, [persist]);

  return <Ctx.Provider value={{ member, loading, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}


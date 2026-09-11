// lib/api.ts — ชั้นเข้าถึงข้อมูล (Supabase) ที่เดียวของแอป
import { supabase } from './supabase';
import { TABLES } from './config';

export type Order = {
  id: string;
  email: string;
  name?: string;
  days: number;
  per_day: number;
  ai_fee: number;
  ad_spend: number;
  platforms: string[];
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  created_at: string;
};

export type ChatLog = {
  id?: string;
  email: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
};

export async function listOrders(opts: { email: string; isAdmin: boolean }) {
  let q = supabase.from(TABLES.orders).select('*').order('created_at', { ascending: false });
  if (!opts.isAdmin) q = q.eq('email', opts.email);
  const { data, error } = await q;
  if (error) return { data: [] as Order[], error: error.message };
  return { data: (data ?? []) as Order[], error: null as string | null };
}

export async function createOrder(order: Order) {
  const { error } = await supabase.from(TABLES.orders).insert(order);
  return { ok: !error, error: error?.message ?? null };
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const { error } = await supabase.from(TABLES.orders).update({ status }).eq('id', id);
  return { ok: !error, error: error?.message ?? null };
}

export async function logChat(msg: ChatLog) {
  const { error } = await supabase.from(TABLES.chatLogs).insert(msg);
  return { ok: !error, error: error?.message ?? null };
}

export async function listChatLogs(email: string, limit = 50) {
  const { data, error } = await supabase
    .from(TABLES.chatLogs)
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return { data: [] as ChatLog[], error: error.message };
  return { data: (data ?? []) as ChatLog[], error: null as string | null };
}

export function summarizeOrders(orders: Order[]) {
  const paid = orders.filter((o) => o.status === 'paid');
  return {
    count: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    paidCount: paid.length,
    total: orders.reduce((s, o) => s + (o.ad_spend ?? 0), 0),
    paidTotal: paid.reduce((s, o) => s + (o.ad_spend ?? 0), 0),
  };
}

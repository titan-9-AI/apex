// lib/config.ts — ค่ากลางของแอป (ที่เดียว)
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://pnluhkfzxtprnpwwcrlq.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubHVoa2Z6eHRwcm5wd3djcmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzYxMDQsImV4cCI6MjEwNDExMjEwNH0.NLOQx7yfSGMowDk6sf6mNhSeMrrXAmT2I0d7CRsdB98';

export const AI_ENDPOINT =
  process.env.EXPO_PUBLIC_AI_ENDPOINT ?? `${SUPABASE_URL}/functions/v1/titan9`;

export const APP_NAME = 'APEX TITAN-9 AI';
export const APP_SCHEME = 'apextitan9';

export const TABLES = {
  orders: 'orders',
  chatLogs: 'chat_logs',
  members: 'members',
  settings: 'settings',
  receipts: 'receipts',
} as const;

export const AI_HISTORY_LIMIT = 10;

// lib/ai.ts — ชั้นเรียก Titan-9 AI
// ลำดับ: เรียก Edge Function 'titan9' ก่อน -> ถ้าไม่พร้อม ใช้กฎตอบสำรอง (lib/titan.ts)
import { AI_ENDPOINT, AI_HISTORY_LIMIT } from './config';
import { replyByRules, type ChatMessage } from './titan';

export type AiResult = { reply: string; source: 'ai' | 'rules' };

/** เรียก Edge Function titan9 (OpenAI ผ่าน Supabase) */
async function askRemote(messages: ChatMessage[], email: string): Promise<string | null> {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.slice(-AI_HISTORY_LIMIT),
        email,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const reply = data?.reply ?? data?.choices?.[0]?.message?.content;
    return typeof reply === 'string' && reply.trim() ? reply : null;
  } catch {
    return null;
  }
}

/** ตอบคำถาม — ลอง AI จริงก่อน ถ้าไม่สำเร็จค่อยใช้กฎ */
export async function askTitan(messages: ChatMessage[], email: string): Promise<AiResult> {
  const remote = await askRemote(messages, email);
  if (remote) return { reply: remote, source: 'ai' };
  const last = messages[messages.length - 1]?.content ?? '';
  return { reply: replyByRules(last), source: 'rules' };
}

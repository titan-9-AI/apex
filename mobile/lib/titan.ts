================================================================
// คำตอบ Titan-9 AI แบบกฎ (rule-based) + เชื่อม AI จริงผ่าน Edge Function titan9
import { PLATFORMS, DURATIONS, SERVICE_PER_DAY, computeTotal, formatTHB, PAYMENT } from '../data/business';

export const AI_ENDPOINT = 'https://pnluhkfzxtprnpwwcrlq.supabase.co/functions/v1/titan9';
export const CONTACT_LINE = 'apex-titan9';

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

// ตอบด้วยกฎตามคีย์เวิร์ด (ไม่ต้องใช้เครดิต OpenAI)
export function replyByRules(text: string): string {
  const t = text.toLowerCase();
  const line = '\n\n';
  if (/ราคา|เท่าไหร่|คิดเงิน|ค่าบริการ/.test(t) && /7|แพ็ก/.test(t)) {
    return `แพ็ก 7 วัน ราคาเริ่มต้น (เลือก 1 แพลตฟอร์ม): ${formatTHB(computeTotal([PLATFORMS[0].id], 7))}` + line + `ค่าบริการ ${SERVICE_PER_DAY} บาท/วัน + ค่า AI ${formatTHB(DURATIONS[0].aiFee)} + งบโฆษณา (แพลตฟอร์มละ ${PLATFORMS[0].dailyBudget} บาท/วัน) อยากให้ผมช่วยคำนวณตามที่คุณเลือกไหมคะ?`;
  }
  if (/ราคา|เท่าไหร่/.test(t)) {
    return `ราคาเริ่มต้น ${SERVICE_PER_DAY} บาท/วัน (เลือกแพ็ก 7/15/30 วัน) + ค่า AI ตามระยะเวลา + งบโฆษณาต่อแพลตฟอร์ม` + line + `ลองพิมพ์ว่า "คิดราคา Facebook 7 วัน" เพื่อให้ผมคำนวณให้ได้เลยค่ะ`;
  }
  if (/ชำระ|โอน|จ่ายเงิน|ธนาคาร|กสิกร|truemoney|ทรูมันนี่/.test(t)) {
    return `ช่องทางชำระเงินของ APEX มี 2 ช่องทางค่ะ:` + line + `1) โอนผ่าน ${PAYMENT.bankName} เลขที่ ${PAYMENT.bankAccount} (${PAYMENT.bankHolder})` + line + `2) TrueMoney Wallet เบอร์ ${PAYMENT.trueMoney} (${PAYMENT.trueMoneyHolder})` + line + `โอนแล้วส่งสลิปแจ้งยืนยันในช่องแชตได้เลยนะคะ`;
  }
  if (/platform|แพลตฟอร์ม|ช่องทาง|facebook|ig|tiktok|line/.test(t)) {
    const list = PLATFORMS.map((p) => `• ${p.name} — งบ ${p.dailyBudget} บาท/วัน`).join(line);
    return `แพลตฟอร์มที่รองรับ ${PLATFORMS.length} ช่องทาง:` + line + list + line + `เลือกกี่ช่องก็ได้ อยากให้ช่วยแนะนำตามงบของคุณไหมคะ?`;
  }
  if (/7 วัน|15 วัน|30 วัน|ระยะเวลา|แพ็ก/.test(t)) {
    const list = DURATIONS.map((d) => `• แพ็ก ${d.label} — ค่า AI ${formatTHB(d.aiFee)}`).join(line);
    return `มีแพ็ก ${DURATIONS.length} ระยะเวลา:` + line + list + line + `ค่าบริการ ${SERVICE_PER_DAY} บาท/วันทุกแพ็ก เหมาะกับแคมเปญที่ต้องการเวลาต่างกันค่ะ`;
  }
  if (/apex|titan|คืออะไร|บริการ/.test(t)) {
    return `APEX @TITAN-9 AI คือบริการวางแผนโฆษณา 7 ช่องทาง (Facebook, Instagram, TikTok, X, Google Ads, LINE OA และ Apex AI) ด้วยค่าบริการ ${SERVICE_PER_DAY} บาท/วัน ครอบคลุมทุกแพลตฟอร์มที่คุณเลือก พร้อมผู้ช่วย AI ช่วยวางแผนให้ครบค่ะ`;
  }
  if (/สมัคร|เข้าสู่ระบบ|login|sign ?up/.test(t)) {
    return `สมัครสมาชิกได้ที่หน้าแรกของแอป (ปุ่มสมัคร) หรือเข้าสู่ระบบถ้ามีบัญชีอยู่แล้วค่ะ — หลังเข้าสู่ระบบจะจัดการแพ็กเกจและออเดอร์ได้เลย`;
  }
  if (/สวัสดี|hi|hello|ทัก/.test(t)) return `สวัสดีค่ะ ยินดีให้บริการค่ะ 🙏 อยากสอบถามเรื่องไหนคะ? ราคา แพลตฟอร์ม หรือวิธีชำระเงิน — พิมพ์มาได้เลยนะคะ`;
  return `ขอโทษค่ะ ยังไม่เข้าใจคำถามนั้นดีนัก อยากให้ช่วยได้ทาง: ราคา / แพลตฟอร์ม / วิธีชำระเงิน / แพ็ก 7-15-30 วัน หรือติดต่อแอดมินโดยตรงที่ @${CONTACT_LINE} นะคะ`;
}


================================================================

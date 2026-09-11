// ข้อมูลหลักของแอป APEX TITAN-9 AI — ราคา แพลตฟอร์ม ช่องชำระ คำตอบ

export type Platform = { id: string; name: string; dailyBudget: number; enabled?: boolean };
export type DurationOption = { days: number; label: string; aiFee: number };

export const SERVICE_PER_DAY = 199; // บาท/วัน

export const PLATFORMS: Platform[] = [
  { id: 'facebook', name: 'Facebook', dailyBudget: 500 },
  { id: 'instagram', name: 'Instagram', dailyBudget: 500 },
  { id: 'tiktok', name: 'TikTok', dailyBudget: 500 },
  { id: 'x', name: 'X (Twitter)', dailyBudget: 300 },
  { id: 'google', name: 'Google Ads', dailyBudget: 500 },
  { id: 'line', name: 'LINE OA', dailyBudget: 400 },
  { id: 'apex', name: 'Apex (Titan-9 AI)', dailyBudget: SERVICE_PER_DAY },
];

export const DURATIONS: DurationOption[] = [
  { days: 7, label: '7 วัน', aiFee: 1000 },
  { days: 15, label: '15 วัน', aiFee: 2000 },
  { days: 30, label: '30 วัน', aiFee: 3000 },
];

export const PAYMENT = {
  bankName: 'ธ.กสิกรไทย',
  bankAccount: '168-1-72012-6',
  bankHolder: 'พรรณนิภา ท้าวทัน',
  trueMoney: '097-016-1014',
  trueMoneyHolder: 'พรรณนิภา ท้าวทัน',
};

export const CONTACT = {
  email: 'support@apex-titan9.ai',
  line: '@apextitan9',
};

// คำนวณราคารวม
export function computeTotal(platformIds: string[], days: number): number {
  const dur = DURATIONS.find((d) => d.days === days) ?? DURATIONS[0];
  const n = platformIds.length;
  const budget = platformIds.reduce((sum, id) => sum + (PLATFORMS.find((p) => p.id === id)?.dailyBudget ?? 0), 0);
  return SERVICE_PER_DAY * days + dur.aiFee * n + budget * days;
}

export function formatTHB(n: number): string {
  return n.toLocaleString('th-TH') + ' บาท';
}


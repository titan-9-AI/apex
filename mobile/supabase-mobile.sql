-- APEX @TITAN-9 AI (แอปมือถือ) — สร้างตาราง settings + orders
-- วิธีใช้: เปิด Supabase Dashboard → SQL Editor → วางโค้ดนี้ → กด Run

-- ============ ตาราง settings (ค่าตั้งค่าระบบที่แอดมินแก้ + ซิงก์) ============
create table if not exists public.settings (
  id int primary key default 1,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ใส่ค่าเริ่มต้น (ราคา, ระยะเวลา, แพลตฟอร์ม, ช่องชำระเงิน, ติดต่อ)
insert into public.settings (id, value)
values (1, jsonb_build_object(
  'servicePerDay', 199,
  'platforms', jsonb_build_array(
    jsonb_build_object('id','facebook','name','Facebook','dailyBudget',500),
    jsonb_build_object('id','instagram','name','Instagram','dailyBudget',500),
    jsonb_build_object('id','tiktok','name','TikTok','dailyBudget',500),
    jsonb_build_object('id','x','name','X (Twitter)','dailyBudget',300),
    jsonb_build_object('id','google','name','Google Ads','dailyBudget',500),
    jsonb_build_object('id','line','name','LINE OA','dailyBudget',400),
    jsonb_build_object('id','apex','name','Apex (Titan-9 AI)','dailyBudget',199)
  ),
  'durations', jsonb_build_array(
    jsonb_build_object('days',7,'label','7 วัน','aiFee',1000),
    jsonb_build_object('days',15,'label','15 วัน','aiFee',2000),
    jsonb_build_object('days',30,'label','30 วัน','aiFee',3000)
  ),
  'payment', jsonb_build_object(
    'bankName','ธ.กสิกรไทย','bankAccount','168-1-72012-6',
    'bankHolder','พรรณนิภา ท้าวทัน','trueMoney','097-016-1014','trueMoneyHolder','พรรณนิภา ท้าวทัน'
  ),
  'contact', jsonb_build_object('email','support@apex-titan9.ai','line','@apextitan9')
))
on conflict (id) do nothing;

-- ============ ตาราง orders (ออเดอร์จากแอปมือถือ) ============
create table if not exists public.orders (
  id text primary key,
  email text not null,
  days int not null,
  per_day int not null,
  ai_fee int not null,
  ad_spend int not null,
  platforms jsonb not null default '[]',
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- ============ RLS: ให้ผู้ใช้เห็นออเดอร์ของตัวเอง / แอดมินเห็นทั้งหมด ============
alter table public.orders enable row level security;
alter table public.settings enable row level security;

create policy "orders_own" on public.orders
  for all using (auth.email() = email);

create policy "settings_read" on public.settings
  for select using (true);

create policy "settings_admin_write" on public.settings
  for insert with check (auth.jwt() ->> 'email' = 'apexous.t9@gmail.com');
create policy "settings_admin_update" on public.settings
  for update using (auth.jwt() ->> 'email' = 'apexous.t9@gmail.com');


วิธีติดตั้งและรัน (สรุป)
1) ติดตั้ง dependencies
   npm install
   npx expo install expo-router expo-image expo-linear-gradient expo-blur expo-clipboard expo-status-bar react-native-safe-area-context @react-native-async-storage/async-storage expo-crypto expo-constants expo-splash-screen react-native-web react-dom @expo/metro-runtime
   npm install lucide-react-native @supabase/supabase-js --legacy-peer-deps

2) รัน
   npx expo start          # แล้วสแกน QR ด้วยแอป Expo Go
   npx expo start --web    # เปิดในเบราว์เซอร์

3) ตรวจคุณภาพ
   npx tsc --noEmit
   npx expo export --platform web

4) ตั้งค่า Supabase
   - SQL Editor → วางไฟล์ supabase-mobile.sql → Run
   - Authentication → Providers → เปิด Email
   - บัญชีแอดมิน: apexous.t9@gmail.com (สมัคร + ตั้งรหัสผ่าน)
   - บัญชีทดสอบ: demo@titan9.ai / demo1234

5) AI จริง (ไม่บังคับ)
   - Supabase → Edge Functions → สร้างฟังก์ชันชื่อ titan9 → deploy
   - Secrets → ตั้ง OPENAI_API_KEY = คีย์จริง (sk-...)
   - เติมเครดิต OpenAI ที่ platform.openai.com/settings/organization/billing
   - ถ้าไม่ตั้ง AI แอปจะตอบด้วยกฎสำรองอัตโนมัติ

จบไฟล์ — APEX @TITAN-9 AI

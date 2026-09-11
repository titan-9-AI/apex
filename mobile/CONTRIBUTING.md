# แนวทางร่วมพัฒนา — APEX TITAN-9 AI (แอปมือถือ)

## เริ่มต้น
```bash
npm install
npx expo start          # dev server (สแกน QR ด้วย Expo Go)
npx expo start --web    # เปิดในเบราว์เซอร์
```

## โครงสร้าง
- `app/` — หน้าจอทั้งหมด (Expo Router, file-based)
  - `app/(tabs)/` — แดชบอร์ด / แชต AI / แพ็กเกจ / ออเดอร์ / ใบเสร็จ / ตั้งค่า / โปรไฟล์
  - `app/receipt/[id].tsx` — รายละเอียดใบเสร็จ
- `components/` — คอมโพเนนต์ UI ที่ใช้ซ้ำ (ui.tsx, SettingsScreen, ErrorBoundary)
- `context/` — สถานะทั้งแอป (Auth, Settings, Theme)
- `lib/` — ชั้นเชื่อมข้อมูล (supabase, api, ai, config, titan)
- `data/` — ข้อมูลธุรกิจ (ราคา/แพลตฟอร์ม/ระยะเวลา)
- `constants/theme.ts` — โทเคนสี/ระยะ/ตัวอักษร

## ก่อนส่งงาน
```bash
npx tsc --noEmit                 # ต้องผ่าน 0 error
npx expo export --platform web   # ต้อง build ผ่าน
```

## ข้อตกลง
- ใช้ TypeScript เข้ม (ห้าม `any`)
- สี/ขนาด ใช้โทเคนจาก `constants/theme.ts` ไม่ hardcode
- ฟังก์ชันที่แตะ Supabase ให้อยู่ใน `lib/api.ts`
- อย่าแก้ `app.json`/`babel.config.js`/`metro.config.js` โดยไม่อธิบายเหตุผล

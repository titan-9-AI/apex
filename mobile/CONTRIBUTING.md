# การมีส่วนร่วมพัฒนา (Contributing)

## เริ่มต้น

```bash
cd mobile
npm install
cp .env.example .env      # ใส่ค่าจริง
npx expo start
```

## ก่อนส่งงาน (ทุกครั้ง)

```bash
npx tsc --noEmit                    # ต้องไม่มี error
npx expo export --platform web      # ต้อง build ผ่าน
```

## แนวทางเขียนโค้ด

- **หน้าจอ** อยู่ใน `app/` (expo-router) — ตั้งชื่อไฟล์ตามเส้นทาง
- **ตรรกะธุรกิจ** อยู่ใน `lib/` — อย่าเรียก Supabase ตรง ๆ จากหน้าจอ ให้ผ่าน `lib/api.ts`
- **ค่าคงที่/ค่า config** อยู่ใน `lib/config.ts` และ `data/business.ts`
- **สถานะร่วม** อยู่ใน `context/` (Auth / Settings / Theme)
- ข้อความทั้งหมดเป็นภาษาไทย ใช้ `components/ui.tsx` เป็นชุด UI กลาง
- หลีกเลี่ยง hardcode สี/ราคา ให้ดึงจากธีม (`constants/theme.ts`) และค่าตั้งระบบ

## ความปลอดภัย

- **ห้าม** ใส่คีย์ลับ (OpenAI, service role) ลงในโค้ดฝั่งแอป
- คีย์ OpenAI เก็บเป็น Secret ของ Edge Function `titan9` เท่านั้น
- ใช้ anon key ผ่าน `.env` (EXPO_PUBLIC_*) ห้าม commit `.env`

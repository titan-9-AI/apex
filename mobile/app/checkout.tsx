// หน้าสั่งซื้อ/ชำระเงิน — สรุปออเดอร์ + ช่องทางชำระเงิน (โหลดค่าจาก settings)
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Copy, CreditCard, Wallet } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Text } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { useSettings, calcTotal } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { settings } = useSettings();
  const { member } = useAuth();
  const pay = settings.payment;
  const [selected, setSelected] = useState<string[]>(['facebook']);
  const [days, setDays] = useState(settings.durations[0]?.days ?? 7);
  const [copied, setCopied] = useState('');
  const [placed, setPlaced] = useState(false);

  const toggle = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const total = calcTotal(settings, selected, days);
  const dur = settings.durations.find((d) => d.days === days) ?? settings.durations[0];

  const copy = async (t: string, key: string) => {
    await Clipboard.setStringAsync(t);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const placeOrder = async () => {
    if (selected.length === 0) return;
    const order = {
      id: 'mo_' + Date.now(),
      email: member?.email ?? 'guest@apex',
      days, per_day: settings.servicePerDay, ai_fee: dur?.aiFee ?? 0,
      ad_spend: total, platforms: selected, status: 'pending', created_at: new Date().toISOString(),
    };
    // บันทึกลง Supabase (ถ้าตารางพร้อม)
    const { error } = await supabase.from('orders').insert(order);
    if (error) console.log('order insert skipped:', error.message);
    setPlaced(true);
  };

  if (placed) {
    return (
      <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={[styles.okCircle, { backgroundColor: '#7c3aed' }]}><Check color="#fff" size={34} /></View>
        <Text variant="heading" style={{ color: '#fff', marginTop: 16 }}>สร้างออเดอร์แล้ว</Text>
        <Text style={{ color: '#d8ccf5', textAlign: 'center', marginTop: 8 }}>กรุณาโอนเงินตามช่องทางด้านล่าง แล้วแจ้งยืนยันได้เลย</Text>
        <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: '#7c3aed', marginTop: 24 }]}><Text style={{ color: '#fff', fontWeight: '700' }}>กลับไปหน้าหลัก</Text></Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <View style={styles.headRow}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.surface }]}><ArrowLeft color={c.text} size={20} /></Pressable>
          <Text variant="heading" style={{ color: '#fff' }}>สั่งซื้อ / ชำระเงิน</Text>
        </View>

        {!member ? (
          <View style={{ marginVertical: 12, padding: 12, borderRadius: 12, backgroundColor: c.surfaceAlt }}>
            <Text variant="body" color="#4c1d95">เข้าสู่ระบบก่อนสั่งซื้อเพื่อบันทึกออเดอร์ให้คุณ</Text>
            <Pressable onPress={() => router.push('/login')}><Text color="#7c3aed" style={{ fontWeight: '700' }}>เข้าสู่ระบบ</Text></Pressable>
          </View>
        ) : null}

        <Text variant="subhead" style={styles.sectionTitle}>แพลตฟอร์มที่เลือก</Text>
        <View style={styles.grid}>
          {settings.platforms.filter((p) => p.enabled !== false).map((p) => {
            const on = selected.includes(p.id);
            return (
              <Pressable key={p.id} onPress={() => toggle(p.id)} style={[styles.plat, { borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accentSoft : c.surface }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant="body" style={{ color: on ? '#4c1d95' : c.text, fontWeight: '700' }}>{p.name}</Text>
                  {on ? <View style={[styles.check, { backgroundColor: c.accent }]}><Check color="#fff" size={12} strokeWidth={3} /></View> : null}
                </View>
                <Text variant="footnote" color={on ? '#4c1d95' : c.textMuted}>{p.dailyBudget} บาท/วัน</Text>
              </Pressable>
            );
          })}
        </View>

        <Text variant="subhead" style={styles.sectionTitle}>ระยะเวลา</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {settings.durations.map((d) => {
            const on = days === d.days;
            return (
              <Pressable key={d.days} onPress={() => setDays(d.days)} style={[styles.dur, { borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accent : c.surface }]}>
                <Text style={{ color: on ? '#fff' : c.text, fontWeight: '800' }}>{d.days} วัน</Text>
                <Text variant="footnote" color={on ? '#e9d5ff' : c.textMuted}>AI {d.aiFee.toLocaleString('th-TH')} บาท</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.summary, { backgroundColor: c.surface, borderColor: c.accent }]}>
          <Text variant="heading" style={{ color: c.text }}>สรุปยอดชำระ</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="body" color={c.textSecondary}>ค่าบริการ + ค่า AI + งบโฆษณา</Text>
            <Text variant="body" style={{ color: c.text }}>{total.toLocaleString('th-TH')} บาท</Text>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="subhead" style={{ color: c.text }}>รวมสุทธิ</Text>
            <Text variant="title" style={{ color: c.accent }}>{total.toLocaleString('th-TH')} บาท</Text>
          </View>
        </View>

        <Text variant="subhead" style={styles.sectionTitle}>ช่องทางชำระเงิน</Text>
        <View style={[styles.payCard, { backgroundColor: c.surface }]}>
          <View style={styles.payRow}>
            <View style={[styles.payIcon, { backgroundColor: '#7c3aed' }]}><CreditCard color="#fff" size={18} /></View>
            <View style={{ flex: 1 }}>
              <Text variant="body" style={{ color: c.text, fontWeight: '700' }}>{pay.bankName}</Text>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{pay.bankAccount}</Text>
              <Text variant="footnote" color={c.textMuted}>{pay.bankHolder}</Text>
            </View>
            <Pressable onPress={() => copy(pay.bankAccount, 'bank')} style={[styles.copyBtn, { backgroundColor: c.accentSoft }]}><Copy color="#7c3aed" size={16} />{copied === 'bank' ? <Text variant="footnote" color="#7c3aed">คัดลอกแล้ว</Text> : null}</Pressable>
          </View>
          <View style={styles.payRow}>
            <View style={[styles.payIcon, { backgroundColor: '#059669' }]}><Wallet color="#fff" size={18} /></View>
            <View style={{ flex: 1 }}>
              <Text variant="body" style={{ color: c.text, fontWeight: '700' }}>TrueMoney Wallet</Text>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{pay.trueMoney}</Text>
              <Text variant="footnote" color={c.textMuted}>{pay.trueMoneyHolder}</Text>
            </View>
            <Pressable onPress={() => copy(pay.trueMoney, 'tm')} style={[styles.copyBtn, { backgroundColor: '#dcfce7' }]}><Copy color="#059669" size={16} />{copied === 'tm' ? <Text variant="footnote" color="#059669">คัดลอกแล้ว</Text> : null}</Pressable>
          </View>
        </View>

        <Pressable onPress={placeOrder} disabled={selected.length === 0} style={[styles.placeBtn, { backgroundColor: '#7c3aed', opacity: selected.length === 0 ? 0.5 : 1 }]}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>สร้างออเดอร์ · {total.toLocaleString('th-TH')} บาท</Text>
        </Pressable>
        <Text variant="footnote" color="#a78bfa" style={{ textAlign: 'center', marginTop: 8 }}>โอนแล้วแจ้งยืนยันผ่านแชต Titan-9 AI หรือติดต่อแอดมิน</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: '#fff', marginTop: 16, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  plat: { width: '48%', borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 },
  check: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  dur: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 2 },
  summary: { borderWidth: 1.5, borderRadius: 16, padding: 16, marginTop: 16, gap: 10 },
  payCard: { borderRadius: 16, padding: 6, marginTop: 8 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  payIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  placeBtn: { alignItems: 'center', paddingVertical: 16, borderRadius: 16, marginTop: 20 },
  okCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  btn: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
});


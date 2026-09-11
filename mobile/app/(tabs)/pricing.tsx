// แท็บแพ็กเกจ — เลือกแพลตฟอร์ม + ระยะเวลา คำนวณราคาสด (โหลดค่าจาก SettingsContext)
import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Sparkles } from 'lucide-react-native';
import { Text } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useSettings, calcTotal } from '../../context/SettingsContext';
import { router } from 'expo-router';
import { formatTHB } from '../../data/business';

export default function PricingScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { settings } = useSettings();
  const [selected, setSelected] = useState<string[]>(['facebook']);
  const [days, setDays] = useState(settings.durations[0]?.days ?? 7);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const total = calcTotal(settings, selected, days);
  const dur = settings.durations.find((d) => d.days === days) ?? settings.durations[0];
  const pay = settings.payment;

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.headRow}>
          <View style={styles.headIcon}><Sparkles color="#fff" size={18} /></View>
          <Text variant="heading" style={{ color: '#fff' }}>แพ็กเกจโฆษณา 7 แพลตฟอร์ม</Text>
        </View>
        <Text variant="caption" color="#a78bfa" style={{ marginBottom: 16 }}>ค่าบริการ {settings.servicePerDay} บาท/วัน ครอบคลุมทุกแพลตฟอร์มที่เลือก</Text>

        <Text variant="subhead" style={{ color: '#fff', marginBottom: 10 }}>เลือกแพลตฟอร์ม</Text>
        <View style={styles.grid}>
          {settings.platforms.map((p) => {
            const on = selected.includes(p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => toggle(p.id)}
                style={[styles.plat, { borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accentSoft : c.surface }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant="body" style={{ color: on ? '#4c1d95' : c.text, fontWeight: '700' }}>{p.name}</Text>
                  {on ? <View style={[styles.check, { backgroundColor: c.accent }]}><Check color="#fff" size={12} strokeWidth={3} /></View> : null}
                </View>
                <Text variant="footnote" color={on ? '#4c1d95' : c.textMuted}>{p.dailyBudget} บาท/วัน</Text>
              </Pressable>
            );
          })}
        </View>

        <Text variant="subhead" style={{ color: '#fff', marginVertical: 14 }}>เลือกระยะเวลา</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {settings.durations.map((d) => {
            const on = days === d.days;
            return (
              <Pressable key={d.days} onPress={() => setDays(d.days)} style={[styles.dur, { borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accent : c.surface }]}>
                <Text style={{ color: on ? '#fff' : c.text, fontWeight: '800' }}>{d.days} วัน</Text>
                <Text variant="footnote" color={on ? '#e9d5ff' : c.textMuted}>AI {formatTHB(d.aiFee)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.summary, { backgroundColor: c.surface, borderColor: c.accent }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="body" color={c.textSecondary}>ค่าบริการ ({dur?.days} วัน)</Text>
            <Text style={{ color: c.text }}>{formatTHB(settings.servicePerDay * (dur?.days ?? 7))}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="body" color={c.textSecondary}>ค่า AI ({selected.length} แพลตฟอร์ม)</Text>
            <Text style={{ color: c.text }}>{formatTHB((dur?.aiFee ?? 0) * selected.length)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="body" color={c.textSecondary}>งบโฆษณา ({dur?.days} วัน)</Text>
            <Text style={{ color: c.text }}>{formatTHB(selected.reduce((s, id) => s + (settings.platforms.find((p) => p.id === id)?.dailyBudget ?? 0), 0) * (dur?.days ?? 7))}</Text>
          </View>
          <View style={styles.divider} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="heading" style={{ color: c.text }}>รวม</Text>
            <Text variant="title" style={{ color: c.accent }}>{formatTHB(total)}</Text>
          </View>
        </View>

        <View style={[styles.payCard, { backgroundColor: c.surfaceAlt }]}>
          <Text variant="subhead" style={{ color: c.text, marginBottom: 6 }}>ช่องทางชำระเงิน</Text>
          <Text variant="body" color={c.textSecondary}>🏦 {pay.bankName} เลขที่ {pay.bankAccount}</Text>
          <Text variant="footnote" color={c.textMuted}>{pay.bankHolder}</Text>
          <Text variant="body" color={c.textSecondary} style={{ marginTop: 6 }}>📱 TrueMoney: {pay.trueMoney}</Text>
          <Text variant="footnote" color={c.textMuted}>{pay.trueMoneyHolder}</Text>
        </View>

        <Pressable onPress={() => router.push('/checkout')} style={[styles.orderBtn, { backgroundColor: c.accent }]}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>ไปสั่งซื้อ · {formatTHB(total)}</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  plat: { width: '48%', borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 },
  check: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  dur: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 2 },
  summary: { borderWidth: 1.5, borderRadius: 16, padding: 16, marginTop: 20, gap: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#3b2a66', marginVertical: 4 },
  payCard: { borderRadius: 14, padding: 14, marginTop: 16 },
  orderBtn: { alignItems: 'center', paddingVertical: 15, borderRadius: 16, marginTop: 20 },
});


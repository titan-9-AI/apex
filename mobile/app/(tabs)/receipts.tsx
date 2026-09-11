// app/(tabs)/receipts.tsx — แท็บใบเสร็จ: รวมทุกออเดอร์ คัดลอก/แชร์/ดูเต็ม
import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, RefreshControl, Share, Platform } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { ReceiptText, Copy, Share2, ChevronRight, Wallet, Clock, CheckCircle2, User } from 'lucide-react-native';
import { Text, Card } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { listOrders, summarizeOrders, type Order } from '../../lib/api';

function fmtDateTime(iso: string) {
  try { return new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export function receiptText(o: Order, holder: string, bankName: string, account: string, tmn: string) {
  const platforms = Array.isArray(o.platforms) ? o.platforms.join(', ') : '-';
  const status = o.status === 'paid' ? 'ชำระแล้ว' : o.status === 'confirmed' ? 'ยืนยันแล้ว' : o.status === 'cancelled' ? 'ยกเลิก' : 'รอชำระ';
  return [
    'ใบเสร็จรับเงิน — APEX @TITAN-9 AI',
    `รหัสออเดอร์: ${o.id}`,
    `วันที่: ${fmtDateTime(o.created_at)}`,
    `สมาชิก: ${o.email}`,
    '--------------------------------',
    `ระยะเวลา: ${o.days} วัน`,
    `ค่าบริการ/วัน: ${(o.per_day ?? 0).toLocaleString('th-TH')} บาท`,
    `ค่า AI: ${(o.ai_fee ?? 0).toLocaleString('th-TH')} บาท`,
    `งบโฆษณา: ${(o.ad_spend ?? 0).toLocaleString('th-TH')} บาท`,
    `แพลตฟอร์ม: ${platforms}`,
    '--------------------------------',
    `ยอดรวม: ${(o.ad_spend ?? 0).toLocaleString('th-TH')} บาท`,
    `สถานะ: ${status}`,
    '--------------------------------',
    `ชำระผ่าน: ${bankName} ${account} (${holder})`,
    `หรือ TrueMoney: ${tmn} (${holder})`,
  ].join('\n');
}

export default function ReceiptsScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { member } = useAuth();
  const { settings } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!member?.email) { setLoading(false); return; }
    const { data } = await listOrders({ email: member.email, isAdmin: member.role === 'admin' });
    setOrders(data); setLoading(false); setRefreshing(false);
  }, [member?.email, member?.role]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const summary = useMemo(() => summarizeOrders(orders), [orders]);
  const pay = settings.payment;

  const copy = async (o: Order) => {
    await Clipboard.setStringAsync(receiptText(o, pay.bankHolder, pay.bankName, pay.bankAccount, pay.trueMoney));
    setCopiedId(o.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const share = async (o: Order) => {
    try { await Share.share({ message: receiptText(o, pay.bankHolder, pay.bankName, pay.bankAccount, pay.trueMoney) }); }
    catch { /* ยกเลิก */ }
  };

  if (!member) {
    return (
      <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={styles.center}>
        <ReceiptText color="#a78bfa" size={40} />
        <Text style={{ color: '#fff', textAlign: 'center' }}>เข้าสู่ระบบเพื่อดูใบเสร็จของคุณ</Text>
        <Pressable onPress={() => router.push('/login')} style={[styles.bigBtn, { backgroundColor: '#7c3aed' }]}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>เข้าสู่ระบบ</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
        <Text variant="heading" style={{ color: '#fff' }}>ใบเสร็จ</Text>
        <Text variant="caption" color="#a78bfa" style={{ marginBottom: 12 }}>
          {member.role === 'admin' ? 'มุมมองผู้ดูแล — ทุกออเดอร์' : `ทั้งหมด ${summary.count} ฉบับ`}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text variant="title" style={{ color: c.text }}>{summary.count}</Text>
            <Text variant="caption" color={c.textMuted}>ใบเสร็จ</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text variant="title" style={{ color: '#34d399' }}>{summary.paidTotal.toLocaleString('th-TH')}</Text>
            <Text variant="caption" color={c.textMuted}>ยอดชำระแล้ว (บาท)</Text>
          </View>
        </View>

        {loading ? (<Card><Text color={c.textMuted}>กำลังโหลดใบเสร็จ…</Text></Card>)
          : orders.length === 0 ? (
            <Card>
              <Text color={c.textMuted}>ยังไม่มีใบเสร็จ — เมื่อสั่งซื้อแล้วจะแสดงที่นี่</Text>
              <Pressable onPress={() => router.push('/checkout')} style={[styles.bigBtn, { backgroundColor: '#7c3aed', marginTop: 8 }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>สั่งซื้อแพ็กเกจใหม่</Text>
              </Pressable>
            </Card>
          ) : (
            orders.map((o) => {
              const paid = o.status === 'paid';
              const confirmed = o.status === 'confirmed';
              const Icon = paid ? Wallet : confirmed ? CheckCircle2 : Clock;
              const tint = paid ? '#34d399' : confirmed ? '#a78bfa' : '#fbbf24';
              return (
                <View key={o.id} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon color={tint} size={18} />
                    <Text variant="body" style={{ color: c.text, fontWeight: '800', flex: 1 }} numberOfLines={1}>
                      #{o.id.slice(-8).toUpperCase()}
                    </Text>
                    <Text variant="body" style={{ color: c.accent, fontWeight: '800' }}>
                      {(o.ad_spend ?? 0).toLocaleString('th-TH')} ฿
                    </Text>
                  </View>
                  <Text variant="footnote" color={c.textMuted}>
                    {fmtDateTime(o.created_at)} · {o.days} วัน · {Array.isArray(o.platforms) ? o.platforms.length : 0} แพลตฟอร์ม
                  </Text>
                  {member.role === 'admin' ? (
                    <Text variant="footnote" color={c.textMuted}><User size={11} color={c.textMuted} /> {o.email}</Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <Pressable onPress={() => copy(o)} style={[styles.smallBtn, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                      <Copy color={c.accent} size={15} />
                      <Text variant="footnote" style={{ color: c.accent, fontWeight: '700' }}>
                        {copiedId === o.id ? 'คัดลอกแล้ว' : 'คัดลอก'}
                      </Text>
                    </Pressable>
                    {Platform.OS !== 'web' ? (
                      <Pressable onPress={() => share(o)} style={[styles.smallBtn, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                        <Share2 color={c.accent} size={15} />
                        <Text variant="footnote" style={{ color: c.accent, fontWeight: '700' }}>แชร์</Text>
                      </Pressable>
                    ) : null}
                    <Pressable onPress={() => router.push(`/receipt/${o.id}`)} style={[styles.smallBtn, { backgroundColor: '#7c3aed', borderColor: '#7c3aed' }]}>
                      <Text variant="footnote" style={{ color: '#fff', fontWeight: '700' }}>ดูใบเสร็จ</Text>
                      <ChevronRight color="#fff" size={15} />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, gap: 2, alignItems: 'center' },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10, gap: 4 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  bigBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
});

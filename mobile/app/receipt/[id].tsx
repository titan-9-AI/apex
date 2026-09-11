// app/receipt/[id].tsx — หน้ารายละเอียดใบเสร็จ /receipt/<id>
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Share, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Copy, Share2, CheckCircle2, Clock, Wallet, XCircle, Printer } from 'lucide-react-native';
import { Text, Card, Button } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getOrder, type Order } from '../../lib/api';

export function fmtFull(iso: string) {
  try {
    return new Date(iso).toLocaleString('th-TH', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export function buildReceipt(o: Order, holder: string, bankName: string, account: string, tmn: string) {
  const platforms = Array.isArray(o.platforms) ? o.platforms.join(', ') : '-';
  const statusText = o.status === 'paid' ? 'ชำระแล้ว' : o.status === 'confirmed' ? 'ยืนยันแล้ว'
    : o.status === 'cancelled' ? 'ยกเลิก' : 'รอชำระ';
  return [
    'ใบเสร็จรับเงิน — APEX @TITAN-9 AI',
    '================================',
    `รหัสออเดอร์: ${o.id}`,
    `วันที่: ${fmtFull(o.created_at)}`,
    `สมาชิก: ${o.email}`,
    '--------------------------------',
    `ระยะเวลา: ${o.days} วัน`,
    `ค่าบริการ/วัน: ${(o.per_day ?? 0).toLocaleString('th-TH')} บาท`,
    `ค่า AI: ${(o.ai_fee ?? 0).toLocaleString('th-TH')} บาท`,
    `งบโฆษณา: ${(o.ad_spend ?? 0).toLocaleString('th-TH')} บาท`,
    `แพลตฟอร์ม: ${platforms}`,
    '--------------------------------',
    `ยอดรวมทั้งสิ้น: ${(o.ad_spend ?? 0).toLocaleString('th-TH')} บาท`,
    `สถานะ: ${statusText}`,
    '================================',
    `ชำระผ่าน: ${bankName} ${account}`,
    `ชื่อบัญชี: ${holder}`,
    `หรือ TrueMoney: ${tmn} (${holder})`,
  ].join('\n');
}

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const c = theme.colors;
  const { member } = useAuth();
  const { settings } = useSettings();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error: err } = await getOrder(String(id));
    setOrder(data); setError(err); setLoading(false);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const pay = settings.payment;

  const onCopy = async () => {
    if (!order) return;
    await Clipboard.setStringAsync(buildReceipt(order, pay.bankHolder, pay.bankName, pay.bankAccount, pay.trueMoney));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onShare = async () => {
    if (!order) return;
    try { await Share.share({ message: buildReceipt(order, pay.bankHolder, pay.bankName, pay.bankAccount, pay.trueMoney) }); }
    catch { /* ยกเลิก */ }
  };

  const onPrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.print();
  };

  const Header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.border }]}>
        <ArrowLeft color={c.text} size={20} />
      </Pressable>
      <Text variant="heading" style={{ color: '#fff', flex: 1 }}>รายละเอียดใบเสร็จ</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={styles.center}>
        <ActivityIndicator color="#7c3aed" size="large" />
        <Text color="#a78bfa">กำลังโหลดใบเสร็จ…</Text>
      </LinearGradient>
    );
  }

  if (error || !order) {
    return (
      <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1, padding: 16 }}>
        {Header}
        <Card>
          <Text style={{ color: '#fca5a5', fontWeight: '700' }}>ไม่พบใบเสร็จนี้</Text>
          <Text variant="caption" color={c.textMuted}>{error ?? `ไม่พบออเดอร์รหัส ${id}`}</Text>
          <View style={{ marginTop: 10 }}>
            <Button title="กลับไปหน้าออเดอร์" variant="secondary" onPress={() => router.push('/(tabs)/orders')} />
          </View>
        </Card>
      </LinearGradient>
    );
  }

  const statusMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    paid: { label: 'ชำระแล้ว', color: '#059669', bg: '#dcfce7', icon: <Wallet size={14} color="#059669" /> },
    confirmed: { label: 'ยืนยันแล้ว', color: '#7c3aed', bg: '#ede9fe', icon: <CheckCircle2 size={14} color="#7c3aed" /> },
    cancelled: { label: 'ยกเลิก', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} color="#dc2626" /> },
    pending: { label: 'รอชำระ', color: '#b45309', bg: '#fef3c7', icon: <Clock size={14} color="#b45309" /> },
  };
  const st = statusMap[order.status] ?? statusMap.pending;

  const rows: { label: string; value: string }[] = [
    { label: 'ระยะเวลา', value: `${order.days} วัน` },
    { label: 'ค่าบริการ/วัน', value: `${(order.per_day ?? 0).toLocaleString('th-TH')} บาท` },
    { label: 'ค่า AI', value: `${(order.ai_fee ?? 0).toLocaleString('th-TH')} บาท` },
    { label: 'งบโฆษณา', value: `${(order.ad_spend ?? 0).toLocaleString('th-TH')} บาท` },
    { label: 'แพลตฟอร์ม', value: Array.isArray(order.platforms) ? (order.platforms.join(', ') || '-') : '-' },
  ];

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {Header}

        <View style={[styles.receipt, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={{ color: c.text, textAlign: 'center', fontWeight: '800', fontSize: 17 }}>ใบเสร็จรับเงิน</Text>
          <Text variant="caption" color={c.textMuted} style={{ textAlign: 'center', marginBottom: 10 }}>APEX @TITAN-9 AI</Text>

          <View style={[styles.pill, { backgroundColor: st.bg, alignSelf: 'center', marginBottom: 12 }]}>
            {st.icon}
            <Text variant="footnote" style={{ color: st.color, fontWeight: '800' }}>{st.label}</Text>
          </View>

          <View style={styles.line}>
            <Text variant="footnote" color={c.textMuted}>รหัสออเดอร์</Text>
            <Text variant="footnote" style={{ color: c.text, fontWeight: '700' }}>{order.id}</Text>
          </View>
          <View style={styles.line}>
            <Text variant="footnote" color={c.textMuted}>วันที่</Text>
            <Text variant="footnote" style={{ color: c.text }}>{fmtFull(order.created_at)}</Text>
          </View>
          <View style={styles.line}>
            <Text variant="footnote" color={c.textMuted}>สมาชิก</Text>
            <Text variant="footnote" style={{ color: c.text }}>{order.email}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          {rows.map((r) => (
            <View key={r.label} style={styles.line}>
              <Text variant="footnote" color={c.textMuted}>{r.label}</Text>
              <Text variant="footnote" style={{ color: c.text, flexShrink: 1, textAlign: 'right' }}>{r.value}</Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <View style={styles.line}>
            <Text variant="body" style={{ color: c.text, fontWeight: '800' }}>ยอดรวมทั้งสิ้น</Text>
            <Text variant="body" style={{ color: c.accent, fontWeight: '900' }}>
              {(order.ad_spend ?? 0).toLocaleString('th-TH')} บาท
            </Text>
          </View>
        </View>

        <Card style={{ marginTop: 14 }}>
          <Text variant="subhead" style={{ color: c.text, fontWeight: '700' }}>ช่องทางชำระเงิน</Text>
          <Text variant="body" color={c.textSecondary}>{pay.bankName}</Text>
          <Text variant="body" style={{ color: c.text, fontWeight: '800' }}>{pay.bankAccount}</Text>
          <Text variant="caption" color={c.textMuted}>{pay.bankHolder}</Text>
          <View style={[styles.divider, { backgroundColor: c.border, marginVertical: 8 }]} />
          <Text variant="body" color={c.textSecondary}>TrueMoney Wallet</Text>
          <Text variant="body" style={{ color: c.text, fontWeight: '800' }}>{pay.trueMoney}</Text>
          <Text variant="caption" color={c.textMuted}>{pay.trueMoneyHolder}</Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <Button title={copied ? 'คัดลอกแล้ว' : 'คัดลอก'} variant="secondary"
              icon={<Copy color={c.accent} size={17} />} onPress={onCopy} />
          </View>
          {Platform.OS !== 'web' ? (
            <View style={{ flex: 1 }}>
              <Button title="แชร์" variant="secondary" icon={<Share2 color={c.accent} size={17} />} onPress={onShare} />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Button title="พิมพ์" variant="secondary" icon={<Printer color={c.accent} size={17} />} onPress={onPrint} />
            </View>
          )}
        </View>

        {member?.role === 'admin' && order.status !== 'paid' ? (
          <View style={{ marginTop: 10 }}>
            <Button title="กลับไปหน้าออเดอร์" onPress={() => router.push('/(tabs)/orders')} />
          </View>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  receipt: { borderWidth: 1, borderRadius: 18, padding: 18 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
});

// app/(tabs)/orders.tsx — แท็บออเดอร์: รายการ กรองสถานะ ค้นหา สรุปยอด
import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, RefreshControl, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Search, ChevronRight, Clock, CheckCircle2, XCircle, Wallet, User } from 'lucide-react-native';
import { Text, Card } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { listOrders, summarizeOrders, type Order } from '../../lib/api';

type Filter = 'all' | 'pending' | 'confirmed' | 'paid' | 'cancelled';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' }, { id: 'pending', label: 'รอชำระ' },
  { id: 'confirmed', label: 'ยืนยันแล้ว' }, { id: 'paid', label: 'ชำระแล้ว' },
  { id: 'cancelled', label: 'ยกเลิก' },
];
const STATUS_UI: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'รอชำระ', color: '#b45309', bg: '#fef3c7', icon: <Clock size={14} color="#b45309" /> },
  confirmed: { label: 'ยืนยันแล้ว', color: '#7c3aed', bg: '#ede9fe', icon: <CheckCircle2 size={14} color="#7c3aed" /> },
  paid: { label: 'ชำระแล้ว', color: '#059669', bg: '#dcfce7', icon: <Wallet size={14} color="#059669" /> },
  cancelled: { label: 'ยกเลิก', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} color="#dc2626" /> },
};
function statusUI(s: string) { return STATUS_UI[s] ?? STATUS_UI.pending; }
function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }); }
  catch { return iso; }
}

export default function OrdersScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { member } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!member?.email) { setLoading(false); return; }
    setError(null);
    const { data, error: err } = await listOrders({ email: member.email, isAdmin: member.role === 'admin' });
    setOrders(data); setError(err); setLoading(false); setRefreshing(false);
  }, [member?.email, member?.role]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const summary = useMemo(() => summarizeOrders(orders), [orders]);
  const visible = useMemo(() => {
    let list = orders;
    if (filter !== 'all') list = list.filter((o) => o.status === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((o) => o.id.toLowerCase().includes(q) || (o.email ?? '').toLowerCase().includes(q) || String(o.ad_spend ?? '').includes(q));
    return list;
  }, [orders, filter, query]);

  if (!member) {
    return (
      <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={styles.center}>
        <Package color="#a78bfa" size={40} />
        <Text style={{ color: '#fff', textAlign: 'center' }}>เข้าสู่ระบบเพื่อดูออเดอร์และใบเสร็จของคุณ</Text>
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
        <Text variant="heading" style={{ color: '#fff' }}>ออเดอร์ของฉัน</Text>
        <Text variant="caption" color="#a78bfa" style={{ marginBottom: 12 }}>
          {member.role === 'admin' ? 'มุมมองผู้ดูแล — เห็นออเดอร์ทั้งหมด' : member.name}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text variant="title" style={{ color: c.text }}>{summary.count}</Text>
            <Text variant="caption" color={c.textMuted}>ออเดอร์ทั้งหมด</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text variant="title" style={{ color: '#fbbf24' }}>{summary.pending}</Text>
            <Text variant="caption" color={c.textMuted}>รอชำระเงิน</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text variant="title" style={{ color: '#34d399' }}>{summary.paidCount}</Text>
            <Text variant="caption" color={c.textMuted}>ชำระแล้ว</Text>
          </View>
        </View>

        <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Search color={c.textMuted} size={18} />
          <TextInput value={query} onChangeText={setQuery} placeholder="ค้นหารหัสออเดอร์ / อีเมล / ยอด"
            placeholderTextColor={c.textMuted} style={{ flex: 1, color: c.text, fontSize: 15 }} autoCapitalize="none" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <Pressable key={f.id} onPress={() => setFilter(f.id)}
                  style={[styles.chip, { backgroundColor: active ? '#7c3aed' : c.surface, borderColor: active ? '#7c3aed' : c.border }]}>
                  <Text variant="caption" style={{ color: active ? '#fff' : c.textSecondary, fontWeight: '700' }}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {loading ? (<Card><Text color={c.textMuted}>กำลังโหลดออเดอร์…</Text></Card>)
          : error ? (
            <Card>
              <Text style={{ color: '#fca5a5', fontWeight: '700' }}>โหลดออเดอร์ไม่สำเร็จ</Text>
              <Text variant="caption" color={c.textMuted}>{error}</Text>
              <Pressable onPress={() => { setLoading(true); load(); }} style={[styles.bigBtn, { backgroundColor: '#7c3aed', marginTop: 8 }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>ลองใหม่</Text>
              </Pressable>
            </Card>
          ) : visible.length === 0 ? (
            <Card>
              <Text color={c.textMuted}>{orders.length === 0 ? 'ยังไม่มีออเดอร์ — เริ่มต้นสั่งซื้อแพ็กเกจได้เลย' : 'ไม่พบออเดอร์ที่ตรงกับเงื่อนไข'}</Text>
              {orders.length === 0 ? (
                <Pressable onPress={() => router.push('/checkout')} style={[styles.bigBtn, { backgroundColor: '#7c3aed', marginTop: 8 }]}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>สั่งซื้อแพ็กเกจใหม่</Text>
                </Pressable>
              ) : null}
            </Card>
          ) : (
            visible.map((o) => {
              const ui = statusUI(o.status);
              return (
                <Pressable key={o.id} onPress={() => router.push(`/receipt/${o.id}`)}
                  style={({ pressed }) => [styles.row, { backgroundColor: c.surface, borderColor: c.border }, pressed && { transform: [{ scale: 0.99 }] }]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={[styles.pill, { backgroundColor: ui.bg }]}>
                        {ui.icon}
                        <Text variant="footnote" style={{ color: ui.color, fontWeight: '700' }}>{ui.label}</Text>
                      </View>
                      {member.role === 'admin' ? (
                        <Text variant="footnote" color={c.textMuted} numberOfLines={1} style={{ flex: 1 }}>
                          <User size={11} color={c.textMuted} /> {o.email}
                        </Text>
                      ) : null}
                    </View>
                    <Text variant="body" style={{ color: c.text, fontWeight: '700' }}>
                      {o.days} วัน · {Array.isArray(o.platforms) ? o.platforms.length : 0} แพลตฟอร์ม
                    </Text>
                    <Text variant="footnote" color={c.textMuted}>{o.id} · {fmtDate(o.created_at)}</Text>
                    <Text variant="body" style={{ color: c.accent, fontWeight: '800' }}>
                      {(o.ad_spend ?? 0).toLocaleString('th-TH')} บาท
                    </Text>
                  </View>
                  <ChevronRight color={c.textMuted} size={20} />
                </Pressable>
              );
            })
          )}

        <Pressable onPress={() => router.push('/checkout')} style={[styles.bigBtn, { backgroundColor: '#7c3aed', marginTop: 16 }]}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>สั่งซื้อแพ็กเกจใหม่</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, gap: 2, alignItems: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  bigBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
});

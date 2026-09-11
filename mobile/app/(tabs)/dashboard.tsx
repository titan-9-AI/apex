// แท็บแดชบอร์ดสมาชิก — ดูออเดอร์ + ข้อมูลบัญชี
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Receipt, Plus, User } from 'lucide-react-native';
import { Text, Card } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

type Order = {
  id: string; email: string; days: number; per_day: number;
  ai_fee: number; ad_spend: number; platforms: string[]; status: string; created_at: string;
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { member } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!member?.email) return;
    // แอดมินเห็นออเดอร์ทั้งหมด / สมาชิกเห็นของตัวเอง
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (member.role !== 'admin') q = q.eq('email', member.email);
    const { data } = await q;
    if (data) setOrders(data as Order[]);
  }, [member?.email, member?.role]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const totalSpend = orders.reduce((s, o) => s + (o.ad_spend ?? 0), 0);

  if (!member) {
    return (
      <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
        <User color="#a78bfa" size={40} />
        <Text style={{ color: '#fff', textAlign: 'center' }}>เข้าสู่ระบบเพื่อดูแดชบอร์ดและออเดอร์ของคุณ</Text>
        <Pressable onPress={() => router.push('/login')} style={[styles.loginBtn, { backgroundColor: '#7c3aed' }]}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>เข้าสู่ระบบ</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text variant="heading" style={{ color: '#fff' }}>แดชบอร์ด</Text>
        <Text variant="caption" color="#a78bfa" style={{ marginBottom: 12 }}>สวัสดี {member.name}</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.accent }]}>
            <Package color={c.accent} size={18} />
            <Text variant="title" style={{ color: c.text }}>{orders.length}</Text>
            <Text variant="caption" color={c.textMuted}>ออเดอร์</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.accent }]}>
            <Receipt color={c.accent} size={18} />
            <Text variant="title" style={{ color: c.text }}>{totalSpend.toLocaleString('th-TH')}</Text>
            <Text variant="caption" color={c.textMuted}>บาทรวม</Text>
          </View>
        </View>

        <Pressable onPress={() => router.push('/checkout')} style={[styles.orderBtn, { backgroundColor: '#7c3aed' }]}>
          <Plus color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '800' }}>สั่งซื้อแพ็กเกจใหม่</Text>
        </Pressable>

        <Text variant="subhead" style={{ color: '#fff', marginTop: 20, marginBottom: 10 }}>ออเดอร์ของฉัน</Text>
        {orders.length === 0 ? (
          <Card><Text color={c.textMuted}>ยังไม่มีออเดอร์ — กด "สั่งซื้อแพ็กเกจใหม่" เพื่อเริ่ม</Text></Card>
        ) : (
          orders.map((o) => (
            <Card key={o.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="body" style={{ color: c.text, fontWeight: '700' }}>{o.days} วัน · {Array.isArray(o.platforms) ? o.platforms.length : 0} แพลตฟอร์ม</Text>
                <View style={[styles.status, { backgroundColor: o.status === 'paid' ? '#dcfce7' : o.status === 'confirmed' ? '#ede9fe' : '#fef3c7' }]}>
                  <Text variant="footnote" style={{ color: o.status === 'paid' ? '#059669' : o.status === 'confirmed' ? '#7c3aed' : '#b45309', fontWeight: '700' }}>
                    {o.status === 'paid' ? 'ชำระแล้ว' : o.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอชำระ'}
                  </Text>
                </View>
              </View>
              <Text variant="caption" color={c.textMuted}>{o.id}</Text>
              <Text variant="body" style={{ color: c.accent, fontWeight: '800', marginTop: 4 }}>{o.ad_spend?.toLocaleString('th-TH')} บาท</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  orderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  status: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  loginBtn: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
});


// แท็บโปรไฟล์ — แสดง/ออกจากระบบสมาชิก
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogOut, ShieldCheck, Moon, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { member, signOut } = useAuth();
  const { theme, isDark, toggle } = useTheme();
  const c = theme.colors;

  const doSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <View style={styles.wrap}>
        <Text variant="heading" style={{ color: '#fff', marginBottom: 20 }}>โปรไฟล์</Text>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={[styles.avatar, { backgroundColor: c.accent }]}>
            <User color="#fff" size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subhead" style={{ color: c.text }}>{member?.name ?? 'ผู้เยี่ยมชม'}</Text>
            <Text variant="caption" color={c.textMuted}>{member?.email ?? 'ยังไม่ได้เข้าสู่ระบบ'}</Text>
            {member?.role === 'admin' ? (
              <View style={[styles.adminBadge, { backgroundColor: c.accentSoft }]}>
                <ShieldCheck color="#4c1d95" size={13} />
                <Text variant="footnote" style={{ color: '#4c1d95', fontWeight: '700' }}>ผู้ดูแลระบบ</Text>
              </View>
            ) : null}
          </View>
        </Card>

        <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Moon color={c.accent} size={20} />
            <Text style={{ color: c.text }}>โหมดมืด</Text>
          </View>
          <Button title={isDark ? 'เปิด' : 'ปิด'} variant="secondary" onPress={toggle} />
        </Card>

        <View style={{ marginTop: 24, gap: 10 }}>
          {member?.role === 'admin' ? (
            <Button title="ตั้งค่าระบบ" variant="secondary" icon={<Settings color={c.accent} size={18} />} onPress={() => router.push('/settings')} />
          ) : null}
          {member ? (
            <Button title="ออกจากระบบ" variant="destructive" icon={<LogOut color="#fff" size={18} />} onPress={doSignOut} />
          ) : (
            <Button title="เข้าสู่ระบบ" variant="primary" onPress={() => router.push('/login')} />
          )}
        </View>

        <Text variant="footnote" color="#a78bfa" style={{ textAlign: 'center', marginTop: 24 }}>
          APEX @TITAN-9 AI v1.0
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start', marginTop: 6 },
});


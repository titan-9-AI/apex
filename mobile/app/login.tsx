================================================================
// หน้าเข้าสู่ระบบ/สมัครสมาชิก — แบบแอปเต็มจอ
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!email || !password) { setErr('กรุณากรอกอีเมลและรหัสผ่าน'); return; }
    setBusy(true); setErr('');
    const res = mode === 'login' ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? 'เกิดข้อผิดพลาด'); return; }
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.wrap}>
          <View style={styles.brand}>
            <LinearGradient colors={['#7c3aed', '#ec4899']} style={styles.logoCircle}>
              <Text variant="heading" style={{ color: '#fff', fontWeight: '900' }}>A</Text>
            </LinearGradient>
            <Text variant="title" style={{ color: '#fff' }}>APEX TITAN-9 AI</Text>
            <Text variant="caption" style={{ color: '#d8ccf5' }}>วางแผนโฆษณา 7 ช่องทาง อัตโนมัติด้วย AI</Text>
          </View>

          <View style={styles.tabs}>
            {(['login', 'signup'] as const).map((m) => (
              <View key={m} style={{ flex: 1 }}>
                <Button title={m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'} variant={mode === m ? 'primary' : 'ghost'} onPress={() => { setMode(m); setErr(''); }} />
              </View>
            ))}
          </View>

          <View style={styles.form}>
            {mode === 'signup' ? (
              <Input label="ชื่อ" value={name} onChangeText={setName} placeholder="ชื่อของคุณ" autoCapitalize="words" />
            ) : null}
            <Input label="อีเมล" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
            <Input label="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            {err ? <Text color="#fca5a5" style={{ marginBottom: 8 }}>{err}</Text> : null}
            <Button title={mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'} onPress={submit} loading={busy} />
            <Text variant="footnote" color="#a78bfa" style={{ textAlign: 'center', marginTop: 12 }}>
              ทดสอบ: demo@titan9.ai / demo1234 (สมาชิก)
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 8, marginBottom: 32 },
  logoCircle: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  tabs: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  form: { gap: 4 },
});


================================================================

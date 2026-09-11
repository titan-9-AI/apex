// components/SettingsScreen.tsx — หน้าตั้งค่าระบบ (แอดมิน) ใช้ร่วมกันทั้งแท็บและหน้าเต็ม
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Switch } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Check, Cloud, RotateCcw, Save, ShieldCheck, Contact, Mail, MessageSquare,
} from 'lucide-react-native';
import { Text, Card } from './ui';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

function Field({
  label, value, onChange, num,
}: { label: string; value: string; onChange: (t: string) => void; num?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text variant="caption" color={theme.colors.textSecondary} style={{ marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={num ? 'numeric' : 'default'}
        placeholderTextColor={theme.colors.textMuted}
        style={{
          backgroundColor: theme.colors.surfaceAlt, borderRadius: 10,
          paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.text, fontSize: 15,
        }}
      />
    </View>
  );
}

export default function SettingsScreen({ inTab = false }: { inTab?: boolean }) {
  const { theme } = useTheme();
  const { settings, update, reset, syncToCloud, synced } = useSettings();
  const { member } = useAuth();
  const isAdmin = member?.role === 'admin';

  const [fee, setFee] = useState(String(settings.servicePerDay));
  const [payName, setPayName] = useState(settings.payment.bankHolder);
  const [bankAcct, setBankAcct] = useState(settings.payment.bankAccount);
  const [bankName, setBankName] = useState(settings.payment.bankName);
  const [tm, setTm] = useState(settings.payment.trueMoney);
  const [email, setEmail] = useState(settings.contact.email);
  const [line, setLine] = useState(settings.contact.line);
  const [saved, setSaved] = useState(false);
  const [cloudMsg, setCloudMsg] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(settings.durations.map((d) => [String(d.days), String(d.aiFee)]))
  );
  const [budgets, setBudgets] = useState<Record<string, string>>(
    Object.fromEntries(settings.platforms.map((p) => [p.id, String(p.dailyBudget)]))
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(settings.platforms.map((p) => [p.id, p.enabled !== false]))
  );

  if (!member) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>กรุณาเข้าสู่ระบบก่อน</Text>
        <Pressable onPress={() => router.replace('/login')}><Text color="#7c3aed">ไปที่หน้าเข้าสู่ระบบ</Text></Pressable>
      </View>
    );
  }
  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <ShieldCheck color="#a78bfa" size={40} />
        <Text style={styles.centerText}>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</Text>
        <Pressable onPress={() => router.back()}><Text color="#7c3aed">ย้อนกลับ</Text></Pressable>
      </View>
    );
  }

  const save = () => {
    update({
      servicePerDay: Math.max(0, Number(fee) || settings.servicePerDay),
      durations: settings.durations.map((d) => ({
        ...d, aiFee: Math.max(0, Number(drafts[String(d.days)]) || d.aiFee),
      })),
      platforms: settings.platforms.map((p) => ({
        ...p,
        dailyBudget: Math.max(0, Number(budgets[p.id]) || p.dailyBudget),
        enabled: enabled[p.id] !== false,
      })),
      payment: {
        ...settings.payment,
        bankName: bankName.trim() || settings.payment.bankName,
        bankHolder: payName.trim() || settings.payment.bankHolder,
        bankAccount: bankAcct.trim() || settings.payment.bankAccount,
        trueMoney: tm.trim() || settings.payment.trueMoney,
      },
      contact: {
        email: email.trim() || settings.contact.email,
        line: line.trim() || settings.contact.line,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const doSync = async () => {
    setCloudMsg('กำลังซิงก์...');
    const res = await syncToCloud();
    setCloudMsg(res.ok ? 'ซิงก์ขึ้นระบบแล้ว (ทุกเครื่องใช้ค่าเดียวกัน)' : `ล้มเหลว: ${res.error ?? ''}`);
  };

  const doReset = () => {
    reset();
    setCloudMsg('คืนค่าเริ่มต้นแล้ว — กดบันทึกเพื่อยืนยัน');
  };

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <View style={styles.headRow}>
          {!inTab ? (
            <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
              <ArrowLeft color={theme.colors.text} size={20} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text variant="heading" style={{ color: '#fff' }}>ตั้งค่าระบบ</Text>
            <Text variant="footnote" color="#a78bfa">เฉพาะผู้ดูแลระบบ</Text>
          </View>
          <View style={styles.adminChip}>
            <ShieldCheck color="#fff" size={14} />
            <Text variant="footnote" style={{ color: '#fff', fontWeight: '700' }}>แอดมิน</Text>
          </View>
        </View>

        <Text variant="subhead" style={styles.sectionTitle}>ราคา</Text>
        <Card>
          <Field label="ค่าบริการ (บาท/วัน)" value={fee} onChange={setFee} num />
        </Card>

        <Text variant="subhead" style={styles.sectionTitle}>ค่าใช้บริการ AI ต่อระยะเวลา</Text>
        <Card style={{ gap: 0 }}>
          {settings.durations.map((d) => (
            <View key={d.days} style={{ marginBottom: 10 }}>
              <Field
                label={`แพ็ก ${d.days} วัน (บาท)`}
                value={drafts[String(d.days)] ?? ''}
                onChange={(t) => setDrafts((p) => ({ ...p, [String(d.days)]: t }))}
                num
              />
            </View>
          ))}
        </Card>

        <Text variant="subhead" style={styles.sectionTitle}>งบโฆษณา/วัน ต่อแพลตฟอร์ม</Text>
        <Card style={{ gap: 0 }}>
          {settings.platforms.map((p) => (
            <View key={p.id} style={{ marginBottom: 8 }}>
              <Field
                label={p.name}
                value={budgets[p.id] ?? ''}
                onChange={(t) => setBudgets((prev) => ({ ...prev, [p.id]: t }))}
                num
              />
              <View style={styles.switchRow}>
                <Text variant="footnote" color={theme.colors.textSecondary}>เปิดใช้งานแพลตฟอร์มนี้</Text>
                <Switch
                  value={enabled[p.id] !== false}
                  onValueChange={(v) => setEnabled((prev) => ({ ...prev, [p.id]: v }))}
                  trackColor={{ true: '#7c3aed', false: '#3b2a66' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          ))}
        </Card>

        <Text variant="subhead" style={styles.sectionTitle}>ช่องทางชำระเงิน</Text>
        <Card style={{ gap: 0 }}>
          <Field label="ชื่อธนาคาร" value={bankName} onChange={setBankName} />
          <Field label="ชื่อเจ้าของบัญชี" value={payName} onChange={setPayName} />
          <Field label="เลขที่บัญชีธนาคาร" value={bankAcct} onChange={setBankAcct} />
          <Field label="เบอร์ TrueMoney Wallet" value={tm} onChange={setTm} />
        </Card>

        <Text variant="subhead" style={styles.sectionTitle}>ช่องทางติดต่อ</Text>
        <Card style={{ gap: 0 }}>
          <View style={styles.iconRow}>
            <Mail color={theme.colors.accent} size={16} />
            <Text variant="footnote" color={theme.colors.textSecondary}>อีเมล</Text>
          </View>
          <Field label="อีเมลติดต่อ" value={email} onChange={setEmail} />
          <View style={styles.iconRow}>
            <MessageSquare color={theme.colors.accent} size={16} />
            <Text variant="footnote" color={theme.colors.textSecondary}>LINE</Text>
          </View>
          <Field label="LINE ID" value={line} onChange={setLine} />
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Pressable onPress={doReset} style={[styles.btn, { backgroundColor: theme.colors.surfaceAlt }]}>
            <RotateCcw color={theme.colors.text} size={18} />
            <Text style={{ color: theme.colors.text }}>คืนค่าเดิม</Text>
          </Pressable>
          <Pressable onPress={save} style={[styles.btn, styles.saveBtn]}>
            {saved ? <Check color="#fff" size={18} /> : <Save color="#fff" size={18} />}
            <Text style={{ color: '#fff', fontWeight: '700' }}>{saved ? 'บันทึกแล้ว' : 'บันทึก'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={doSync} style={[styles.syncBtn, { backgroundColor: synced ? theme.colors.surfaceAlt : '#7c3aed' }]}>
          <Cloud color={synced ? theme.colors.accent : '#fff'} size={18} />
          <Text style={{ color: synced ? theme.colors.accent : '#fff', fontWeight: '700' }}>
            {synced ? 'ค่าเชื่อมกับระบบแล้ว — กดเพื่อซิงก์ใหม่' : 'ซิงก์ค่าขึ้นระบบ (ทุกเครื่องใช้ร่วมกัน)'}
          </Text>
        </Pressable>
        {cloudMsg ? (
          <Text variant="footnote" color="#a78bfa" style={{ textAlign: 'center', marginTop: 8 }}>{cloudMsg}</Text>
        ) : null}

        <View style={styles.footerNote}>
          <Contact color={theme.colors.textMuted} size={14} />
          <Text variant="footnote" color={theme.colors.textMuted} style={{ flex: 1 }}>
            ค่าที่บันทึกจะถูกนำไปใช้ในหน้าแพ็กเกจ สั่งซื้อ และใบเสร็จทันที
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  adminChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#7c3aed' },
  sectionTitle: { color: '#fff', marginTop: 18, marginBottom: 10 },
  center: { flex: 1, backgroundColor: '#15082b', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  centerText: { color: '#fff', textAlign: 'center' },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  saveBtn: { backgroundColor: '#7c3aed' },
  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4, marginTop: -4, marginBottom: 8 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 20 },
});

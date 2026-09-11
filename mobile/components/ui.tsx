================================================================
// คอมโพเนนต์ UI พื้นฐาน (ธีมจาก ThemeContext)
import React from 'react';
import {
  View, Text as RNText, Pressable, TextInput, ScrollView,
  StyleSheet, TextStyle, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

// ---- Screen ----
export function Screen({ children, scroll, gradient }: { children: React.ReactNode; scroll?: boolean; gradient?: boolean }) {
  const { theme, isDark } = useTheme();
  const c = theme.colors;
  const inner = (
    <View style={{ flex: 1, backgroundColor: c.background, padding: theme.spacing.lg }}>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      {gradient && isDark ? (
        <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
          {scroll ? <ScrollView contentContainerStyle={styles.scrollPad} keyboardShouldPersistTaps="handled">{children}</ScrollView> : inner}
        </LinearGradient>
      ) : scroll ? (
        <ScrollView contentContainerStyle={styles.scrollPad} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      ) : inner}
    </SafeAreaView>
  );
}

// ---- Text ----
export function Text({ variant = 'body', color, style, children, ...rest }: {
  variant?: 'title' | 'heading' | 'subhead' | 'body' | 'caption' | 'footnote';
  color?: string; style?: TextStyle; children: React.ReactNode;
} & Omit<RNText['props'], 'style'>) {
  const { theme } = useTheme();
  const c = theme.colors;
  const size = theme.type[variant as 'title'] || theme.type.body;
  const weight: TextStyle['fontWeight'] = variant === 'title' || variant === 'heading' ? '800' : variant === 'subhead' ? '600' : '400';
  const opacity = variant === 'caption' || variant === 'footnote' ? 0.85 : 1;
  return (
    <RNText {...rest} style={[{ fontSize: size, fontWeight: weight, color: color ?? c.text, opacity }, style]}>
      {children}
    </RNText>
  );
}

// ---- Button ----
export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: {
  title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  icon?: React.ReactNode; loading?: boolean; disabled?: boolean; style?: object;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const bg = variant === 'primary' ? c.accent : variant === 'secondary' ? c.surfaceAlt : variant === 'destructive' ? '#dc2626' : 'transparent';
  const fg = variant === 'primary' || variant === 'destructive' ? c.onAccent : variant === 'ghost' ? c.accent : c.text;
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        { backgroundColor: bg, borderRadius: theme.radius.lg, paddingVertical: theme.spacing.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm, opacity: disabled ? 0.5 : 1 },
        variant === 'ghost' && { borderWidth: 1.5, borderColor: c.accent },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <RNText style={{ color: fg, fontSize: 16, fontWeight: '700' }}>{title}</RNText>
    </Pressable>
  );
}

// ---- Input ----
export function Input({ label, value, onChangeText, placeholder, secureTextEntry, autoCapitalize, keyboardType, error }: {
  label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  secureTextEntry?: boolean; autoCapitalize?: 'none' | 'words' | 'sentences'; keyboardType?: 'email-address' | 'default'; error?: string;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
      {label ? <RNText style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600' }}>{label}</RNText> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
        keyboardType={keyboardType}
        style={{
          backgroundColor: c.surface, borderRadius: theme.radius.md, borderWidth: 1,
          borderColor: error ? '#ef4444' : c.border, paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md, color: c.text, fontSize: 16,
        }}
      />
      {error ? <RNText style={{ color: '#ef4444', fontSize: 12 }}>{error}</RNText> : null}
    </View>
  );
}

// ---- Card ----
export function Card({ children, pressable, onPress, style }: { children: React.ReactNode; pressable?: boolean; onPress?: () => void; style?: object }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const base = { backgroundColor: c.surface, borderRadius: theme.radius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: c.border, gap: theme.spacing.sm };
  if (!pressable) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed && { transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({ scrollPad: { padding: 16, paddingBottom: 40 } });


================================================================

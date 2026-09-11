================================================================
// ทางเข้าหลัก — ถ้าเข้าสู่ระบบแล้วไปแท็บ ถ้ายังไปล็อกอิน
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Index() {
  const { member, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }
  return <Redirect href={member ? '/(tabs)' : '/login'} />;
}


================================================================

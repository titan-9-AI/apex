================================================================
// กลุ่มแท็บหลัก — แดชบอร์ด / แชต / แพ็กเกจ / โปรไฟล์
import React from 'react';
import { Tabs } from 'expo-router';
import { MessageCircle, Package, User, LayoutDashboard } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'แดชบอร์ด', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="index" options={{ title: 'แชต AI', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }} />
      <Tabs.Screen name="pricing" options={{ title: 'แพ็กเกจ', tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'โปรไฟล์', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}


================================================================

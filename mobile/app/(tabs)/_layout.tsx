// กลุ่มแท็บหลัก — แดชบอร์ด / แชต / แพ็กเกจ / ออเดอร์ / ใบเสร็จ / ตั้งค่า / โปรไฟล์
import React from 'react';
import { Tabs } from 'expo-router';
import {
  MessageCircle, Package, User, LayoutDashboard, ShoppingBag, ReceiptText, Settings as SettingsIcon,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { member } = useAuth();
  const isAdmin = member?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'แดชบอร์ด', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen name="index" options={{ title: 'แชต AI', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }} />
      <Tabs.Screen name="pricing" options={{ title: 'แพ็กเกจ', tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'ออเดอร์', tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }} />
      <Tabs.Screen name="receipts" options={{ title: 'ใบเสร็จ', tabBarIcon: ({ color, size }) => <ReceiptText color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'โปรไฟล์', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'ตั้งค่า',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

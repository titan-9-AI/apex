// metro.config.js — ตั้งค่า Metro สำหรับ Expo
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// รองรับไฟล์ svg และ asset ที่ใช้ในแอป
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];
config.resolver.assetExts = [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif', 'webp'];

module.exports = config;

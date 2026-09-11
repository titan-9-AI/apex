module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // expo-router ต้องใช้ plugin นี้
      'expo-router/babel',
    ],
  };
};

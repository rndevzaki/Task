module.exports = {
  presets: ['module:metro-react-native-babel-preset'], // Use the preset aligned with RN 0.72.x
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
    // IMPORTANT: react-native-reanimated/plugin MUST be listed last.
    // Add if you install react-native-reanimated later.
    // 'react-native-reanimated/plugin',
  ],
};

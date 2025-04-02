import React from 'react';
import { StatusBar } from 'react-native'; // Use RN StatusBar
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Gesture handler import is now in index.js

import AppNavigator from '@/navigation/AppNavigator';
import { colors } from '@/styles/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Use React Native's StatusBar */}
      <StatusBar
        barStyle="dark-content" // or "light-content" depending on background
        backgroundColor={colors.background} // Set background color for Android
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  color = colors.primary,
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
};

export default LoadingIndicator;

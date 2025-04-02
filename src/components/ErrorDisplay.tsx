import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, fullScreen = false }) => {
  const containerStyle = fullScreen ? commonStyles.errorContainer : {};

  return (
    <View style={containerStyle}>
      <Icon name="alert-circle-outline" size={40} color={colors.error} style={{ marginBottom: 10 }} />
      <Text style={commonStyles.errorText}>{message || 'An unexpected error occurred.'}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.buttonSecondary]}
          onPress={onRetry}
        >
          <Icon name="refresh-outline" size={18} color={colors.primary} />
          <Text style={[commonStyles.buttonText, commonStyles.buttonSecondaryText]}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorDisplay;

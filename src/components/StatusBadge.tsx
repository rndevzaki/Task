import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStatus, TaskStatus } from '@/types';
import { colors } from '@/styles/colors';

interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus;
}

const getStatusStyle = (status: ProjectStatus | TaskStatus) => {
  switch (status) {
    // Project Statuses
    case ProjectStatus.Active:
      return { backgroundColor: colors.statusActive, color: colors.white };
    case ProjectStatus.OnHold:
      return { backgroundColor: colors.statusOnHold, color: colors.text }; // Darker text for yellow
    case ProjectStatus.Completed:
      return { backgroundColor: colors.statusCompleted, color: colors.white };

    // Task Statuses
    case TaskStatus.Todo:
      return { backgroundColor: colors.statusTodo, color: colors.white };
    case TaskStatus.InProgress:
      return { backgroundColor: colors.statusInProgress, color: colors.white };
    case TaskStatus.Done:
      return { backgroundColor: colors.statusDone, color: colors.white };

    default:
      return { backgroundColor: colors.grey, color: colors.white };
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const style = getStatusStyle(status);

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12, // More rounded
    alignSelf: 'flex-start', // Take only needed space
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default StatusBadge;

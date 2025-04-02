import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';
import StatusBadge from './StatusBadge';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const getPriorityIcon = (priority: TaskPriority): { name: string; color: string } => {
  switch (priority) {
    case TaskPriority.High:
      return { name: 'arrow-up-circle', color: colors.priorityHigh };
    case TaskPriority.Medium:
      return { name: 'arrow-forward-circle-outline', color: colors.priorityMedium }; // Using outline for medium
    case TaskPriority.Low:
      return { name: 'arrow-down-circle', color: colors.priorityLow };
    default:
      return { name: 'remove-circle-outline', color: colors.grey };
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const formattedDueDate = task.dueDate
    ? task.dueDate.toLocaleDateString()
    : 'No due date';
  const priorityIcon = getPriorityIcon(task.priority);

  return (
    <TouchableOpacity style={commonStyles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={commonStyles.flexRowSpaceBetween}>
        <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
        <StatusBadge status={task.status} />
      </View>
      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}
      <View style={styles.footer}>
        <View style={[commonStyles.row, styles.infoRow]}>
          <Icon name={priorityIcon.name} size={18} color={priorityIcon.color} style={commonStyles.icon} />
          <Text style={styles.footerText}>Priority: {task.priority}</Text>
        </View>
        {task.assigneeName && ( // Display assigneeName
          <View style={[commonStyles.row, styles.infoRow]}>
            <Icon name="person-outline" size={16} color={colors.textSecondary} style={commonStyles.icon} />
            <Text style={styles.footerText}>Assignee: {task.assigneeName}</Text>
          </View>
        )}
        <View style={[commonStyles.row, styles.infoRow]}>
          <Icon name="calendar-outline" size={16} color={colors.textSecondary} style={commonStyles.icon} />
          <Text style={styles.footerText}>Due: {formattedDueDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 18,
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  infoRow: {
    marginBottom: 4, // Add spacing between info rows
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default TaskCard;

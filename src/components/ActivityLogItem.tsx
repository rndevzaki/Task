import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityLog, ActivityAction } from '@/types';
import { colors } from '@/styles/colors';

interface ActivityLogItemProps {
  log: ActivityLog;
}

const getActivityIcon = (action: ActivityAction): string => {
    switch (action) {
        case ActivityAction.CREATED_PROJECT:
        case ActivityAction.CREATED_TASK:
            return 'add-circle-outline';
        case ActivityAction.UPDATED_PROJECT:
        case ActivityAction.UPDATED_TASK:
            return 'pencil-outline';
        case ActivityAction.DELETED_PROJECT:
        case ActivityAction.DELETED_TASK:
            return 'trash-outline';
        case ActivityAction.ADDED_COMMENT:
            return 'chatbubble-ellipses-outline';
        default:
            return 'information-circle-outline';
    }
};

const getActivityColor = (action: ActivityAction): string => {
     switch (action) {
         case ActivityAction.CREATED_PROJECT:
         case ActivityAction.CREATED_TASK:
             return colors.success;
         case ActivityAction.UPDATED_PROJECT:
         case ActivityAction.UPDATED_TASK:
             return colors.info;
         case ActivityAction.DELETED_PROJECT:
         case ActivityAction.DELETED_TASK:
             return colors.error;
         case ActivityAction.ADDED_COMMENT:
             return colors.primaryLight;
         default:
             return colors.grey;
     }
};

const formatActivityText = (log: ActivityLog): string => {
    let text = `${log.actorName} `;
    switch (log.action) {
        case ActivityAction.CREATED_PROJECT:
            text += `created project '${log.targetTitle || log.targetId}'`;
            break;
        case ActivityAction.UPDATED_PROJECT:
            text += `updated project '${log.targetTitle || log.targetId}'`;
            break;
        case ActivityAction.DELETED_PROJECT:
            text += `deleted project '${log.targetTitle || log.targetId}'`;
            break;
        case ActivityAction.CREATED_TASK:
            text += `created task '${log.targetTitle || log.targetId}'`;
            break;
        case ActivityAction.UPDATED_TASK:
            text += `updated task '${log.targetTitle || log.targetId}'`;
            break;
        case ActivityAction.DELETED_TASK:
            text += `deleted task '${log.targetTitle || log.targetId}'`;
            break;
        case ActivityAction.ADDED_COMMENT:
             text += `commented on task '${log.targetTitle || log.targetId}'`; // Need to fetch task title if not denormalized
             break;
        default:
            text += `performed action ${log.action} on ${log.targetType} ${log.targetId}`;
    }
    if (log.details) {
        text += ` (${log.details})`;
    }
    return text;
};


const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ log }) => {
  const formattedDate = log.timestamp.toLocaleString();
  const iconName = getActivityIcon(log.action);
  const iconColor = getActivityColor(log.action);
  const activityText = formatActivityText(log);


  return (
    <View style={styles.container}>
      <Icon name={iconName} size={20} color={iconColor} style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.text} numberOfLines={2}>{activityText}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  icon: {
    marginRight: 12,
    marginTop: 2, // Align icon slightly lower
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ActivityLogItem;

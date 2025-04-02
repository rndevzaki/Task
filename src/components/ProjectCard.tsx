import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Project, ProjectStatus } from '@/types';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';
import StatusBadge from './StatusBadge'; // We'll create this

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const formattedDeadline = project.deadline
    ? project.deadline.toLocaleDateString()
    : 'No deadline';

  return (
    <TouchableOpacity style={commonStyles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={commonStyles.flexRowSpaceBetween}>
        <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
        <StatusBadge status={project.status} />
      </View>
      {project.description && (
        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>
      )}
      <View style={styles.footer}>
        <View style={commonStyles.row}>
          <Icon name="calendar-outline" size={16} color={colors.textSecondary} style={commonStyles.icon} />
          <Text style={styles.footerText}>Deadline: {formattedDeadline}</Text>
        </View>
        {/* Optionally add task count here if available */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1, // Allow title to take available space
    marginRight: 8, // Space before badge
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default ProjectCard;

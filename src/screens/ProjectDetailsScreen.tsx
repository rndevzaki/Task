import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import api from '@/api/mockApi';
import {
    Project, Task, RootStackParamList, ActivityLog, User,
    TaskSortField, SortDirection, TaskSortCriteria, TaskFilterCriteria, TaskStatus, TaskPriority
} from '@/types';
import LoadingIndicator from '@/components/LoadingIndicator';
import ErrorDisplay from '@/components/ErrorDisplay';
import StatusBadge from '@/components/StatusBadge';
import TaskCard from '@/components/TaskCard';
import ActivityLogItem from '@/components/ActivityLogItem';
import FilterSortControls from '@/components/FilterSortControls'; // Import controls
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

type ProjectDetailsRouteProp = RouteProp<RootStackParamList, 'ProjectDetails'>;
type ProjectDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'ProjectDetails'>;

// Define Sort and Filter Options for Tasks
const taskSortOptions: { label: string; value: TaskSortField }[] = [
    { label: 'Title', value: 'title' },
    { label: 'Status', value: 'status' },
    { label: 'Priority', value: 'priority' },
    { label: 'Due Date', value: 'dueDate' },
    { label: 'Created Date', value: 'createdAt' },
];

// Need users for assignee filter - fetch them or use mock list directly
// For simplicity here, we'll assume users are fetched or available
// In a real app, fetch users associated with the project
const mockUsersForFilter: User[] = [ // Example users
    { id: 'user-1', name: 'Alice' },
    { id: 'user-2', name: 'Bob' },
    { id: 'user-3', name: 'Charlie' },
    { id: 'user-4', name: 'Diana' },
];

const taskFilterOptions = [
    {
        label: 'Status',
        field: 'status' as keyof TaskFilterCriteria,
        options: [
            { label: 'All Statuses', value: null },
            ...Object.values(TaskStatus).map(s => ({ label: s, value: s })),
        ],
    },
    {
        label: 'Priority',
        field: 'priority' as keyof TaskFilterCriteria,
        options: [
            { label: 'All Priorities', value: null },
            ...Object.values(TaskPriority).map(p => ({ label: p, value: p })),
        ],
    },
    {
        label: 'Assignee',
        field: 'assigneeId' as keyof TaskFilterCriteria,
        options: [
            { label: 'All Assignees', value: null },
            { label: 'Unassigned', value: 'unassigned' }, // Special value for unassigned
            ...mockUsersForFilter.map(u => ({ label: u.name, value: u.id })),
        ],
    },
];


const ProjectDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ProjectDetailsNavigationProp>();
  const route = useRoute<ProjectDetailsRouteProp>();
  const { projectId } = route.params;

  const [project, setProject] = useState<Project | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Store original tasks
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State for task sorting and filtering
  const [taskSortCriteria, setTaskSortCriteria] = useState<TaskSortCriteria>({ field: 'createdAt', direction: 'desc' });
  const [taskFilterCriteria, setTaskFilterCriteria] = useState<TaskFilterCriteria>({ status: null, priority: null, assigneeId: null });


  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [projectData, tasksData, logData] = await Promise.all([
        api.getProject(projectId),
        api.getTasks(projectId),
        api.getActivityLog(projectId, 30), // Fetch logs for this project
      ]);

      if (!projectData) {
        throw new Error("Project not found.");
      }
      setProject(projectData);
      setAllTasks(tasksData);
      setActivityLog(logData);

      navigation.setOptions({ title: projectData.title || 'Project Details' });

    } catch (err: any) {
      console.error("Error fetching project details:", err);
      setError(err.message || "Failed to load project details. Please try again.");
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      // Add a comment about real-time updates
      console.log("Screen focused. Data refreshed. In a real app, WebSocket listeners would update data automatically.");
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true); // Pass true to indicate it's a refresh
  }, [fetchData]);

  // Apply filtering and sorting to tasks
  const filteredAndSortedTasks = useMemo(() => {
      let result = [...allTasks];

      // Filtering
      if (taskFilterCriteria.status) {
          result = result.filter(t => t.status === taskFilterCriteria.status);
      }
      if (taskFilterCriteria.priority) {
          result = result.filter(t => t.priority === taskFilterCriteria.priority);
      }
      if (taskFilterCriteria.assigneeId) {
          if (taskFilterCriteria.assigneeId === 'unassigned') {
              result = result.filter(t => !t.assigneeId);
          } else {
              result = result.filter(t => t.assigneeId === taskFilterCriteria.assigneeId);
          }
      }

      // Sorting (similar logic as projects list, adapted for tasks)
      result.sort((a, b) => {
          const field = taskSortCriteria.field;
          const dir = taskSortCriteria.direction === 'asc' ? 1 : -1;

          let valA = a[field];
          let valB = b[field];

          // Handle priority sorting (High > Medium > Low)
          if (field === 'priority') {
              const priorityOrder = { [TaskPriority.High]: 3, [TaskPriority.Medium]: 2, [TaskPriority.Low]: 1 };
              const priorityA = priorityOrder[a.priority] || 0;
              const priorityB = priorityOrder[b.priority] || 0;
              return (priorityA - priorityB) * dir;
          }

          // Handle undefined dates (dueDate) - sort them last
          if (field === 'dueDate') {
              // Ensure valA and valB are Date objects or null/undefined before comparison
              const dateA = valA instanceof Date ? valA.getTime() : null;
              const dateB = valB instanceof Date ? valB.getTime() : null;

              if (dateA === null && dateB !== null) return 1 * dir; // a is undefined, b is defined -> a comes last
              if (dateA !== null && dateB === null) return -1 * dir; // a is defined, b is undefined -> b comes last
              if (dateA === null && dateB === null) return 0; // both undefined
              if (dateA !== null && dateB !== null) return (dateA - dateB) * dir; // both defined
              return 0; // Should not happen if logic above is correct
          }


          valA = valA ?? '';
          valB = valB ?? '';

          if (valA instanceof Date && valB instanceof Date) {
              return (valA.getTime() - valB.getTime()) * dir;
          }
          if (typeof valA === 'string' && typeof valB === 'string') {
              return valA.localeCompare(valB) * dir;
          }
          // Fallback for status etc.
          return String(valA).localeCompare(String(valB)) * dir;
      });

      return result;
  }, [allTasks, taskSortCriteria, taskFilterCriteria]);

  const handleTaskSortChange = (field: TaskSortField, direction: SortDirection) => {
      setTaskSortCriteria({ field, direction });
  };

  const handleTaskFilterChange = (field: keyof TaskFilterCriteria, value: any) => {
      setTaskFilterCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleClearTaskFilters = () => {
      setTaskFilterCriteria({ status: null, priority: null, assigneeId: null });
  };


  const handleEditProject = () => {
    navigation.navigate('AddEditProject', { projectId });
  };

  const handleAddTask = () => {
    navigation.navigate('AddEditTask', { projectId });
  };

  const handleSelectTask = (taskId: string) => {
    navigation.navigate('TaskDetails', { taskId, projectId });
  };

  const handleDeleteProject = () => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project?.title}"? This will also delete all associated tasks, comments, and logs. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const success = await api.deleteProject(projectId);
              if (success) {
                Alert.alert("Success", "Project deleted successfully.");
                navigation.goBack();
              } else {
                throw new Error("Failed to delete project.");
              }
            } catch (err: any) {
              setLoading(false);
              Alert.alert("Error", err.message || "Could not delete project. Please try again.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleEditProject} style={styles.headerButton}>
            <Icon name="pencil-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteProject} style={styles.headerButton}>
            <Icon name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, project]);


  if (loading && !refreshing) {
    return <LoadingIndicator fullScreen />;
  }

  if (error && !project) {
    return <ErrorDisplay message={error} onRetry={() => fetchData()} fullScreen />;
  }

  if (!project) {
    return (
      <View style={commonStyles.container}>
        <Text>Project data could not be loaded.</Text>
      </View>
    );
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard task={item} onPress={() => handleSelectTask(item.id)} />
  );

  const renderActivityLog = ({ item }: { item: ActivityLog }) => (
      <ActivityLogItem log={item} />
  );

  return (
    <ScrollView
        style={commonStyles.screenContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary}/>
        }
    >
      <View style={styles.detailsContainer}>
        {error && <ErrorDisplay message={error} onRetry={() => fetchData()} />}

        {/* Project Info Section */}
        <View style={styles.section}>
          <View style={commonStyles.flexRowSpaceBetween}>
             <Text style={styles.projectTitle}>{project.title}</Text>
             <StatusBadge status={project.status} />
          </View>
          {project.description && (
            <Text style={styles.description}>{project.description}</Text>
          )}
           <View style={styles.metaContainer}>
               <View style={commonStyles.row}>
                 <Icon name="calendar-outline" size={18} color={colors.textSecondary} style={commonStyles.icon} />
                 <Text style={styles.metaText}>
                   Deadline: {project.deadline ? project.deadline.toLocaleDateString() : 'Not set'}
                 </Text>
               </View>
               <View style={commonStyles.row}>
                 <Icon name="time-outline" size={18} color={colors.textSecondary} style={commonStyles.icon} />
                 <Text style={styles.metaText}>
                   Created: {project.createdAt.toLocaleDateString()}
                 </Text>
               </View>
                <View style={commonStyles.row}>
                  <Icon name="refresh-outline" size={18} color={colors.textSecondary} style={commonStyles.icon} />
                  <Text style={styles.metaText}>
                    Last Modified: {project.lastModifiedAt.toLocaleDateString()}
                  </Text>
                </View>
           </View>
        </View>


        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={commonStyles.subtitle}>Tasks ({filteredAndSortedTasks.length})</Text>
            <TouchableOpacity style={[commonStyles.buttonSecondary, styles.addTaskButton]} onPress={handleAddTask}>
              <Icon name="add-outline" size={18} color={colors.primary} />
              <Text style={[commonStyles.buttonText, commonStyles.buttonSecondaryText, styles.addTaskButtonText]}>Add Task</Text>
            </TouchableOpacity>
          </View>

          {/* Task Filter/Sort Controls */}
          <FilterSortControls
              sortOptions={taskSortOptions}
              filterOptions={taskFilterOptions}
              currentSort={taskSortCriteria}
              currentFilters={taskFilterCriteria}
              onSortChange={handleTaskSortChange}
              onFilterChange={handleTaskFilterChange}
              onClearFilters={handleClearTaskFilters}
          />

          {loading && allTasks.length === 0 && <LoadingIndicator />}
          {!loading && filteredAndSortedTasks.length === 0 && (
            <Text style={styles.noTasksText}>
                {allTasks.length > 0 ? 'No tasks match filters.' : 'No tasks added yet.'}
            </Text>
          )}
          <FlatList
            data={filteredAndSortedTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Let ScrollView handle scrolling
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            style={{ marginTop: 10 }} // Add margin after controls
          />
        </View>

        {/* Activity Log Section */}
        <View style={styles.activityLogSection}>
            <Text style={commonStyles.subtitle}>Recent Activity</Text>
            {loading && activityLog.length === 0 && <LoadingIndicator />}
            {!loading && activityLog.length === 0 && (
                <Text style={styles.noActivityText}>No activity recorded for this project yet.</Text>
            )}
            <FlatList
                data={activityLog}
                renderItem={renderActivityLog}
                keyExtractor={(item) => item.id}
                scrollEnabled={false} // Let ScrollView handle scrolling
            />
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    paddingBottom: 32, // More padding at the bottom
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerButton: {
    paddingHorizontal: 10,
  },
  section: {
    paddingHorizontal: 16, // Add horizontal padding to sections
    paddingTop: 16, // Add top padding
    marginBottom: 10, // Reduce margin between sections
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  projectTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      flexShrink: 1,
      marginRight: 10,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 15, // Add margin below description
  },
  metaContainer: {
      marginTop: 10,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tasksSection: {
    marginTop: 10,
    paddingHorizontal: 16, // Add horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 20, // Add padding below task list
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Reduce margin below header
  },
  addTaskButton: {
      paddingVertical: 6, // Smaller button
      paddingHorizontal: 10,
  },
  addTaskButtonText: {
      fontSize: 14,
      marginLeft: 4,
  },
  noTasksText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 30, // Increase margin when empty
    marginBottom: 20,
    fontSize: 15,
  },
  activityLogSection: {
      marginTop: 20,
      paddingHorizontal: 16, // Add horizontal padding
  },
  noActivityText: {
      textAlign: 'center',
      color: colors.textSecondary,
      marginTop: 15,
      marginBottom: 15,
      fontSize: 14,
  },
});

export default ProjectDetailsScreen;

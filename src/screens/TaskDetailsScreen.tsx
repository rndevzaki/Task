import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList, Dimensions,
    TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import api from '@/api/mockApi';
import { Task, RootStackParamList, TaskPriority, Comment } from '@/types';
import LoadingIndicator from '@/components/LoadingIndicator';
import ErrorDisplay from '@/components/ErrorDisplay';
import StatusBadge from '@/components/StatusBadge';
import CommentItem from '@/components/CommentItem'; // Import CommentItem
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

type TaskDetailsRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;
type TaskDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'TaskDetails'>;

const screenWidth = Dimensions.get('window').width;

const getPriorityIcon = (priority: TaskPriority): { name: string; color: string } => {
  switch (priority) {
    case TaskPriority.High:
      return { name: 'arrow-up-circle', color: colors.priorityHigh };
    case TaskPriority.Medium:
      return { name: 'arrow-forward-circle-outline', color: colors.priorityMedium };
    case TaskPriority.Low:
      return { name: 'arrow-down-circle', color: colors.priorityLow };
    default:
      return { name: 'remove-circle-outline', color: colors.grey };
  }
};

const TaskDetailsScreen: React.FC = () => {
  const navigation = useNavigation<TaskDetailsNavigationProp>();
  const route = useRoute<TaskDetailsRouteProp>();
  const { taskId, projectId } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [postingComment, setPostingComment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchTaskAndComments = useCallback(async () => {
    try {
      setError(null);
      setCommentError(null);
      setLoading(true);
      setLoadingComments(true); // Start loading comments too

      const [taskData, commentsData] = await Promise.all([
          api.getTask(taskId),
          api.getComments(taskId)
      ]);

      if (!taskData) {
        throw new Error("Task not found.");
      }
      setTask(taskData);
      setComments(commentsData);
      navigation.setOptions({ title: taskData.title || 'Task Details' });

    } catch (err: any) {
      console.error("Error fetching task details/comments:", err);
      setError(err.message || "Failed to load task details. Please try again.");
    } finally {
      setLoading(false);
      setLoadingComments(false); // Finish loading comments
    }
  }, [taskId, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchTaskAndComments();
       console.log("Task details focused. Data refreshed.");
    }, [fetchTaskAndComments])
  );

  const handlePostComment = async () => {
      if (!newCommentText.trim()) return;

      setPostingComment(true);
      setCommentError(null);
      try {
          const addedComment = await api.addComment(taskId, newCommentText.trim());
          setComments(prev => [...prev, addedComment]); // Add new comment to the list
          setNewCommentText(''); // Clear input
      } catch (err: any) {
          console.error("Error posting comment:", err);
          setCommentError("Failed to post comment. Please try again.");
          Alert.alert("Error", "Failed to post comment. Please try again.");
      } finally {
          setPostingComment(false);
      }
  };

  const handleEditTask = () => {
    navigation.navigate('AddEditTask', { taskId, projectId });
  };

  const handleDeleteTask = () => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task?.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const success = await api.deleteTask(taskId);
              if (success) {
                Alert.alert("Success", "Task deleted successfully.");
                navigation.goBack();
              } else {
                throw new Error("Failed to delete task.");
              }
            } catch (err: any) {
              setLoading(false);
              Alert.alert("Error", err.message || "Could not delete task. Please try again.");
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
           <TouchableOpacity onPress={handleEditTask} style={styles.headerButton}>
             <Icon name="pencil-outline" size={24} color={colors.primary} />
           </TouchableOpacity>
           <TouchableOpacity onPress={handleDeleteTask} style={styles.headerButton}>
             <Icon name="trash-outline" size={24} color={colors.error} />
           </TouchableOpacity>
         </View>
       ),
     });
   }, [navigation, task]);

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchTaskAndComments} fullScreen />;
  }

  if (!task) {
    return (
      <View style={commonStyles.container}>
        <Text>Task data could not be loaded.</Text>
      </View>
    );
  }

  const priorityIcon = getPriorityIcon(task.priority);

  const renderPhoto = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
  );

  const renderComment = ({ item }: { item: Comment }) => (
      <CommentItem comment={item} />
  );

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust offset if needed
    >
        <ScrollView style={commonStyles.screenContainer} contentContainerStyle={styles.detailsContainer}>
          {/* Task Info Section */}
          <View style={styles.section}>
            <View style={commonStyles.flexRowSpaceBetween}>
               <Text style={styles.taskTitle}>{task.title}</Text>
               <StatusBadge status={task.status} />
            </View>
            {task.description && (
              <Text style={styles.description}>{task.description}</Text>
            )}
          </View>

          {/* Meta Info Section */}
          <View style={styles.section}>
            <View style={commonStyles.row}>
              <Icon name={priorityIcon.name} size={18} color={priorityIcon.color} style={commonStyles.icon} />
              <Text style={styles.metaText}>Priority: {task.priority}</Text>
            </View>
            <View style={commonStyles.row}>
                <Icon name="person-outline" size={18} color={colors.textSecondary} style={commonStyles.icon} />
                <Text style={styles.metaText}>Assignee: {task.assigneeName || 'Unassigned'}</Text>
            </View>
            <View style={commonStyles.row}>
              <Icon name="calendar-outline" size={18} color={colors.textSecondary} style={commonStyles.icon} />
              <Text style={styles.metaText}>
                Due Date: {task.dueDate ? task.dueDate.toLocaleDateString() : 'Not set'}
              </Text>
            </View>
             <View style={commonStyles.row}>
               <Icon name="time-outline" size={18} color={colors.textSecondary} style={commonStyles.icon} />
               <Text style={styles.metaText}>
                 Created: {task.createdAt.toLocaleDateString()}
               </Text>
             </View>
             <View style={commonStyles.row}>
               <Icon name="refresh-outline" size={18} color={colors.textSecondary} style={commonStyles.icon} />
               <Text style={styles.metaText}>
                 Last Modified: {task.lastModifiedAt.toLocaleDateString()}
               </Text>
             </View>
          </View>

          {/* Photos Section */}
          {(task.photos && task.photos.length > 0) && (
            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>Attached Photos</Text>
              <FlatList
                data={task.photos}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              />
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
              <Text style={commonStyles.subtitle}>Comments ({comments.length})</Text>
              {loadingComments && <LoadingIndicator />}
              {!loadingComments && comments.length === 0 && (
                  <Text style={styles.noCommentsText}>No comments yet.</Text>
              )}
              {commentError && <ErrorDisplay message={commentError} />}
              <FlatList
                  data={comments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false} // Let ScrollView handle scrolling
              />
          </View>

        </ScrollView>

        {/* Add Comment Input */}
        <View style={styles.addCommentContainer}>
            <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={newCommentText}
                onChangeText={setNewCommentText}
                multiline
            />
            <TouchableOpacity
                style={[styles.sendButton, (postingComment || !newCommentText.trim()) && styles.sendButtonDisabled]}
                onPress={handlePostComment}
                disabled={postingComment || !newCommentText.trim()}
            >
                {postingComment ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <Icon name="send" size={20} color={colors.white} />
                )}
            </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding at the bottom for comment input
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerButton: {
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  taskTitle: {
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
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  photo: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.5 * 1.2,
    borderRadius: 8,
    backgroundColor: colors.greyLight,
  },
  commentsSection: {
      marginTop: 10, // Add some space before comments
  },
  noCommentsText: {
      textAlign: 'center',
      color: colors.textSecondary,
      marginTop: 15,
      marginBottom: 15,
      fontSize: 14,
  },
  addCommentContainer: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.surface,
      alignItems: 'center',
  },
  commentInput: {
      flex: 1,
      backgroundColor: colors.greyLight,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10,
      maxHeight: 100, // Limit input height
      fontSize: 15,
  },
  sendButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
  },
  sendButtonDisabled: {
      backgroundColor: colors.grey,
  },
});

export default TaskDetailsScreen;

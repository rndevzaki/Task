import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform,
  Image, FlatList, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

import api from '@/api/mockApi';
import { Task, TaskStatus, TaskPriority, RootStackParamList, User } from '@/types';
import LoadingIndicator from '@/components/LoadingIndicator';
import ErrorDisplay from '@/components/ErrorDisplay';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

type AddEditTaskRouteProp = RouteProp<RootStackParamList, 'AddEditTask'>;
type AddEditTaskNavigationProp = StackNavigationProp<RootStackParamList, 'AddEditTask'>;

const AddEditTaskScreen: React.FC = () => {
  const navigation = useNavigation<AddEditTaskNavigationProp>();
  const route = useRoute<AddEditTaskRouteProp>();
  const taskId = route.params?.taskId;
  const projectId = route.params.projectId;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Todo);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined); // Store ID
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [photos, setPhotos] = useState<string[]>([]); // Store URIs

  const [availableUsers, setAvailableUsers] = useState<User[]>([]); // For assignee picker
  const [loading, setLoading] = useState<boolean>(isEditing);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Set Navigation Title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Task' : 'Add New Task',
    });
  }, [navigation, isEditing]);

  // Fetch task data if editing AND fetch available users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(isEditing); // Only show main loading if editing
        setLoadingUsers(true);
        setError(null);

        // Fetch users concurrently
        const usersPromise = api.getUsers();

        let taskData: Task | undefined = undefined;
        if (isEditing && taskId) {
          taskData = await api.getTask(taskId);
          if (!taskData) throw new Error("Task not found.");
        }

        const users = await usersPromise;
        setAvailableUsers(users);

        if (taskData) {
          setTitle(taskData.title);
          setDescription(taskData.description || '');
          setStatus(taskData.status);
          setPriority(taskData.priority);
          setAssigneeId(taskData.assigneeId); // Set ID
          setDueDate(taskData.dueDate);
          setPhotos(taskData.photos || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load initial data.");
      } finally {
        setLoading(false);
        setLoadingUsers(false);
      }
    };
    fetchData();
  }, [taskId, isEditing]);

  // --- Date Picker Handlers ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date: Date) => {
    setDueDate(date);
    hideDatePicker();
  };

  // --- Image Picker using react-native-image-picker ---
  const pickImage = useCallback(() => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      // selectionLimit: 1, // Pick one at a time
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Image Picker Error', response.errorMessage || 'Could not select image.');
      } else if (response.assets && response.assets.length > 0) {
        const selectedUri = response.assets[0].uri;
        if (selectedUri) {
          setPhotos(prevPhotos => [...prevPhotos, selectedUri]);
        }
      }
    });
  }, []);

  const removePhoto = (uriToRemove: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(uri => uri !== uriToRemove));
  };

  const renderPhotoItem = ({ item }: { item: string }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item }} style={styles.photoThumbnail} />
      <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(item)}>
        <Icon name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  // --- Save Handler ---
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Task title cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Pass assigneeId instead of assignee name string
      const taskData = {
        title: title.trim(), description: description.trim(), status, priority,
        assigneeId: assigneeId || undefined, // Ensure it's undefined if empty string/null
        dueDate, photos,
      };
      let savedTask: Task | undefined;
      if (isEditing && taskId) {
        savedTask = await api.updateTask(taskId, taskData);
      } else {
        savedTask = await api.createTask(projectId, taskData);
      }
      if (savedTask) {
        Alert.alert("Success", `Task ${isEditing ? 'updated' : 'created'} successfully.`);
        navigation.goBack();
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} task.`);
      }
    } catch (err: any) {
      setError(err.message || `Could not ${isEditing ? 'update' : 'save'} task. Please try again.`);
      Alert.alert("Error", err.message || `Could not ${isEditing ? 'update' : 'save'} task. Please try again.`);
    } finally {
      setSaving(false);
    }
  }, [title, description, status, priority, assigneeId, dueDate, photos, taskId, projectId, isEditing, navigation]);

  if (loading) return <LoadingIndicator fullScreen />;
  if (error && isEditing) return <ErrorDisplay message={error} onRetry={() => {}} fullScreen />;

  return (
    <ScrollView style={commonStyles.screenContainer} contentContainerStyle={commonStyles.contentContainer}>
      {error && <ErrorDisplay message={error} />}

      {/* Title */}
      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Task Title *</Text>
        <TextInput style={commonStyles.input} value={title} onChangeText={setTitle} placeholder="Enter task title" maxLength={150} />
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Description</Text>
        <TextInput style={[commonStyles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Enter task description (optional)" multiline numberOfLines={4} maxLength={1000} />
      </View>

      {/* Status & Priority Row */}
      <View style={styles.rowGroup}>
        <View style={[styles.formGroup, styles.column]}>
          <Text style={commonStyles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue as TaskStatus)} style={styles.picker} itemStyle={styles.pickerItem}>
              {Object.values(TaskStatus).map((s) => ( <Picker.Item key={s} label={s} value={s} /> ))}
            </Picker>
          </View>
        </View>
        <View style={[styles.formGroup, styles.column]}>
          <Text style={commonStyles.label}>Priority</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={priority} onValueChange={(itemValue) => setPriority(itemValue as TaskPriority)} style={styles.picker} itemStyle={styles.pickerItem}>
              {Object.values(TaskPriority).map((p) => ( <Picker.Item key={p} label={p} value={p} /> ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Assignee Picker */}
      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Assignee</Text>
        <View style={styles.pickerContainer}>
          {loadingUsers ? <ActivityIndicator style={{ paddingVertical: 15 }}/> : (
            <Picker selectedValue={assigneeId} onValueChange={(itemValue) => setAssigneeId(itemValue || undefined)} style={styles.picker} itemStyle={styles.pickerItem} prompt="Select Assignee">
              <Picker.Item label="Unassigned" value={undefined} />
              {availableUsers.map((user) => ( <Picker.Item key={user.id} label={user.name} value={user.id} /> ))}
            </Picker>
          )}
        </View>
      </View>

      {/* Due Date */}
      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Due Date</Text>
        <TouchableOpacity onPress={showDatePicker} style={commonStyles.input}>
          <Text style={dueDate ? styles.dateText : styles.datePlaceholder}>{dueDate ? dueDate.toLocaleDateString() : 'Select due date (optional)'}</Text>
        </TouchableOpacity>
        <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" date={dueDate || new Date()} onConfirm={handleConfirmDate} onCancel={hideDatePicker} />
        <TouchableOpacity onPress={() => setDueDate(undefined)} style={styles.clearDateButton}><Text style={styles.clearDateText}>Clear Due Date</Text></TouchableOpacity>
      </View>

      {/* Photos */}
      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Photos</Text>
        {photos.length > 0 && (
          <FlatList data={photos} renderItem={renderPhotoItem} keyExtractor={(item, index) => `${item}-${index}`} horizontal showsHorizontalScrollIndicator={false} style={styles.photoList} ItemSeparatorComponent={() => <View style={{ width: 10 }} />} />
        )}
        <TouchableOpacity style={[commonStyles.button, commonStyles.buttonSecondary, styles.addPhotoButton]} onPress={pickImage}>
          <Icon name="camera-outline" size={18} color={colors.primary} /><Text style={[commonStyles.buttonText, commonStyles.buttonSecondaryText]}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={[commonStyles.button, saving ? styles.buttonDisabled : null]} onPress={handleSave} disabled={saving}>
        {saving && <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 10 }} />}
        <Text style={commonStyles.buttonText}>{saving ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  rowGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 },
  column: { flex: 1, marginHorizontal: 5, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: colors.divider, borderRadius: 4, backgroundColor: colors.white, justifyContent: 'center', ...(Platform.OS === 'ios' ? { height: 44 } : {}) },
  picker: { height: Platform.OS === 'android' ? 50 : undefined, color: Platform.OS === 'android' ? colors.text : undefined },
  pickerItem: { height: 120, fontSize: 16 },
  dateText: { fontSize: 16, color: colors.text },
  datePlaceholder: { fontSize: 16, color: colors.textSecondary },
  clearDateButton: { marginTop: 5, alignSelf: 'flex-start' },
  clearDateText: { color: colors.primary, fontSize: 14 },
  buttonDisabled: { backgroundColor: colors.grey },
  photoList: { marginBottom: 10 },
  photoContainer: { position: 'relative' },
  photoThumbnail: { width: 80, height: 80, borderRadius: 4, backgroundColor: colors.greyLight },
  removePhotoButton: { position: 'absolute', top: -5, right: -5, backgroundColor: colors.white, borderRadius: 12 },
  addPhotoButton: { marginTop: 10 },
});

export default AddEditTaskScreen;

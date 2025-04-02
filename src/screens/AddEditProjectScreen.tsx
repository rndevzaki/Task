import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker'; // Using community picker

import api from '@/api/mockApi';
import { Project, ProjectStatus, RootStackParamList } from '@/types';
import LoadingIndicator from '@/components/LoadingIndicator';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';
import ErrorDisplay from '@/components/ErrorDisplay';

type AddEditProjectRouteProp = RouteProp<RootStackParamList, 'AddEditProject'>;
type AddEditProjectNavigationProp = StackNavigationProp<RootStackParamList, 'AddEditProject'>;

const AddEditProjectScreen: React.FC = () => {
  const navigation = useNavigation<AddEditProjectNavigationProp>();
  const route = useRoute<AddEditProjectRouteProp>();
  const projectId = route.params?.projectId;
  const isEditing = !!projectId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.Active);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(isEditing); // Load if editing
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Set Navigation Title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Project' : 'Add New Project',
    });
  }, [navigation, isEditing]);

  // Fetch project data if editing
  useEffect(() => {
    if (isEditing && projectId) {
      const fetchProject = async () => {
        try {
          setError(null);
          setLoading(true);
          const projectData = await api.getProject(projectId);
          if (projectData) {
            setTitle(projectData.title);
            setDescription(projectData.description || '');
            setStatus(projectData.status);
            setDeadline(projectData.deadline);
          } else {
            throw new Error("Project not found.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to load project data.");
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [projectId, isEditing]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    setDeadline(date);
    hideDatePicker();
  };

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Project title cannot be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const projectData = { title: title.trim(), description: description.trim(), status, deadline };
      let savedProject: Project | undefined;

      if (isEditing && projectId) {
        savedProject = await api.updateProject(projectId, projectData);
      } else {
        savedProject = await api.createProject(projectData);
      }

      if (savedProject) {
        Alert.alert("Success", `Project ${isEditing ? 'updated' : 'created'} successfully.`);
        // Navigate back or to the details screen
        // If creating, navigate to details, if editing, maybe just go back
        if (!isEditing && savedProject.id) {
            // Replace current screen with details screen to avoid back->edit loop
            navigation.replace('ProjectDetails', { projectId: savedProject.id });
        } else {
            navigation.goBack();
        }
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} project.`);
      }
    } catch (err: any) {
      setError(err.message || `Could not ${isEditing ? 'update' : 'save'} project. Please try again.`);
      Alert.alert("Error", err.message || `Could not ${isEditing ? 'update' : 'save'} project. Please try again.`);
    } finally {
      setSaving(false);
    }
  }, [title, description, status, deadline, projectId, isEditing, navigation]);

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  if (error && isEditing) {
    // Show error only if loading existing data failed
    return <ErrorDisplay message={error} onRetry={() => { /* Implement retry logic if needed */ }} fullScreen />;
  }

  return (
    <ScrollView style={commonStyles.screenContainer} contentContainerStyle={commonStyles.contentContainer}>
      {error && <ErrorDisplay message={error} />}

      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Project Title *</Text>
        <TextInput
          style={commonStyles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter project title"
          maxLength={100}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Description</Text>
        <TextInput
          style={[commonStyles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter project description (optional)"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue as ProjectStatus)}
            style={styles.picker}
            itemStyle={styles.pickerItem} // iOS specific styling
          >
            {Object.values(ProjectStatus).map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={commonStyles.label}>Deadline</Text>
        <TouchableOpacity onPress={showDatePicker} style={commonStyles.input}>
          <Text style={deadline ? styles.dateText : styles.datePlaceholder}>
            {deadline ? deadline.toLocaleDateString() : 'Select deadline (optional)'}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={deadline || new Date()} // Default to today if no deadline set
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          minimumDate={new Date()} // Optional: prevent past dates
        />
         <TouchableOpacity onPress={() => setDeadline(undefined)} style={styles.clearDateButton}>
             <Text style={styles.clearDateText}>Clear Deadline</Text>
         </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[commonStyles.button, saving ? styles.buttonDisabled : null]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving && <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 10 }} />}
        <Text style={commonStyles.buttonText}>{saving ? 'Saving...' : (isEditing ? 'Update Project' : 'Create Project')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Android
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 4,
    backgroundColor: colors.white,
    justifyContent: 'center',
     ...(Platform.OS === 'ios' ? { height: 44 } : {}),
  },
  picker: {
     height: Platform.OS === 'android' ? 50 : undefined,
     color: Platform.OS === 'android' ? colors.text : undefined,
  },
  pickerItem: {
     height: 120,
     fontSize: 16,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  datePlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  clearDateButton: {
      marginTop: 5,
      alignSelf: 'flex-start',
  },
  clearDateText: {
      color: colors.primary,
      fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: colors.grey,
  },
});

export default AddEditProjectScreen;

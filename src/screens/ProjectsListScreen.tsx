import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import api from '@/api/mockApi';
import {
    Project, RootStackParamList, ProjectStatus,
    ProjectSortField, SortDirection, ProjectSortCriteria, ProjectFilterCriteria
} from '@/types';
import LoadingIndicator from '@/components/LoadingIndicator';
import ErrorDisplay from '@/components/ErrorDisplay';
import ProjectCard from '@/components/ProjectCard';
import FilterSortControls from '@/components/FilterSortControls'; // Import the new component
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

type ProjectsListNavigationProp = StackNavigationProp<RootStackParamList, 'Projects'>;

// Define Sort and Filter Options
const projectSortOptions: { label: string; value: ProjectSortField }[] = [
    { label: 'Title', value: 'title' },
    { label: 'Status', value: 'status' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Created Date', value: 'createdAt' },
];

const projectFilterOptions = [
    {
        label: 'Status',
        field: 'status' as keyof ProjectFilterCriteria, // Explicit cast
        options: [
            { label: 'All Statuses', value: null },
            ...Object.values(ProjectStatus).map(s => ({ label: s, value: s })),
        ],
    },
    // Add more filter groups here (e.g., search by title)
];


const ProjectsListScreen: React.FC = () => {
  const navigation = useNavigation<ProjectsListNavigationProp>();
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Store original fetched data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State for sorting and filtering
  const [sortCriteria, setSortCriteria] = useState<ProjectSortCriteria>({ field: 'createdAt', direction: 'desc' });
  const [filterCriteria, setFilterCriteria] = useState<ProjectFilterCriteria>({ status: null });

  const fetchProjects = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) setLoading(true);
      const data = await api.getProjects();
      setAllProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, []);

   useFocusEffect(
     useCallback(() => {
       fetchProjects();
       console.log("Projects list focused. Data refreshed.");
     }, [fetchProjects])
   );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects(true);
  }, [fetchProjects]);

  // Apply filtering and sorting
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...allProjects];

    // Filtering
    if (filterCriteria.status) {
      result = result.filter(p => p.status === filterCriteria.status);
    }
    // Add more filters here

    // Sorting
    result.sort((a, b) => {
      const field = sortCriteria.field;
      const dir = sortCriteria.direction === 'asc' ? 1 : -1;

      let valA = a[field];
      let valB = b[field];

      // Handle undefined dates (e.g., deadline) - sort them last
      if (field === 'deadline') {
          // Ensure valA and valB are Date objects or null/undefined before comparison
          const dateA = valA instanceof Date ? valA.getTime() : null;
          const dateB = valB instanceof Date ? valB.getTime() : null;

          if (dateA === null && dateB !== null) return 1 * dir; // a is undefined, b is defined -> a comes last
          if (dateA !== null && dateB === null) return -1 * dir; // a is defined, b is undefined -> b comes last
          if (dateA === null && dateB === null) return 0; // both undefined
          if (dateA !== null && dateB !== null) return (dateA - dateB) * dir; // both defined
          return 0; // Should not happen if logic above is correct
      }

      // Handle potential undefined values for other fields if necessary
      valA = valA ?? ''; // Default to empty string or appropriate value
      valB = valB ?? '';

      if (valA instanceof Date && valB instanceof Date) {
        return (valA.getTime() - valB.getTime()) * dir;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * dir;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      // Fallback for status or other types
      return String(valA).localeCompare(String(valB)) * dir;
    });


    return result;
  }, [allProjects, sortCriteria, filterCriteria]);


  const handleSortChange = (field: ProjectSortField, direction: SortDirection) => {
    setSortCriteria({ field, direction });
  };

  const handleFilterChange = (field: keyof ProjectFilterCriteria, value: any) => {
    setFilterCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
      setFilterCriteria({ status: null });
  };


  const handleAddProject = () => {
    navigation.navigate('AddEditProject', {});
  };

  const handleSelectProject = (projectId: string) => {
    navigation.navigate('ProjectDetails', { projectId });
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard project={item} onPress={() => handleSelectProject(item.id)} />
  );

  return (
    <View style={commonStyles.screenContainer}>
      {/* Add Filter/Sort Controls */}
      <FilterSortControls
        sortOptions={projectSortOptions}
        filterOptions={projectFilterOptions}
        currentSort={sortCriteria}
        currentFilters={filterCriteria}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {loading && !refreshing && filteredAndSortedProjects.length === 0 && <LoadingIndicator fullScreen />}
      {error && filteredAndSortedProjects.length === 0 && <ErrorDisplay message={error} onRetry={() => fetchProjects()} fullScreen />}

      <FlatList
        data={filteredAndSortedProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="folder-open-outline" size={60} color={colors.grey} />
              <Text style={styles.emptyText}>
                {allProjects.length > 0 ? 'No projects match filters.' : 'No projects found.'}
              </Text>
              {allProjects.length === 0 && (
                 <Text style={styles.emptySubText}>Tap the '+' button to add your first project.</Text>
              )}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary}/>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddProject} activeOpacity={0.8}>
        <Icon name="add" size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    padding: 16,
    paddingBottom: 80, // Ensure space for FAB
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
   emptySubText: {
     marginTop: 8,
     fontSize: 14,
     color: colors.grey,
     textAlign: 'center',
     paddingHorizontal: 40,
   },
});

export default ProjectsListScreen;

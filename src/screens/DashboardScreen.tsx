import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

import api from '@/api/mockApi';
import { DashboardAnalyticsData, ProjectStatus, TaskStatus } from '@/types';
import LoadingIndicator from '@/components/LoadingIndicator';
import ErrorDisplay from '@/components/ErrorDisplay';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) setLoading(true);
      const data = await api.getDashboardAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching dashboard analytics:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
      console.log("Dashboard focused. Data refreshed.");
    }, [fetchAnalytics])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  if (loading && !refreshing) {
    return <LoadingIndicator fullScreen />;
  }

  if (error && !analytics) {
    return <ErrorDisplay message={error} onRetry={() => fetchAnalytics()} fullScreen />;
  }

  if (!analytics) {
    return (
      <View style={commonStyles.container}>
        <Text>No analytics data available.</Text>
      </View>
    );
  }

  const taskStatusChartData = {
    labels: Object.values(TaskStatus),
    datasets: [
      {
        data: Object.values(TaskStatus).map(status => analytics.tasksByStatus[status] || 0),
        color: (opacity = 1) => `rgba(255, 64, 129, ${opacity})`, // Accent color
        strokeWidth: 2,
      },
    ],
    legend: ["Task Status Distribution"],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: colors.accent },
  };

  return (
    <ScrollView
      style={commonStyles.screenContainer}
      contentContainerStyle={commonStyles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary}/>
      }
    >
      <Text style={commonStyles.title}>Dashboard</Text>

      {error && <ErrorDisplay message={error} onRetry={() => fetchAnalytics()} />}

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[commonStyles.card, styles.summaryCard]}>
          <Icon name="briefcase-outline" size={24} color={colors.primary} style={commonStyles.icon} />
          <Text style={styles.summaryValue}>{analytics.totalProjects}</Text>
          <Text style={styles.summaryLabel}>Total Projects</Text>
        </View>
        <View style={[commonStyles.card, styles.summaryCard]}>
          <Icon name="list-outline" size={24} color={colors.accent} style={commonStyles.icon} />
          <Text style={styles.summaryValue}>{analytics.totalTasks}</Text>
          <Text style={styles.summaryLabel}>Total Tasks</Text>
        </View>
      </View>
      <View style={styles.summaryContainer}>
         <View style={[commonStyles.card, styles.summaryCard]}>
           <Icon name="checkmark-done-outline" size={24} color={colors.success} style={commonStyles.icon} />
           <Text style={styles.summaryValue}>{analytics.taskCompletionRate}%</Text>
           <Text style={styles.summaryLabel}>Completion Rate</Text>
         </View>
         <View style={[commonStyles.card, styles.summaryCard, analytics.overdueTasks > 0 && styles.overdueCard]}>
           <Icon name="warning-outline" size={24} color={analytics.overdueTasks > 0 ? colors.white : colors.warning} style={commonStyles.icon} />
           <Text style={[styles.summaryValue, analytics.overdueTasks > 0 && styles.overdueText]}>{analytics.overdueTasks}</Text>
           <Text style={[styles.summaryLabel, analytics.overdueTasks > 0 && styles.overdueText]}>Overdue Tasks</Text>
         </View>
      </View>

      {/* Project Status */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.subtitle}>Projects by Status</Text>
        <View style={styles.statusContainer}>
          {Object.entries(analytics.projectsByStatus).map(([status, count]) => (
            <View key={status} style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: getProjectStatusColor(status as ProjectStatus) }]} />
              <Text style={styles.statusText}>{status}: {count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Task Status Chart */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.subtitle}>Task Status Overview</Text>
        {analytics.totalTasks > 0 ? (
          <LineChart
            data={taskStatusChartData}
            width={screenWidth - 64} // Adjust width based on padding
            height={220}
            chartConfig={chartConfig}
            bezier // Makes the line smooth
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noDataText}>No task data available for chart.</Text>
        )}
      </View>

    </ScrollView>
  );
};

const getProjectStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.Active: return colors.statusActive;
    case ProjectStatus.OnHold: return colors.statusOnHold;
    case ProjectStatus.Completed: return colors.statusCompleted;
    default: return colors.grey;
  }
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    paddingVertical: 20,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  overdueCard: {
    backgroundColor: colors.warning,
  },
  overdueText: {
    color: colors.white,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
      textAlign: 'center',
      color: colors.textSecondary,
      marginTop: 20,
      marginBottom: 10,
  }
});

export default DashboardScreen;

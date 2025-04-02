import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '@/screens/DashboardScreen';
import ProjectsListScreen from '@/screens/ProjectsListScreen';
import ProjectDetailsScreen from '@/screens/ProjectDetailsScreen';
import AddEditProjectScreen from '@/screens/AddEditProjectScreen';
import TaskDetailsScreen from '@/screens/TaskDetailsScreen';
import AddEditTaskScreen from '@/screens/AddEditTaskScreen';

import { RootStackParamList, MainTabParamList } from '@/types';
import { colors } from '@/styles/colors';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Projects') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          }

          // Add icon for Activity Log tab if you add it
          // else if (route.name === 'Activity') {
          //   iconName = focused ? 'list' : 'list-outline';
          // }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        tabBarStyle: { backgroundColor: colors.background },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects" component={ProjectsListScreen} options={{ title: 'Projects' }}/>
      {/* Add Activity Log Tab here if desired */}
      {/* <Tab.Screen name="Activity" component={GlobalActivityScreen} /> */}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          // cardStyle is deprecated, use contentStyle in screenOptions or per screen
          // contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }} // Hide header for the tab navigator itself
        />
        <Stack.Screen
          name="ProjectDetails"
          component={ProjectDetailsScreen}
          options={{ title: 'Project Details' }} // Title might be set dynamically later
        />
        <Stack.Screen
          name="AddEditProject"
          component={AddEditProjectScreen}
          // Title set dynamically in the screen component
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetailsScreen}
          options={{ title: 'Task Details' }} // Title might be set dynamically later
        />
        <Stack.Screen
          name="AddEditTask"
          component={AddEditTaskScreen}
           // Title set dynamically in the screen component
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

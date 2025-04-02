// Define Project Status and Task Status/Priority as enums for better type safety
export enum ProjectStatus {
  Active = 'Active',
  OnHold = 'On Hold',
  Completed = 'Completed',
}

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'In Progress',
  Done = 'Done',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

// --- New Types ---
export interface User {
  id: string;
  name: string;
  email?: string; // Optional
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string; // Link to User ID
  authorName: string; // Denormalized for easy display
  text: string;
  createdAt: Date;
}

export enum ActivityAction {
  CREATED_PROJECT = 'CREATED_PROJECT',
  UPDATED_PROJECT = 'UPDATED_PROJECT',
  DELETED_PROJECT = 'DELETED_PROJECT',
  CREATED_TASK = 'CREATED_TASK',
  UPDATED_TASK = 'UPDATED_TASK',
  DELETED_TASK = 'DELETED_TASK',
  ADDED_COMMENT = 'ADDED_COMMENT',
  // Add more actions as needed
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  actorId: string; // User ID
  actorName: string; // Denormalized
  action: ActivityAction;
  targetType: 'Project' | 'Task' | 'Comment';
  targetId: string;
  targetTitle?: string; // Denormalized title of project/task for context
  details?: string; // e.g., "Status changed from 'Todo' to 'In Progress'"
  projectId?: string; // Useful for filtering logs by project
}
// --- End New Types ---


export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; // Changed from assignee name string to ID
  assigneeName?: string; // Denormalized name for display
  dueDate?: Date;
  createdAt: Date;
  lastModifiedAt: Date;
  photos?: string[]; // Array of image URIs (local or remote)
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  deadline?: Date;
  createdAt: Date;
  lastModifiedAt: Date;
  // Removed tasks array, fetch separately
}

export interface DashboardAnalyticsData {
  totalProjects: number;
  projectsByStatus: { [key in ProjectStatus]: number };
  totalTasks: number;
  tasksByStatus: { [key in TaskStatus]: number };
  overdueTasks: number;
  taskCompletionRate: number; // Percentage
}

// Navigation Parameter Types
export type RootStackParamList = {
  MainTabs: undefined; // No params expected for the tab navigator itself
  ProjectDetails: { projectId: string };
  AddEditProject: { projectId?: string }; // Optional projectId for editing
  TaskDetails: { taskId: string; projectId: string }; // Pass projectId for context
  AddEditTask: { taskId?: string; projectId: string }; // Pass projectId always
};

export type MainTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  // Could add ActivityLog tab here if desired
};

// --- Sorting and Filtering Types ---
export type ProjectSortField = 'title' | 'status' | 'deadline' | 'createdAt';
export type TaskSortField = 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface ProjectSortCriteria {
    field: ProjectSortField;
    direction: SortDirection;
}

export interface TaskSortCriteria {
    field: TaskSortField;
    direction: SortDirection;
}

export interface ProjectFilterCriteria {
    status?: ProjectStatus | null;
    // Add more filters like title search later
}

export interface TaskFilterCriteria {
    status?: TaskStatus | null;
    priority?: TaskPriority | null;
    assigneeId?: string | null | 'unassigned'; // Allow 'unassigned' filter
    // Add more filters like title search later
}
// --- End Sorting and Filtering Types ---

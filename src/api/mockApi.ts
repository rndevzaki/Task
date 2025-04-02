import axios, { AxiosInstance } from 'axios';
import {
  Project,
  Task,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  DashboardAnalyticsData,
  User,
  Comment,
  ActivityLog,
  ActivityAction,
} from '@/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;

// --- Mock Data ---
let mockUsers: User[] = [
    { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
    { id: 'user-3', name: 'Charlie', email: 'charlie@example.com' },
    { id: 'user-4', name: 'Diana', email: 'diana@example.com' },
];

// Assume a logged-in user for activity logging
const currentUserId = 'user-1'; // Let's assume Alice is logged in
const getCurrentUser = (): User | undefined => mockUsers.find(u => u.id === currentUserId);

let mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Develop Mobile App',
    description: 'Create a cross-platform mobile application using React Native.',
    status: ProjectStatus.Active,
    deadline: new Date(2024, 5, 30), // June 30, 2024
    createdAt: new Date(2024, 0, 15), // Jan 15, 2024
    lastModifiedAt: new Date(2024, 2, 10), // Mar 10, 2024
  },
  {
    id: 'proj-2',
    title: 'Website Redesign',
    description: 'Update the company website with a modern look and feel.',
    status: ProjectStatus.OnHold,
    deadline: new Date(2024, 7, 15), // Aug 15, 2024
    createdAt: new Date(2024, 1, 1), // Feb 1, 2024
    lastModifiedAt: new Date(2024, 1, 20), // Feb 20, 2024
  },
  {
    id: 'proj-3',
    title: 'Marketing Campaign',
    description: 'Launch a new marketing campaign for Q3.',
    status: ProjectStatus.Completed,
    createdAt: new Date(2023, 10, 1), // Nov 1, 2023
    lastModifiedAt: new Date(2024, 0, 5), // Jan 5, 2024
  },
];

let mockTasks: Task[] = [
  // Tasks for Project 1
  {
    id: 'task-1-1',
    projectId: 'proj-1',
    title: 'Setup Project Structure',
    description: 'Initialize React Native project, install dependencies.',
    status: TaskStatus.Done,
    priority: TaskPriority.High,
    assigneeId: 'user-1', // Alice
    assigneeName: 'Alice',
    dueDate: new Date(2024, 0, 20),
    createdAt: new Date(2024, 0, 16),
    lastModifiedAt: new Date(2024, 0, 18),
    photos: [],
  },
  {
    id: 'task-1-2',
    projectId: 'proj-1',
    title: 'Implement Login Screen',
    description: 'Create UI and logic for user authentication.',
    status: TaskStatus.InProgress,
    priority: TaskPriority.High,
    assigneeId: 'user-2', // Bob
    assigneeName: 'Bob',
    dueDate: new Date(2024, 3, 15),
    createdAt: new Date(2024, 1, 1),
    lastModifiedAt: new Date(2024, 2, 25),
    photos: [],
  },
  {
    id: 'task-1-3',
    projectId: 'proj-1',
    title: 'Develop Dashboard UI',
    description: 'Design and implement the main dashboard view.',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    assigneeId: 'user-1', // Alice
    assigneeName: 'Alice',
    dueDate: new Date(2024, 4, 1),
    createdAt: new Date(2024, 2, 15),
    lastModifiedAt: new Date(2024, 2, 15),
    photos: [],
  },
  // Tasks for Project 2
  {
    id: 'task-2-1',
    projectId: 'proj-2',
    title: 'Gather Design Requirements',
    description: 'Meet with stakeholders to define the new design.',
    status: TaskStatus.Done,
    priority: TaskPriority.Medium,
    assigneeId: 'user-3', // Charlie
    assigneeName: 'Charlie',
    createdAt: new Date(2024, 1, 5),
    lastModifiedAt: new Date(2024, 1, 10),
    photos: [],
  },
  {
    id: 'task-2-2',
    projectId: 'proj-2',
    title: 'Create Wireframes',
    description: 'Develop low-fidelity wireframes for key pages.',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    assigneeId: 'user-3', // Charlie
    assigneeName: 'Charlie',
    dueDate: new Date(2024, 3, 1),
    createdAt: new Date(2024, 1, 15),
    lastModifiedAt: new Date(2024, 1, 15),
    photos: [],
  },
];

let mockComments: Comment[] = [
    { id: 'cmt-1', taskId: 'task-1-2', authorId: 'user-1', authorName: 'Alice', text: 'Need to add password validation.', createdAt: new Date(2024, 2, 26) },
    { id: 'cmt-2', taskId: 'task-1-2', authorId: 'user-2', authorName: 'Bob', text: 'Working on it!', createdAt: new Date(2024, 2, 27) },
];

let mockActivityLog: ActivityLog[] = [];

// --- Helper: Log Activity ---
const logActivity = (
    action: ActivityAction,
    targetType: 'Project' | 'Task' | 'Comment',
    targetId: string,
    targetTitle?: string,
    details?: string,
    projectId?: string
) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return; // Don't log if no user context

    const logEntry: ActivityLog = {
        id: generateId('log'),
        timestamp: new Date(),
        actorId: currentUser.id,
        actorName: currentUser.name,
        action,
        targetType,
        targetId,
        targetTitle,
        details,
        projectId: projectId || (targetType === 'Task' ? mockTasks.find(t => t.id === targetId)?.projectId : undefined) || (targetType === 'Project' ? targetId : undefined),
    };
    mockActivityLog.unshift(logEntry); // Add to the beginning
    console.log('[Mock API] Logged Activity:', logEntry);
};


// --- Mock API Functions ---

// -- Users --
export const getUsers = async (): Promise<User[]> => {
    await delay(200);
    console.log('[Mock API] Fetching users');
    return [...mockUsers];
};

// -- Projects --
export const getProjects = async (): Promise<Project[]> => {
  await delay(500);
  console.log('[Mock API] Fetching projects');
  return [...mockProjects];
};

export const getProject = async (id: string): Promise<Project | undefined> => {
  await delay(300);
  console.log(`[Mock API] Fetching project ${id}`);
  const project = mockProjects.find(p => p.id === id);
  return project ? { ...project } : undefined;
};

export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<Project> => {
  await delay(400);
  const newProject: Project = {
    ...projectData,
    id: generateId('proj'),
    createdAt: new Date(),
    lastModifiedAt: new Date(),
  };
  mockProjects.push(newProject);
  logActivity(ActivityAction.CREATED_PROJECT, 'Project', newProject.id, newProject.title);
  console.log('[Mock API] Created project:', newProject);
  return { ...newProject };
};

export const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> => {
  await delay(400);
  const projectIndex = mockProjects.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    console.log(`[Mock API] Update failed: Project ${id} not found`);
    return undefined;
  }
  const oldProject = { ...mockProjects[projectIndex] }; // Copy before update
  mockProjects[projectIndex] = {
    ...mockProjects[projectIndex],
    ...updates,
    lastModifiedAt: new Date(),
  };
  const updatedProject = mockProjects[projectIndex];

  // Basic change detection for logging details
  let details = Object.keys(updates)
      .filter(key => key !== 'lastModifiedAt' && oldProject[key as keyof Project] !== updatedProject[key as keyof Project])
      .map(key => `${key} changed`) // Simple detail
      .join(', ');

  logActivity(ActivityAction.UPDATED_PROJECT, 'Project', updatedProject.id, updatedProject.title, details || 'Updated project fields');
  console.log('[Mock API] Updated project:', updatedProject);
  return { ...updatedProject };
};

export const deleteProject = async (id: string): Promise<boolean> => {
  await delay(600);
  const projectToDelete = mockProjects.find(p => p.id === id);
  if (!projectToDelete) return false;

  const initialLength = mockProjects.length;
  mockProjects = mockProjects.filter(p => p.id !== id);
  // Also delete associated tasks, comments, and logs
  const tasksToDelete = mockTasks.filter(t => t.projectId === id).map(t => t.id);
  mockTasks = mockTasks.filter(t => t.projectId !== id);
  mockComments = mockComments.filter(c => !tasksToDelete.includes(c.taskId));
  mockActivityLog = mockActivityLog.filter(log => log.projectId !== id); // Remove project-specific logs

  const success = mockProjects.length < initialLength;
  if (success) {
      logActivity(ActivityAction.DELETED_PROJECT, 'Project', id, projectToDelete.title);
      console.log(`[Mock API] Deleting project ${id}: Success`);
  } else {
      console.log(`[Mock API] Deleting project ${id}: Failed`);
  }
  return success;
};

// -- Tasks --
export const getTasks = async (projectId: string): Promise<Task[]> => {
  await delay(400);
  console.log(`[Mock API] Fetching tasks for project ${projectId}`);
  // Add assigneeName based on assigneeId
  const tasks = mockTasks
      .filter(t => t.projectId === projectId)
      .map(t => ({
          ...t,
          assigneeName: t.assigneeId ? mockUsers.find(u => u.id === t.assigneeId)?.name : undefined,
      }));
  return tasks.map(t => ({ ...t })); // Return copies
};

export const getTask = async (taskId: string): Promise<Task | undefined> => {
    await delay(200);
    console.log(`[Mock API] Fetching task ${taskId}`);
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) return undefined;
    // Add assigneeName
    const enrichedTask = {
        ...task,
        assigneeName: task.assigneeId ? mockUsers.find(u => u.id === task.assigneeId)?.name : undefined,
    };
    return enrichedTask ? { ...enrichedTask } : undefined; // Return a copy
};

export const createTask = async (projectId: string, taskData: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'lastModifiedAt' | 'assigneeName'>): Promise<Task> => {
  await delay(350);
  const assignee = taskData.assigneeId ? mockUsers.find(u => u.id === taskData.assigneeId) : undefined;
  const newTask: Task = {
    ...taskData,
    id: generateId('task'),
    projectId: projectId,
    assigneeName: assignee?.name, // Add name
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    photos: taskData.photos || [],
  };
  mockTasks.push(newTask);
  logActivity(ActivityAction.CREATED_TASK, 'Task', newTask.id, newTask.title, undefined, projectId);
  console.log('[Mock API] Created task:', newTask);
  return { ...newTask };
};

export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'projectId' | 'createdAt' | 'assigneeName'>>): Promise<Task | undefined> => {
  await delay(350);
  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    console.log(`[Mock API] Update failed: Task ${taskId} not found`);
    return undefined;
  }

  const oldTask = { ...mockTasks[taskIndex] }; // Copy before update

  // If assigneeId is updated, update assigneeName too
  const assigneeName = updates.assigneeId
      ? mockUsers.find(u => u.id === updates.assigneeId)?.name
      : (updates.assigneeId === null ? undefined : oldTask.assigneeName); // Handle clearing assignee

  mockTasks[taskIndex] = {
    ...oldTask,
    ...updates,
    assigneeName: assigneeName,
    lastModifiedAt: new Date(),
  };
  const updatedTask = mockTasks[taskIndex];

  // Basic change detection for logging details
   let details = Object.keys(updates)
       .filter(key => key !== 'lastModifiedAt' && key !== 'assigneeName' && oldTask[key as keyof Task] !== updatedTask[key as keyof Task])
       .map(key => {
           if (key === 'status') return `Status changed to '${updates.status}'`;
           if (key === 'priority') return `Priority changed to '${updates.priority}'`;
           if (key === 'assigneeId') return `Assignee changed to '${assigneeName || 'Unassigned'}'`;
           return `${key} changed`;
       })
       .join(', ');

  logActivity(ActivityAction.UPDATED_TASK, 'Task', updatedTask.id, updatedTask.title, details || 'Updated task fields', updatedTask.projectId);
  console.log('[Mock API] Updated task:', updatedTask);
  return { ...updatedTask };
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  await delay(500);
  const taskToDelete = mockTasks.find(t => t.id === taskId);
   if (!taskToDelete) return false;

  const initialLength = mockTasks.length;
  mockTasks = mockTasks.filter(t => t.id !== taskId);
  // Also delete associated comments and logs
  mockComments = mockComments.filter(c => c.taskId !== taskId);
  mockActivityLog = mockActivityLog.filter(log => !(log.targetType === 'Task' && log.targetId === taskId) && !(log.targetType === 'Comment' && mockComments.some(c => c.id === log.targetId && c.taskId === taskId))); // Remove task/comment logs

  const success = mockTasks.length < initialLength;
   if (success) {
       logActivity(ActivityAction.DELETED_TASK, 'Task', taskId, taskToDelete.title, undefined, taskToDelete.projectId);
       console.log(`[Mock API] Deleting task ${taskId}: ${success ? 'Success' : 'Failed'}`);
   } else {
        console.log(`[Mock API] Deleting task ${taskId}: Failed`);
   }
  return success;
};

// -- Comments --
export const getComments = async (taskId: string): Promise<Comment[]> => {
    await delay(300);
    console.log(`[Mock API] Fetching comments for task ${taskId}`);
    return mockComments.filter(c => c.taskId === taskId).map(c => ({ ...c })).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Sort by oldest first
};

export const addComment = async (taskId: string, text: string): Promise<Comment> => {
    await delay(300);
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("User not found"); // Should not happen in mock

    const task = mockTasks.find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");

    const newComment: Comment = {
        id: generateId('cmt'),
        taskId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        text,
        createdAt: new Date(),
    };
    mockComments.push(newComment);
    logActivity(ActivityAction.ADDED_COMMENT, 'Comment', newComment.id, undefined, `Commented on task '${task.title}'`, task.projectId);
    console.log('[Mock API] Added comment:', newComment);
    return { ...newComment };
};

// -- Activity Log --
export const getActivityLog = async (projectId?: string, limit: number = 20): Promise<ActivityLog[]> => {
    await delay(450);
    console.log(`[Mock API] Fetching activity log${projectId ? ` for project ${projectId}` : ''}`);
    let logs = mockActivityLog;
    if (projectId) {
        logs = logs.filter(log => log.projectId === projectId);
    }
    return logs.slice(0, limit).map(log => ({ ...log })); // Return copy, sorted newest first implicitly
};


// --- Analytics --- (No changes needed for this step)
export const getDashboardAnalytics = async (): Promise<DashboardAnalyticsData> => {
    await delay(700);
    console.log('[Mock API] Calculating dashboard analytics');

    const totalProjects = mockProjects.length;
    const projectsByStatus = mockProjects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as { [key in ProjectStatus]: number });

    const totalTasks = mockTasks.length;
    const tasksByStatus = mockTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {} as { [key in TaskStatus]: number });

    const now = new Date();
    const overdueTasks = mockTasks.filter(task =>
        task.status !== TaskStatus.Done && task.dueDate && task.dueDate < now
    ).length;

    const completedTasks = tasksByStatus[TaskStatus.Done] || 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    Object.values(ProjectStatus).forEach(status => {
        if (!projectsByStatus[status]) projectsByStatus[status] = 0;
    });
    Object.values(TaskStatus).forEach(status => {
        if (!tasksByStatus[status]) tasksByStatus[status] = 0;
    });

    return {
        totalProjects,
        projectsByStatus,
        totalTasks,
        tasksByStatus,
        overdueTasks,
        taskCompletionRate,
    };
};

// Optional: If you want to use Axios directly (though not needed for mock)
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api', // Replace with your actual API base URL if not mocking
  timeout: 10000,
});

export default {
  getUsers, // Export user functions
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getComments, // Export comment functions
  addComment,
  getActivityLog, // Export activity log function
  getDashboardAnalytics,
};

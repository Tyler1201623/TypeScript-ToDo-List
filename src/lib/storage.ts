import { Task, TaskList, TaskSchema } from '@/types/task';
import { createStore, get, set } from 'idb-keyval';
import { nanoid } from 'nanoid';

const TASKS_STORE_KEY = 'tasks-ultra';
const SETTINGS_STORE_KEY = 'settings-ultra';

// Custom store for app data
const taskStore = createStore('taskflow-ultra-db', 'tasks-store');

export async function getTasks(): Promise<TaskList> {
  try {
    const tasks = await get<TaskList>(TASKS_STORE_KEY, taskStore) || [];
    return tasks.map(task => {
      try {
        return TaskSchema.parse(task);
      } catch (error) {
        console.error('Error parsing task:', error);
        return task;
      }
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

export async function saveTasks(tasks: TaskList): Promise<void> {
  try {
    await set(TASKS_STORE_KEY, tasks, taskStore);
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw new Error('Failed to save tasks');
  }
}

export async function addTask(task: Omit<Task, 'id'>): Promise<Task> {
  const tasks = await getTasks();
  const newTask: Task = { ...task, id: nanoid() };
  await saveTasks([newTask, ...tasks]);
  return newTask;
}

export async function updateTask(updatedTask: Task): Promise<void> {
  const tasks = await getTasks();
  const updatedTasks = tasks.map(task => 
    task.id === updatedTask.id 
      ? { ...updatedTask, updatedAt: new Date().toISOString() } 
      : task
  );
  await saveTasks(updatedTasks);
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getTasks();
  const filteredTasks = tasks.filter(task => task.id !== id);
  await saveTasks(filteredTasks);
}

export async function toggleTaskCompletion(id: string): Promise<void> {
  const tasks = await getTasks();
  const updatedTasks = tasks.map(task => {
    if (task.id === id) {
      const completed = !task.completed;
      return { 
        ...task, 
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString() 
      };
    }
    return task;
  });
  await saveTasks(updatedTasks);
}

export async function clearCompletedTasks(): Promise<void> {
  const tasks = await getTasks();
  const filteredTasks = tasks.filter(task => !task.completed);
  await saveTasks(filteredTasks);
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  defaultPriority: string;
  showCompletedTasks: boolean;
  sortBy: 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultPriority: 'medium',
  showCompletedTasks: true,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const settings = await get<AppSettings>(SETTINGS_STORE_KEY, taskStore);
    return settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await set(SETTINGS_STORE_KEY, settings, taskStore);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw new Error('Failed to save settings');
  }
} 
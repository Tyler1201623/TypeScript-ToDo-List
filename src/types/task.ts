import { nanoid } from 'nanoid';
import { z } from 'zod';

export const PriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export type Priority = z.infer<typeof PriorityEnum>;

export const TaskSchema = z.object({
  id: z.string().default(() => nanoid()),
  text: z.string().min(1, { message: 'Task text is required' }),
  completed: z.boolean().default(false),
  priority: PriorityEnum.default('medium'),
  dueDate: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isImportant: z.boolean().default(false),
  subtasks: z.array(z.string()).default([]),
  estimatedTime: z.number().optional(),
  completedAt: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const createTask = (input: Partial<Task>): Task => {
  const now = new Date().toISOString();
  const defaultTask = {
    id: nanoid(),
    text: '',
    completed: false,
    priority: 'medium' as Priority,
    createdAt: now,
    updatedAt: now,
    tags: [],
    isImportant: false,
    subtasks: [],
  };

  return { ...defaultTask, ...input };
};

export type TaskList = Task[]; 
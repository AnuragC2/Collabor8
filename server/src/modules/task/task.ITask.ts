import { Schema } from 'mongoose';
import { TaskPriority } from './task.taskPriority.js';
import { TaskStatus } from './task.taskStatus.js';
import { TaskType } from './task.taskType.js';

export interface ITask extends Document {
  _id: Schema.Types.ObjectId;
  projectId: Schema.Types.ObjectId;
  workspaceId: Schema.Types.ObjectId;
  taskNumber: number; // Auto-incrementing per project
  key: string; // PROJ-123
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  reporterId: Schema.Types.ObjectId;
  assigneeId?: Schema.Types.ObjectId;
  parentTaskId?: Schema.Types.ObjectId; // For subtasks
  labels: string[];
  storyPoints?: number;
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
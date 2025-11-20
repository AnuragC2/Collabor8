import { Schema, model } from 'mongoose';
import { ITask } from './task.ITask.js';
import { TaskPriority } from './task.taskPriority.js';
import { TaskStatus } from './task.taskStatus.js';
import { TaskType } from './task.taskType.js';

const taskSchema = new Schema<ITask>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  taskNumber: { type: Number, required: true },
  key: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: Object.values(TaskType), default: TaskType.TASK },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
  priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM },
  reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
  parentTaskId: { type: Schema.Types.ObjectId, ref: "Task" },
  labels: [{ type: String, trim: true }],
  storyPoints: { type: Number, min: 0 },
  dueDate: { type: Date },
  startDate: { type: Date },
  completedAt: { type: Date }
}, {
  timestamps: true
});

taskSchema.index({ projectId: 1, taskNumber: 1 }, { unique: true });
taskSchema.index({ workspaceId: 1 });
taskSchema.index({ key: 1 }, { unique: true });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ parentTaskId: 1 });

export const Task = model<ITask>("Task", taskSchema);
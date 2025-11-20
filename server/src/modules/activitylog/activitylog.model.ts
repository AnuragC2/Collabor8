import { Schema, model } from 'mongoose';
import { IActivityLog } from './activitylog.IActivityLog.js';
import { ActivityType } from './activitylog.activityType.js';

const activityLogSchema = new Schema<IActivityLog>({
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  activityType: { type: String, enum: Object.values(ActivityType), required: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

activityLogSchema.index({ workspaceId: 1, createdAt: -1 });
activityLogSchema.index({ taskId: 1, createdAt: -1 });
activityLogSchema.index({ projectId: 1, createdAt: -1 });

export const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
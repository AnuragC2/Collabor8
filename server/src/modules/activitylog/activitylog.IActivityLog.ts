import { Schema } from "mongoose";
import { ActivityType } from "./activitylog.activityType.js";

export interface IActivityLog extends Document {
  _id: Schema.Types.ObjectId;
  workspaceId: Schema.Types.ObjectId;
  projectId?: Schema.Types.ObjectId;
  taskId?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  activityType: ActivityType;
  metadata: Record<string, any>; // Flexible field for activity-specific data
  createdAt: Date;
}
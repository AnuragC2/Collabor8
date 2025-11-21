import { Schema, model } from 'mongoose';
import { ProjectStatus } from './project.projectStatus.js';
import { IProject } from './project.IProject.js';

const projectSchema = new Schema<IProject>({
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  status: { type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.PLANNING },
  leadId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["lead", "member"], required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  startDate: { type: Date },
  targetEndDate: { type: Date }
}, {
  timestamps: true
});

projectSchema.index({ workspaceId: 1 });
projectSchema.index({ key: 1, workspaceId: 1 }, { unique: true });
projectSchema.index({ leadId: 1 });
projectSchema.index({ "members.userId": 1 });

export const Project = model<IProject>("Project", projectSchema);
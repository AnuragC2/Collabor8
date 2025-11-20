import { Schema, model } from 'mongoose';
import { IWorkspace } from './workspace.IWorkspace.js';
import { WorkspaceRole } from './workspace.workspaceRole.js';

const workspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(WorkspaceRole), required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  settings: {
    allowGuestAccess: { type: Boolean, default: false },
    defaultProjectVisibility: { type: String, enum: ["public", "private"], default: "private" }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ "members.userId": 1 });

export const Workspace = model<IWorkspace>("Workspace", workspaceSchema);
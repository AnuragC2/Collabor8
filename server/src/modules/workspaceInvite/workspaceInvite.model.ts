import { Schema, model } from "mongoose";
import { IWorkspaceInvite } from "./workspaceInvite.IWorkspaceInvite.js";
import { WorkspaceRole } from "../workspace/workspace.workspaceRole.js";

const workspaceInviteSchema = new Schema<IWorkspaceInvite>({
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: Object.values(WorkspaceRole), required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ["pending", "accepted", "revoked", "expired"], default: "pending" },
  expiresAt: { type: Date, required: true },
  acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
  acceptedAt: { type: Date },
  revokedAt: { type: Date }
}, {
  timestamps: true
});

workspaceInviteSchema.index({ workspaceId: 1, email: 1, status: 1 });

export const WorkspaceInvite = model<IWorkspaceInvite>("WorkspaceInvite", workspaceInviteSchema);

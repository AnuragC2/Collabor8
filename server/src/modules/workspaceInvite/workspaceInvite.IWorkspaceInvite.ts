import { Schema, Document } from "mongoose";
import { WorkspaceRole } from "../workspace/workspace.workspaceRole.js";

export interface IWorkspaceInvite extends Document {
  _id: Schema.Types.ObjectId;
  workspaceId: Schema.Types.ObjectId;
  email: string;
  role: WorkspaceRole;
  invitedBy: Schema.Types.ObjectId;
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: Date;
  acceptedBy?: Schema.Types.ObjectId;
  acceptedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

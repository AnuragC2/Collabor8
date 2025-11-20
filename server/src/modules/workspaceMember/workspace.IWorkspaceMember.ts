import { Schema } from "mongoose";
import { WorkspaceRole } from "../workspace/workspace.workspaceRole.js";
export interface IWorkspaceMember {
    userId: Schema.Types.ObjectId;
    role: WorkspaceRole;
    joinedAt: Date;
}
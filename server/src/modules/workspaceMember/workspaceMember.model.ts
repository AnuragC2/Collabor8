// import { Schema, model, Document } from "mongoose";

// export type WorkspaceRole = "owner" | "admin" | "member" | "guest";

// export interface IWorkspaceMember extends Document {
//   workspaceId: Schema.Types.ObjectId;
//   userId: Schema.Types.ObjectId;
//   role: WorkspaceRole;
//   invitedBy?: Schema.Types.ObjectId;
//   invitedAt?: Date;
//   joinedAt?: Date;
//   isAccepted?: boolean; // useful for invite flow
//   createdAt: Date;
//   updatedAt: Date;
// }

// const WorkspaceMemberSchema = new Schema<IWorkspaceMember>({
//   workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
//   userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
//   role: { type: String, enum: ["Owner","Admin","Member"], default: "member" },
//   invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
//   invitedAt: Date,
//   joinedAt: Date,
//   isAccepted: { type: Boolean, default: true }
// }, { timestamps: true });

// // Unique membership per user-workspace
// WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

// export const WorkspaceMemberModel = model<IWorkspaceMember>("WorkspaceMember", WorkspaceMemberSchema);

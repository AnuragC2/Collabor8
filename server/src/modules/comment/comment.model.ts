import { Schema, model } from 'mongoose';

const commentSchema = new Schema<IComment>({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true },
  isEdited: { type: Boolean, default: false },
  parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment" }
}, {
  timestamps: true
});

commentSchema.index({ taskId: 1, createdAt: -1 });
commentSchema.index({ workspaceId: 1 });
commentSchema.index({ authorId: 1 });

export const Comment = model<IComment>("Comment", commentSchema);
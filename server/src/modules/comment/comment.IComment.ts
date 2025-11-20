import { Schema } from 'mongoose';

export interface IComment extends Document {
  _id: Schema.Types.ObjectId;
  taskId: Schema.Types.ObjectId;
  workspaceId: Schema.Types.ObjectId;
  authorId: Schema.Types.ObjectId;
  content: string;
  isEdited: boolean;
  parentCommentId?: Schema.Types.ObjectId; // For threaded comments
  createdAt: Date;
  updatedAt: Date;
}
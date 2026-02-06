import client from "./client";

export interface Comment {
  _id: string;
  taskId: string;
  workspaceId: string;
  authorId: { _id: string; name?: string; email: string } | string;
  content: string;
  isEdited: boolean;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export const createComment = async (
  taskId: string,
  data: { content: string; parentCommentId?: string }
) => {
  const response = await client.post(`/comment/task/${taskId}/comments`, data);
  return response.data.data as Comment;
};

export const getTaskComments = async (taskId: string, includeReplies: boolean = true) => {
  const response = await client.get(`/comment/task/${taskId}/comments`, {
    params: { includeReplies: includeReplies ? "true" : "false" },
  });
  return response.data.data as Comment[] | any[];
};

export const updateComment = async (commentId: string, content: string) => {
  const response = await client.patch(`/comment/${commentId}`, { content });
  return response.data.data as Comment;
};

export const deleteComment = async (commentId: string) => {
  await client.delete(`/comment/${commentId}`);
};


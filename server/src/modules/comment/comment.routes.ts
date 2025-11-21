import { Router } from 'express';
import { CommentController } from './comment.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireWorkspaceMember } from '../workspace/workspace.middleware.js';

const commentRoutes = Router();
const controller = new CommentController();

// All routes require authentication
commentRoutes.use(requireAuth);

// Create comment on task
commentRoutes.post("/task/:taskId/comments", controller.createComment);

// Get all comments for a task
commentRoutes.get("/task/:taskId/comments", controller.getTaskComments);

// Get comment count for a task
commentRoutes.get("/task/:taskId/comments/count", controller.getCommentCount);

// Get user's comments in workspace
commentRoutes.get(
    "/workspace/:workspaceId/my-comments",
    requireWorkspaceMember,
    controller.getUserComments
);

// Get recent comments in workspace
commentRoutes.get(
    "/workspace/:workspaceId/recent-comments",
    requireWorkspaceMember,
    controller.getRecentComments
);

// Search comments in workspace
commentRoutes.get(
    "/workspace/:workspaceId/search",
    requireWorkspaceMember,
    controller.searchComments
);

// Get specific comment
commentRoutes.get("/:commentId", controller.getComment);

// Get replies to a comment
commentRoutes.get("/:commentId/replies", controller.getCommentReplies);

// Get reply count for a comment
commentRoutes.get("/:commentId/replies/count", controller.getReplyCount);

// Update comment
commentRoutes.patch("/:commentId", controller.updateComment);

// Delete comment (and all its replies)
commentRoutes.delete("/:commentId", controller.deleteComment);

export default commentRoutes;
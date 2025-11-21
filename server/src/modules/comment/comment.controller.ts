import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comment.service.js';
import { AppError } from '../../core/errors/AppError.js';
import { Schema } from 'mongoose';

export class CommentController {
    private service: CommentService;

    constructor() {
        this.service = new CommentService();
    }

    createComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;
            const {
                content,
                parentCommentId
            } = req.body;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            if (!content || content.trim().length === 0) {
                throw AppError.badRequest("Comment content is required");
            }

            if (content.trim().length > 5000) {
                throw AppError.badRequest("Comment content must be less than 5000 characters");
            }

            const authorId = req.user!.id.toString();

            const tid = new Schema.Types.ObjectId(taskId);
            const comment = await this.service.createComment({
                    taskId: tid,
                    content,
                    parentCommentId
                },
                authorId
            );

            res.status(201).json({
                success: true,
                data: comment,
                message: "Comment created successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    getComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                commentId
            } = req.params;

            if (!commentId) {
                throw AppError.badRequest("Comment ID is required");
            }

            const userId = req.user!.id.toString();
            const comment = await this.service.getCommentById(commentId, userId);

            res.status(200).json({
                success: true,
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };

    getTaskComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;
            const {
                includeReplies
            } = req.query;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            const userId = req.user!.id.toString();

            let comments;
            if (includeReplies === "true") {
                comments = await this.service.getTaskCommentsWithReplies(taskId, userId);
            } else {
                comments = await this.service.getTaskComments(taskId, userId);
            }

            res.status(200).json({
                success: true,
                data: comments,
                count: Array.isArray(comments) ? comments.length : 0
            });
        } catch (error) {
            next(error);
        }
    };

    getCommentReplies = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                commentId
            } = req.params;

            if (!commentId) {
                throw AppError.badRequest("Comment ID is required");
            }

            const userId = req.user!.id.toString();
            const replies = await this.service.getCommentReplies(commentId, userId);

            res.status(200).json({
                success: true,
                data: replies,
                count: replies.length
            });
        } catch (error) {
            next(error);
        }
    };

    updateComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                commentId
            } = req.params;
            const {
                content
            } = req.body;

            if (!commentId) {
                throw AppError.badRequest("Comment ID is required");
            }

            if (!content || content.trim().length === 0) {
                throw AppError.badRequest("Comment content is required");
            }

            if (content.trim().length > 5000) {
                throw AppError.badRequest("Comment content must be less than 5000 characters");
            }

            const userId = req.user!.id.toString();
            const comment = await this.service.updateComment(commentId, userId, {
                content
            });

            res.status(200).json({
                success: true,
                data: comment,
                message: "Comment updated successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    deleteComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                commentId
            } = req.params;

            if (!commentId) {
                throw AppError.badRequest("Comment ID is required");
            }

            const userId = req.user!.id.toString();
            await this.service.deleteComment(commentId, userId);

            res.status(200).json({
                success: true,
                message: "Comment deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    getCommentCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            const userId = req.user!.id.toString();
            const count = await this.service.getCommentCount(taskId, userId);

            res.status(200).json({
                success: true,
                data: {
                    count
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getReplyCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                commentId
            } = req.params;

            if (!commentId) {
                throw AppError.badRequest("Comment ID is required");
            }

            const userId = req.user!.id.toString();
            const count = await this.service.getReplyCount(commentId, userId);

            res.status(200).json({
                success: true,
                data: {
                    count
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getUserComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                workspaceId
            } = req.params;

            if (!workspaceId) {
                throw AppError.badRequest("Workspace ID is required");
            }

            const userId = req.user!.id.toString();
            const comments = await this.service.getUserComments(userId, workspaceId);

            res.status(200).json({
                success: true,
                data: comments,
                count: comments.length
            });
        } catch (error) {
            next(error);
        }
    };

    getRecentComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                workspaceId
            } = req.params;
            const {
                limit
            } = req.query;

            if (!workspaceId) {
                throw AppError.badRequest("Workspace ID is required");
            }

            const userId = req.user!.id.toString();
            const parsedLimit = limit ? parseInt(limit as string) : 20;

            const comments = await this.service.getRecentComments(
                workspaceId,
                userId,
                parsedLimit
            );

            res.status(200).json({
                success: true,
                data: comments,
                count: comments.length
            });
        } catch (error) {
            next(error);
        }
    };

    searchComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                workspaceId
            } = req.params;
            const {
                q,
                taskId
            } = req.query;

            if (!workspaceId) {
                throw AppError.badRequest("Workspace ID is required");
            }

            if (!q || typeof q !== "string") {
                throw AppError.badRequest("Search query is required");
            }

            const userId = req.user!.id.toString();

            const comments = await this.service.searchComments(
                workspaceId,
                userId,
                q,
                taskId as string
            );

            res.status(200).json({
                success: true,
                data: comments,
                count: comments.length
            });
        } catch (error) {
            next(error);
        }
    };
}
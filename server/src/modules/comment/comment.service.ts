import { CommentRepository } from './comment.repository.js';
import { TaskService } from '../task/task.service.js';
import { IComment } from './comment.IComment.js';
import { AppError } from '../../core/errors/AppError.js';
import { Schema } from 'mongoose';

export interface CreateCommentDTO {
    taskId: Schema.Types.ObjectId;
    content: string;
    parentCommentId ? : Schema.Types.ObjectId;
}

export interface UpdateCommentDTO {
    content: string;
}

export class CommentService {
    private repository: CommentRepository;
    private taskService: TaskService;

    constructor() {
        this.repository = new CommentRepository();
        this.taskService = new TaskService();
    }

    async createComment(
        data: CreateCommentDTO,
        authorId: string
    ): Promise < IComment > {
        // Get task to verify access and get workspace
        const task = await this.taskService.getTaskById(
            data.taskId.toString(),
            authorId
        );

        // Verify parent comment exists and belongs to same task
        if (data.parentCommentId) {
            const parentComment = await this.repository.findById(data.parentCommentId);

            if (!parentComment) {
                throw AppError.notFound("Parent comment not found");
            }

            if (parentComment.taskId.toString() !== data.taskId.toString()) {
                throw AppError.badRequest("Parent comment must belong to the same task");
            }
        }
        const aid = new Schema.Types.ObjectId(authorId);
        const pid = data.parentCommentId == undefined ? new Schema.Types.ObjectId("") : data.parentCommentId;
        const comment = await this.repository.create({
            taskId: data.taskId,
            workspaceId: task.workspaceId,
            authorId: aid,
            content: data.content.trim(),
            parentCommentId: pid,
            isEdited: false
        });

        return comment;
    }

    async getCommentById(commentId: string, userId: string): Promise < IComment > {
        const comment = await this.repository.findById(commentId);

        if (!comment) {
            throw AppError.notFound("Comment not found");
        }

        // Verify user has access to the task
        await this.taskService.getTaskById(comment.taskId.toString(), userId);

        return comment;
    }

    async getTaskComments(taskId: string, userId: string): Promise < IComment[] > {
        // Verify user has access to task
        await this.taskService.getTaskById(taskId, userId);

        return await this.repository.findByTask(taskId);
    }

    async getTaskCommentsWithReplies(
        taskId: string,
        userId: string
    ): Promise < any[] > {
        // Verify user has access to task
        await this.taskService.getTaskById(taskId, userId);

        return await this.repository.findThreadWithReplies(taskId);
    }

    async getCommentReplies(
        commentId: string,
        userId: string
    ): Promise < IComment[] > {
        const comment = await this.repository.findById(commentId);

        if (!comment) {
            throw AppError.notFound("Comment not found");
        }

        // Verify user has access to task
        await this.taskService.getTaskById(comment.taskId.toString(), userId);

        return await this.repository.findReplies(commentId);
    }

    async updateComment(
        commentId: string,
        userId: string,
        data: UpdateCommentDTO
    ): Promise < IComment > {
        const comment = await this.repository.findById(commentId);

        if (!comment) {
            throw AppError.notFound("Comment not found");
        }

        // Only author can edit their comment
        if (comment.authorId.toString() !== userId) {
            throw AppError.forbidden("You can only edit your own comments");
        }

        // Check if content is actually different
        if (comment.content === data.content.trim()) {
            return comment;
        }

        const updatedComment = await this.repository.update(
            commentId,
            data.content.trim()
        );

        if (!updatedComment) {
            throw AppError.notFound("Comment not found");
        }

        return updatedComment;
    }

    async deleteComment(commentId: string, userId: string): Promise < void > {
        const comment = await this.repository.findById(commentId);

        if (!comment) {
            throw AppError.notFound("Comment not found");
        }

        // Get task to check permissions
        const task = await this.taskService.getTaskById(
            comment.taskId.toString(),
            userId
        );

        // Author can delete their own comment
        const isAuthor = comment.authorId.toString() === userId;

        // Task reporter can delete any comment on their task
        const isTaskReporter = task.reporterId.toString() === userId;

        // Project lead or workspace admin can delete any comment
        const hasProjectEditAccess = await this.taskService["projectService"].hasProjectEditAccess(
            task.projectId.toString(),
            userId,
            task.workspaceId.toString()
        );

        if (!isAuthor && !isTaskReporter && !hasProjectEditAccess) {
            throw AppError.forbidden(
                "Only comment author, task reporter, or project lead can delete comments"
            );
        }

        await this.repository.delete(commentId);
    }

    async getCommentCount(taskId: string, userId: string): Promise < number > {
        // Verify user has access to task
        await this.taskService.getTaskById(taskId, userId);

        return await this.repository.countByTask(taskId);
    }

    async getReplyCount(
        commentId: string,
        userId: string
    ): Promise < number > {
        const comment = await this.repository.findById(commentId);

        if (!comment) {
            throw AppError.notFound("Comment not found");
        }

        // Verify user has access to task
        await this.taskService.getTaskById(comment.taskId.toString(), userId);

        return await this.repository.countReplies(commentId);
    }

    async getUserComments(
        userId: string,
        workspaceId: string
    ): Promise < IComment[] > {
        // Verify user has access to workspace
        await this.taskService["workspaceService"].verifyMembership(
            workspaceId,
            userId
        );

        return await this.repository.findByAuthor(userId, workspaceId);
    }

    async getRecentComments(
        workspaceId: string,
        userId: string,
        limit: number = 20
    ): Promise < IComment[] > {
        // Verify user has access to workspace
        await this.taskService["workspaceService"].verifyMembership(
            workspaceId,
            userId
        );

        return await this.repository.findRecentComments(workspaceId, limit);
    }

    async searchComments(
        workspaceId: string,
        userId: string,
        searchTerm: string,
        taskId ? : string
    ): Promise < IComment[] > {
        // Verify user has access to workspace
        await this.taskService["workspaceService"].verifyMembership(
            workspaceId,
            userId
        );

        // If taskId provided, verify access to task
        if (taskId) {
            await this.taskService.getTaskById(taskId, userId);
        }

        return await this.repository.searchComments(
            workspaceId,
            searchTerm,
            taskId
        );
    }
}
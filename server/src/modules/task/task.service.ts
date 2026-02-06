import { TaskRepository } from "./task.repository.js";
import { ProjectService } from "../project/project.service.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import { ITask } from "./task.ITask.js";
import { TaskStatus } from "./task.taskStatus.js";
import { TaskPriority } from "./task.taskPriority.js";
import { TaskType } from "./task.taskType.js";
import { AppError } from "../../core/errors/AppError.js";
import { Types } from "mongoose";
import { Project } from "../project/project.model.js";
import { CommentRepository } from "../comment/comment.repository.js";
import { getObjectIdString } from "../../utils/id.js";

export interface CreateTaskDTO {
    projectId: Types.ObjectId;
    title: string;
    description ? : string;
    type ? : TaskType;
    priority ? : TaskPriority;
    assigneeId ? : Types.ObjectId;
    parentTaskId ? : Types.ObjectId;
    labels ? : string[];
    storyPoints ? : number;
    dueDate ? : Date;
}

export interface UpdateTaskDTO {
    title ? : string;
    description ? : string;
    type ? : TaskType;
    priority ? : TaskPriority;
    labels ? : string[];
    storyPoints ? : number;
    dueDate ? : Date;
    startDate ? : Date;
}

export class TaskService {
    private repository: TaskRepository;
    private projectService: ProjectService;
    private workspaceService: WorkspaceService;
    private commentRepository: CommentRepository;

    constructor() {
        this.repository = new TaskRepository();
        this.projectService = new ProjectService();
        this.workspaceService = new WorkspaceService();
        this.commentRepository = new CommentRepository();
    }

    async createTask(data: CreateTaskDTO, reporterId: Types.ObjectId): Promise < ITask > {
        // Get project to verify access and get workspace
        const project = await Project.findById(data.projectId);
        if (!project) {
            throw AppError.notFound("Project not found");
        }

        // Verify reporter has access to project
        await this.projectService.verifyProjectAccess(
            getObjectIdString(data.projectId),
            reporterId.toString()
        );

        // Verify assignee is project member (if assigned)
        if (data.assigneeId) {
            await this.projectService.verifyProjectAccess(
                getObjectIdString(data.projectId),
                getObjectIdString(data.assigneeId),
            );
        }

        // Verify parent task exists and belongs to same project
        if (data.parentTaskId) {
            const parentTask = await this.repository.findById(getObjectIdString(data.parentTaskId));
            if (!parentTask) {
                throw AppError.notFound("Parent task not found");
            }
            if (parentTask.projectId.toString() !== getObjectIdString(data.projectId).toString()) {
                throw AppError.badRequest("Parent task must belong to the same project");
            }
        }

        // Generate task number and key
        const taskNumber = await this.repository.getNextTaskNumber(getObjectIdString(data.projectId));
        const taskKey = `${project.key}-${taskNumber}`;

        const task = await this.repository.create({
            ...data,
            workspaceId: getObjectIdString(project.workspaceId),
            reporterId,
            taskNumber,
            key: taskKey,
            status: TaskStatus.TODO,
            priority: data.priority || TaskPriority.MEDIUM,
            type: data.type || TaskType.TASK
        });

        return task;
    }

    async getTaskById(taskId: string, userId: string): Promise < ITask > {
        const task = await this.repository.findById(getObjectIdString(taskId));
        if (!task) {
            throw AppError.notFound("Task not found");
        }

        // Verify user has access to project
        await this.projectService.verifyProjectAccess(
            getObjectIdString(task.projectId).toString(),
            userId
        );

        return task;
    }

    async getTaskByKey(key: string, userId: string): Promise < ITask > {
        const task = await this.repository.findByKey(key.toUpperCase());
        if (!task) {
            throw AppError.notFound("Task not found");
        }

        await this.projectService.verifyProjectAccess(
            getObjectIdString(task.projectId).toString(),
            userId
        );

        return task;
    }

    async getProjectTasks(
        projectId: string,
        userId: string,
        filters ? : {
            status ? : TaskStatus;
            assigneeId ? : string;
            type ? : TaskType;
            priority ? : TaskPriority;
            parentTaskId ? : string | null;
        }
    ): Promise < ITask[] > {
        await this.projectService.verifyProjectAccess(projectId, userId);

        return await this.repository.findByProject(projectId, filters);
    }

    async getSubtasks(parentTaskId: string, userId: string): Promise < ITask[] > {
        const parentTask = await this.repository.findById(parentTaskId);
        if (!parentTask) {
            throw AppError.notFound("Parent task not found");
        }

        await this.projectService.verifyProjectAccess(
            parentTask.projectId.toString(),
            userId
        );

        return await this.repository.findSubtasks(parentTaskId);
    }

    async getMyTasks(
        userId: string,
        workspaceId: string,
        filters ? : {
            status ? : TaskStatus;
            projectId ? : string;
        }
    ): Promise < ITask[] > {
        await this.workspaceService.verifyMembership(workspaceId, userId);

        return await this.repository.findByAssignee(userId, workspaceId, filters);
    }

    async getReportedTasks(userId: string, workspaceId: string): Promise < ITask[] > {
        await this.workspaceService.verifyMembership(workspaceId, userId);

        return await this.repository.findByReporter(userId, workspaceId);
    }

    async updateTask(
        taskId: string,
        userId: string,
        data: UpdateTaskDTO
    ): Promise < ITask > {
        const task = await this.repository.findById(taskId);
        if (!task) {
            throw AppError.notFound("Task not found");
        }

        // Verify user is reporter, assignee, or has project edit access
        await this.verifyTaskEditAccess(task, userId);

        const updatedTask = await this.repository.update(taskId, data);
        if (!updatedTask) {
            throw AppError.notFound("Task not found");
        }

        return updatedTask;
    }

    async updateTaskStatus(
        taskId: string,
        userId: string,
        newStatus: TaskStatus
    ): Promise < ITask > {
        const task = await this.repository.findById(getObjectIdString(taskId));
        if (!task) {
            throw AppError.notFound("Task not found");
        }

        // Verify user has access to task
        await this.verifyTaskEditAccess(task, userId);

        // Validate status transition
        this.validateStatusTransition(task.status, newStatus);

        const updatedTask = await this.repository.updateStatus(getObjectIdString(taskId), newStatus);
        if (!updatedTask) {
            throw AppError.notFound("Task not found");
        }

        return updatedTask;
    }

    async assignTask(
        taskId: string,
        requesterId: string,
        assigneeId: string
    ): Promise < ITask > {
        const task = await this.repository.findById(taskId);
        if (!task) {
            throw AppError.notFound("Task not found");
        }

        // Verify requester has access
        await this.verifyTaskEditAccess(task, requesterId);

        // Verify assignee is project member
        await this.projectService.verifyProjectAccess(
            task.projectId.toString(),
            assigneeId
        );

        const updatedTask = await this.repository.assignTask(taskId, assigneeId);
        if (!updatedTask) {
            throw AppError.notFound("Task not found");
        }

        return updatedTask;
    }

    async unassignTask(taskId: string, userId: string): Promise < ITask > {
        const task = await this.repository.findById(taskId);
        if (!task) {
            throw AppError.notFound("Task not found");
        }

        // User can unassign themselves or if they have edit access
        const isSelfUnassign = task.assigneeId?.toString() === userId;
        if (!isSelfUnassign) {
            await this.verifyTaskEditAccess(task, userId);
        }

        const updatedTask = await this.repository.unassignTask(taskId);
        if (!updatedTask) {
            throw AppError.notFound("Task not found");
        }

        return updatedTask;
    }

    async deleteTask(taskId: string, userId: string): Promise < void > {
        const task = await this.repository.findById(taskId);
        if (!task) {
            throw AppError.notFound("Task not found");
        }

        // Only reporter or project lead/workspace admin can delete
        const isReporter = task.reporterId.toString() === userId;
        const hasProjectEditAccess = await this.projectService.hasProjectEditAccess(
            task.projectId.toString(),
            userId,
            task.workspaceId.toString()
        );

        if (!isReporter && !hasProjectEditAccess) {
            throw AppError.forbidden("Only task reporter or project lead can delete tasks");
        }

        const subtasks = await this.repository.findSubtasks(taskId);
        const taskIdsToDelete = [taskId, ...subtasks.map(task => task._id.toString())];

        await this.commentRepository.deleteByTaskIds(taskIdsToDelete);
        await this.repository.delete(taskId);
    }

    async searchTasks(
        workspaceId: string,
        userId: string,
        searchTerm: string,
        projectId ? : string
    ): Promise < ITask[] > {
        await this.workspaceService.verifyMembership(workspaceId, userId);

        if (projectId) {
            await this.projectService.verifyProjectAccess(projectId, userId);
        }

        return await this.repository.search(workspaceId, searchTerm, projectId);
    }

    async getTaskStats(projectId: string, userId: string): Promise < any > {
        await this.projectService.verifyProjectAccess(projectId, userId);

        const [todo, inProgress, inReview, done, cancelled] = await Promise.all([
            this.repository.countByProject(projectId, TaskStatus.TODO),
            this.repository.countByProject(projectId, TaskStatus.IN_PROGRESS),
            this.repository.countByProject(projectId, TaskStatus.IN_REVIEW),
            this.repository.countByProject(projectId, TaskStatus.DONE),
            this.repository.countByProject(projectId, TaskStatus.CANCELLED)
        ]);

        return {
            total: todo + inProgress + inReview + done + cancelled,
            todo,
            inProgress,
            inReview,
            done,
            cancelled
        };
    }

    // Helper: Verify user can edit task
    private async verifyTaskEditAccess(task: ITask, userId: string): Promise < void > {
        const isReporter = task.reporterId.toString() === userId;
        const isAssignee = task.assigneeId?.toString() === userId;

        if (isReporter || isAssignee) {
            return; // Reporter and assignee can edit
        }

        // Check if user has project edit access
        const hasProjectEditAccess = await this.projectService.hasProjectEditAccess(
            task.projectId.toString(),
            userId,
            task.workspaceId.toString()
        );

        if (!hasProjectEditAccess) {
            throw AppError.forbidden("You don't have permission to edit this task");
        }
    }

    // Helper: Validate status transitions
    private validateStatusTransition(
        currentStatus: TaskStatus,
        newStatus: TaskStatus
    ): void {
        // Define allowed transitions
        const allowedTransitions: Record < TaskStatus, TaskStatus[] > = {
            [TaskStatus.TODO]: [
                TaskStatus.IN_PROGRESS,
                TaskStatus.CANCELLED
            ],
            [TaskStatus.IN_PROGRESS]: [
                TaskStatus.TODO,
                TaskStatus.IN_REVIEW,
                TaskStatus.DONE,
                TaskStatus.CANCELLED
            ],
            [TaskStatus.IN_REVIEW]: [
                TaskStatus.IN_PROGRESS,
                TaskStatus.DONE,
                TaskStatus.CANCELLED
            ],
            [TaskStatus.DONE]: [
                TaskStatus.TODO,
                TaskStatus.IN_PROGRESS
            ],
            [TaskStatus.CANCELLED]: [
                TaskStatus.TODO
            ]
        };

        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
            throw AppError.badRequest(
                `Cannot transition from ${currentStatus} to ${newStatus}`
            );
        }
    }
}

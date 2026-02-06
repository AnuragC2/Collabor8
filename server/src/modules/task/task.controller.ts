import { Request, Response, NextFunction } from "express";
import { TaskService } from "./task.service.js";
import { TaskStatus } from "./task.taskStatus.js";
import { TaskPriority } from "./task.taskPriority.js";
import { TaskType } from "./task.taskType.js";
import { AppError } from "../../core/errors/AppError.js";
import { Types } from "mongoose";

export class TaskController {
    private service: TaskService;

    constructor() {
        this.service = new TaskService();
    }

    createTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { projectId } = req.params;
            const {
                title,
                description,
                type,
                priority,
                assigneeId,
                parentTaskId,
                labels,
                storyPoints,
                dueDate
            } = req.body;

            if (!projectId) {
                throw AppError.badRequest("Project ID is required");
            }

            if (!title) {
                throw AppError.badRequest("Task title is required");
            }

            const reporterId = req.user!.id.toString();

            const pid = new Types.ObjectId(projectId);
            const rid = new Types.ObjectId(reporterId);
            const task = await this.service.createTask({
                    projectId: pid,
                    title,
                    description,
                    type,
                    priority,
                    assigneeId,
                    parentTaskId,
                    labels,
                    storyPoints,
                    dueDate
                },
                rid
            );

            res.status(201).json({
                success: true,
                data: task,
                message: "Task created successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    getTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            const userId = req.user!.id.toString();
            const task = await this.service.getTaskById(taskId, userId);

            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error) {
            next(error);
        }
    };

    getTaskByKey = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                key
            } = req.params;

            if (!key) {
                throw AppError.badRequest("Task key is required");
            }

            const userId = req.user!.id.toString();
            const task = await this.service.getTaskByKey(key, userId);

            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error) {
            next(error);
        }
    };

    getProjectTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                projectId
            } = req.params;
            const {
                status,
                assigneeId,
                type,
                priority,
                parentTaskId
            } = req.query;

            if (!projectId) {
                throw AppError.badRequest("Project ID is required");
            }

            const userId = req.user!.id.toString();

            const tasks = await this.service.getProjectTasks(projectId, userId, {
                status: status as TaskStatus,
                assigneeId: assigneeId as string,
                type: type as TaskType,
                priority: priority as TaskPriority,
                parentTaskId: parentTaskId === "null" ? null : (parentTaskId as string)
            });

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length
            });
        } catch (error) {
            next(error);
        }
    };

    getSubtasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            const userId = req.user!.id.toString();
            const subtasks = await this.service.getSubtasks(taskId, userId);

            res.status(200).json({
                success: true,
                data: subtasks,
                count: subtasks.length
            });
        } catch (error) {
            next(error);
        }
    };

    getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                workspaceId
            } = req.params;
            const {
                status,
                projectId
            } = req.query;

            if (!workspaceId) {
                throw AppError.badRequest("Workspace ID is required");
            }

            const userId = req.user!.id.toString();

            const tasks = await this.service.getMyTasks(userId, workspaceId, {
                status: status as TaskStatus,
                projectId: projectId as string
            });

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length
            });
        } catch (error) {
            next(error);
        }
    };

    getReportedTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                workspaceId
            } = req.params;

            if (!workspaceId) {
                throw AppError.badRequest("Workspace ID is required");
            }

            const userId = req.user!.id.toString();
            const tasks = await this.service.getReportedTasks(userId, workspaceId);

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length
            });
        } catch (error) {
            next(error);
        }
    };

    updateTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            const userId = req.user!.id.toString();
            const updateData = req.body;

            const task = await this.service.updateTask(taskId, userId, updateData);

            res.status(200).json({
                success: true,
                data: task,
                message: "Task updated successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;
            const {
                status
            } = req.body;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            if (!status) {
                throw AppError.badRequest("Status is required");
            }

            const userId = req.user!.id.toString();
            const task = await this.service.updateTaskStatus(taskId, userId, status);

            res.status(200).json({
                success: true,
                data: task,
                message: "Task status updated successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    assignTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;
            const {
                assigneeId
            } = req.body;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            if (!assigneeId) {
                throw AppError.badRequest("Assignee ID is required");
            }

            const requesterId = req.user!.id.toString();
            const task = await this.service.assignTask(taskId, requesterId, assigneeId);

            res.status(200).json({
                success: true,
                data: task,
                message: "Task assigned successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    unassignTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            const userId = req.user!.id.toString();
            const task = await this.service.unassignTask(taskId, userId);

            res.status(200).json({
                success: true,
                data: task,
                message: "Task unassigned successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    deleteTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                taskId
            } = req.params;

            if (!taskId) {
                throw AppError.badRequest("Task ID is required");
            }

            const userId = req.user!.id.toString();
            await this.service.deleteTask(taskId, userId);

            res.status(200).json({
                success: true,
                message: "Task deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    searchTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                workspaceId
            } = req.params;
            const {
                q,
                projectId
            } = req.query;

            if (!workspaceId) {
                throw AppError.badRequest("Workspace ID is required");
            }

            if (!q || typeof q !== "string") {
                throw AppError.badRequest("Search query is required");
            }

            const userId = req.user!.id.toString();

            const tasks = await this.service.searchTasks(
                workspaceId,
                userId,
                q,
                projectId as string
            );

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length
            });
        } catch (error) {
            next(error);
        }
    };

    getTaskStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                projectId
            } = req.params;

            if (!projectId) {
                throw AppError.badRequest("Project ID is required");
            }

            const userId = req.user!.id.toString();
            const stats = await this.service.getTaskStats(projectId, userId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    };
}

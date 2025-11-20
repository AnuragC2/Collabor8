import { Task } from './task.model.js'
import { ITask } from './task.ITask.js'
import { TaskPriority } from './task.taskPriority.js'
import { TaskType } from './task.taskType.js'
import { TaskStatus } from './task.taskStatus.js'
import { Schema } from 'mongoose';

export class TaskRepository {
    async create(taskData: Partial < ITask > ): Promise < ITask > {
        const task = new Task(taskData);
        return await task.save();
    }

    async findById(id: string | Schema.Types.ObjectId): Promise < ITask | null > {
        return await Task.findById(id)
            .populate("reporterId", "name email")
            .populate("assigneeId", "name email")
            .populate("projectId", "name key")
            .populate("parentTaskId", "key title status");
    }

    async findByKey(key: string): Promise < ITask | null > {
        return await Task.findOne({
                key
            })
            .populate("reporterId", "name email")
            .populate("assigneeId", "name email")
            .populate("projectId", "name key");
    }

    async findByProject(
        projectId: string | Schema.Types.ObjectId,
        filters ? : {
            status ? : TaskStatus;
            assigneeId ? : string;
            type ? : TaskType;
            priority ? : TaskPriority;
            parentTaskId ? : string | null; // null for top-level tasks only
        }): Promise < ITask[] > {
        const query: any = {
            projectId
        };

        if (filters?.status) query.status = filters.status;
        if (filters?.assigneeId) query.assigneeId = filters.assigneeId;
        if (filters?.type) query.type = filters.type;
        if (filters?.priority) query.priority = filters.priority;

        // Filter for top-level tasks (no parent)
        if (filters?.parentTaskId === null) {
            query.parentTaskId = {
                $exists: false
            };
        } else if (filters?.parentTaskId) {
            query.parentTaskId = filters.parentTaskId;
        }

        return await Task.find(query)
            .populate("reporterId", "name email")
            .populate("assigneeId", "name email")
            .sort({
                createdAt: -1
            });
    }

    async findSubtasks(parentTaskId: string | Schema.Types.ObjectId): Promise < ITask[] > {
        return await Task.find({
                parentTaskId
            })
            .populate("reporterId", "name email")
            .populate("assigneeId", "name email")
            .sort({
                createdAt: 1
            });
    }

    async findByAssignee(
        assigneeId: string | Schema.Types.ObjectId,
        workspaceId: string | Schema.Types.ObjectId,
        filters ? : {
            status ? : TaskStatus;
            projectId ? : string;
        }
    ): Promise < ITask[] > {
        const query: any = {
            assigneeId,
            workspaceId
        };

        if (filters?.status) query.status = filters.status;
        if (filters?.projectId) query.projectId = filters.projectId;

        return await Task.find(query)
            .populate("projectId", "name key")
            .sort({
                dueDate: 1,
                priority: -1
            });
    }

    async findByReporter(
        reporterId: string | Schema.Types.ObjectId,
        workspaceId: string | Schema.Types.ObjectId
    ): Promise < ITask[] > {
        return await Task.find({
                reporterId,
                workspaceId
            })
            .populate("projectId", "name key")
            .populate("assigneeId", "name email")
            .sort({
                createdAt: -1
            });
    }

    async getNextTaskNumber(projectId: string | Schema.Types.ObjectId): Promise < number > {
        const lastTask = await Task.findOne({
                projectId
            })
            .sort({
                taskNumber: -1
            })
            .select("taskNumber");

        return lastTask ? lastTask.taskNumber + 1 : 1;
    }

    async update(
        id: string | Schema.Types.ObjectId,
        updateData: Partial < ITask >
    ): Promise < ITask | null > {
        return await Task.findByIdAndUpdate(
                id, {
                    $set: updateData
                }, {
                    new: true,
                    runValidators: true
                }
            )
            .populate("reporterId", "name email")
            .populate("assigneeId", "name email")
            .populate("projectId", "name key");
    }

    async updateStatus(
        id: string | Schema.Types.ObjectId,
        status: TaskStatus
    ): Promise < ITask | null > {
        const updateData: any = {
            status
        };

        // Set completedAt when status changes to DONE
        if (status === TaskStatus.DONE) {
            updateData.completedAt = new Date();
        } else if (status === TaskStatus.IN_PROGRESS && !updateData.startDate) {
            updateData.startDate = new Date();
        }

        return await Task.findByIdAndUpdate(
                id, {
                    $set: updateData
                }, {
                    new: true
                }
            )
            .populate("reporterId", "name email")
            .populate("assigneeId", "name email");
    }

    async assignTask(
        id: string | Schema.Types.ObjectId,
        assigneeId: string | Schema.Types.ObjectId
    ): Promise < ITask | null > {
        return await Task.findByIdAndUpdate(
                id, {
                    $set: {
                        assigneeId
                    }
                }, {
                    new: true
                }
            )
            .populate("reporterId", "name email")
            .populate("assigneeId", "name email");
    }

    async unassignTask(id: string | Schema.Types.ObjectId): Promise < ITask | null > {
        return await Task.findByIdAndUpdate(
                id, {
                    $unset: {
                        assigneeId: ""
                    }
                }, {
                    new: true
                }
            )
            .populate("reporterId", "name email");
    }

    async countByProject(
        projectId: string | Schema.Types.ObjectId,
        status ? : TaskStatus
    ): Promise < number > {
        const query: any = {
            projectId
        };
        if (status) query.status = status;
        return await Task.countDocuments(query);
    }

    async countByAssignee(
        assigneeId: string | Schema.Types.ObjectId,
        status ? : TaskStatus
    ): Promise < number > {
        const query: any = {
            assigneeId
        };
        if (status) query.status = status;
        return await Task.countDocuments(query);
    }

    async delete(id: string | Schema.Types.ObjectId): Promise < void > {
        // Also delete all subtasks
        await Task.deleteMany({
            parentTaskId: id
        });
        await Task.findByIdAndDelete(id);
    }

    async search(
        workspaceId: string | Schema.Types.ObjectId,
        searchTerm: string,
        projectId ? : string): Promise < ITask[] > {
        const query: any = {
            workspaceId,
            $or: [{
                    title: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    key: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                }
            ]
        };

        if (projectId) {
            query.projectId = projectId;
        }

        return await Task.find(query)
            .populate("projectId", "name key")
            .populate("assigneeId", "name email")
            .limit(50)
            .sort({
                updatedAt: -1
            });
    }
}
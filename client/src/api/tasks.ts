import client from "./client";

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "cancelled";
export type TaskPriority = "lowest" | "low" | "medium" | "high" | "highest";
export type TaskType = "task" | "bug" | "feature" | "story" | "epic";

export interface Task {
  _id: string;
  projectId: { _id: string; name?: string; key?: string } | string;
  workspaceId: string;
  taskNumber: number;
  key: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  reporterId: { _id: string; name?: string; email: string } | string;
  assigneeId?: { _id: string; name?: string; email: string } | string;
  parentTaskId?: { _id: string; key: string; title: string; status: TaskStatus } | string;
  labels?: string[];
  storyPoints?: number;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const createTask = async (
  projectId: string,
  data: {
    title: string;
    description?: string;
    type?: TaskType;
    priority?: TaskPriority;
    assigneeId?: string;
    parentTaskId?: string;
    labels?: string[];
    storyPoints?: number;
    dueDate?: string;
  }
) => {
  const response = await client.post(`/task/project/${projectId}/tasks`, data);
  return response.data.data as Task;
};

export const getProjectTasks = async (
  projectId: string,
  params?: {
    status?: TaskStatus;
    assigneeId?: string;
    type?: TaskType;
    priority?: TaskPriority;
    parentTaskId?: string | null;
  }
) => {
  const response = await client.get(`/task/project/${projectId}/tasks`, {
    params: params
      ? {
          ...params,
          parentTaskId: params.parentTaskId === null ? "null" : params.parentTaskId,
        }
      : undefined,
  });
  return response.data.data as Task[];
};

export const getTaskById = async (taskId: string) => {
  const response = await client.get(`/task/${taskId}`);
  return response.data.data as Task;
};

export const updateTask = async (taskId: string, data: Partial<Omit<Task, "_id">>) => {
  const response = await client.patch(`/task/${taskId}`, data);
  return response.data.data as Task;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  const response = await client.patch(`/task/${taskId}/status`, { status });
  return response.data.data as Task;
};

export const assignTask = async (taskId: string, assigneeId: string) => {
  const response = await client.post(`/task/${taskId}/assign`, { assigneeId });
  return response.data.data as Task;
};

export const unassignTask = async (taskId: string) => {
  const response = await client.post(`/task/${taskId}/unassign`);
  return response.data.data as Task;
};

export const deleteTask = async (taskId: string) => {
  await client.delete(`/task/${taskId}`);
};

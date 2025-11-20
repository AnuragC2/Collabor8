import { Router } from "express";
import { TaskController } from "./task.controller.js";
import { requireAuth } from '../auth/auth.middleware.js'
import { requireWorkspaceMember } from "../workspace/workspace.middleware.js";
import { requireProjectMember } from "../project/project.middleware.js";

const taskRoutes = Router();
const controller = new TaskController();

taskRoutes.use(requireAuth);

// Create task in project
taskRoutes.post(
  "/project/:projectId/tasks",
  requireProjectMember,
  controller.createTask
);

// Get project tasks
taskRoutes.get(
  "/project/:projectId/tasks",
  requireProjectMember,
  controller.getProjectTasks
);

// Get project task stats
taskRoutes.get(
  "/project/:projectId/tasks/stats",
  requireProjectMember,
  controller.getTaskStats
);

// Get user's assigned tasks in workspace
taskRoutes.get(
  "/workspace/:workspaceId/my-tasks",
  requireWorkspaceMember,
  controller.getMyTasks
);

// Get user's reported tasks in workspace
taskRoutes.get(
  "/workspace/:workspaceId/reported-tasks",
  requireWorkspaceMember,
  controller.getReportedTasks
);

// Search tasks in workspace
taskRoutes.get(
  "/workspace/:workspaceId/search",
  requireWorkspaceMember,
  controller.searchTasks
);

// Get task by ID
taskRoutes.get("/:taskId", controller.getTask);

// Get task by key (e.g., PROJ-123)
taskRoutes.get("/key/:key", controller.getTaskByKey);

// Get subtasks
taskRoutes.get("/:taskId/subtasks", controller.getSubtasks);

// Update task
taskRoutes.patch("/:taskId", controller.updateTask);

// Update task status
taskRoutes.patch("/:taskId/status", controller.updateTaskStatus);

// Assign task
taskRoutes.post("/:taskId/assign", controller.assignTask);

// Unassign task
taskRoutes.post("/:taskId/unassign", controller.unassignTask);

// Delete task
taskRoutes.delete("/:taskId", controller.deleteTask);

export default taskRoutes;
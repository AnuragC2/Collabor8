import { Router } from "express";
import { ProjectController } from "./project.controller.js";
import { requireAuth } from '../auth/auth.middleware.js'
import { requireWorkspaceMember } from "../workspace/workspace.middleware.js";
import { requireProjectLead, requireProjectMember } from "./project.middleware.js";

const projectRoutes = Router();
const controller = new ProjectController();

projectRoutes.use(requireAuth);

// Workspace-level project routes
projectRoutes.post(
  "/workspace/:workspaceId/projects",
  requireWorkspaceMember,
  controller.createProject
);

projectRoutes.get(
  "/workspace/:workspaceId/projects",
  requireWorkspaceMember,
  controller.getWorkspaceProjects
);

projectRoutes.get(
  "/workspace/:workspaceId/projects/my-projects",
  requireWorkspaceMember,
  controller.getUserProjects
);

// Individual project routes
projectRoutes.get(
  "/:projectId",
  requireProjectMember,
  controller.getProject
);

projectRoutes.patch(
  "/:projectId",
  requireProjectLead,
  controller.updateProject
);

projectRoutes.post(
  "/:projectId/archive",
  requireProjectLead,
  controller.archiveProject
);

projectRoutes.delete(
  "/:projectId",
  requireProjectLead,
  controller.deleteProject
);

// Project member management
projectRoutes.post(
  "/:projectId/members",
  requireProjectLead,
  controller.addMember
);

projectRoutes.delete(
  "/:projectId/members/:memberId",
  requireProjectMember,
  controller.removeMember
);

projectRoutes.patch(
  "/:projectId/members/:memberId/role",
  requireProjectLead,
  controller.updateMemberRole
);

export default projectRoutes;

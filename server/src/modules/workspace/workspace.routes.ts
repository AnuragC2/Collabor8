import { Router } from 'express';
import { WorkspaceController } from './workspace.controller.js';
import { requireAuth } from '../auth/auth.middleware.js'
import { requireWorkspaceMember, requireWorkspaceRole } from './workspace.middleware.js';
import { WorkspaceRole } from './workspace.workspaceRole.js';

const workspaceroutes = Router();
const controller = new WorkspaceController();

// All routes require authentication
workspaceroutes.use(requireAuth);


// Invite management
workspaceroutes.post(
  "/:workspaceId/invites",
  requireWorkspaceRole(WorkspaceRole.Owner, WorkspaceRole.Admin),
  controller.createInvite
);

workspaceroutes.get(
  "/:workspaceId/invites",
  requireWorkspaceRole(WorkspaceRole.Owner, WorkspaceRole.Admin),
  controller.listInvites
);

workspaceroutes.post("/invites/accept", controller.acceptInvite);

workspaceroutes.post(
  "/:workspaceId/invites/:inviteId/revoke",
  requireWorkspaceRole(WorkspaceRole.Owner, WorkspaceRole.Admin),
  controller.revokeInvite
);

// Create workspace
workspaceroutes.post("/", controller.createWorkspace);

// Get user's workspaces
workspaceroutes.get("/my-workspaces", controller.getUserWorkspaces);

// Get workspace by slug
workspaceroutes.get("/slug/:slug", controller.getWorkspaceBySlug);

// Get workspace by ID
workspaceroutes.get("/:workspaceId", requireWorkspaceMember, controller.getWorkspace);

// Update workspace (owner/admin only)
workspaceroutes.patch(
  "/:workspaceId",
  requireWorkspaceRole(WorkspaceRole.Owner, WorkspaceRole.Admin),
  controller.updateWorkspace
);

// Delete workspace (owner only)
workspaceroutes.delete(
  "/:workspaceId",
  requireWorkspaceRole(WorkspaceRole.Owner),
  controller.deleteWorkspace
);

// Member management
workspaceroutes.post(
  "/:workspaceId/members",
  requireWorkspaceRole(WorkspaceRole.Owner, WorkspaceRole.Admin),
  controller.addMember
);

workspaceroutes.delete(
  "/:workspaceId/members/:memberId",
  requireWorkspaceMember,
  controller.removeMember
);

workspaceroutes.patch(
  "/:workspaceId/members/:memberId/role",
  requireWorkspaceRole(WorkspaceRole.Owner, WorkspaceRole.Admin),
  controller.updateMemberRole
);

export default workspaceroutes;

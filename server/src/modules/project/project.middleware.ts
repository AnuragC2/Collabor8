import { Request, Response, NextFunction } from "express";
import { ProjectService } from "./project.service.js";
import { AppError } from "../../core/errors/AppError.js";
import { projectIdParamsSchema } from "./project.schemas.js";

export const requireProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = projectIdParamsSchema.parse(req.params);
    const userId = req.user!.id.toString();

    const projectService = new ProjectService();
    
    // This will verify workspace membership and project access
    await projectService.verifyProjectAccess(projectId, userId);

    // Attach project role to request
    const role = await projectService.getMemberRole(projectId, userId);
    req.projectRole = role || undefined;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = projectIdParamsSchema.parse(req.params);
    const userId = req.user!.id.toString();

    const projectService = new ProjectService();
    const role = await projectService.getMemberRole(projectId, userId);

    if (role !== "lead") {
      // Check if workspace owner/admin
      const project = await projectService.getProjectById(projectId, userId);
      const workspaceService = new (await import("../workspace/workspace.service.js")).WorkspaceService();
      const workspaceRole = await workspaceService.getMemberRole(
        project.workspaceId.toString(),
        userId
      );

      const { WorkspaceRole } = await import("../workspace/workspace.workspaceRole.js");
      if (
        workspaceRole !== WorkspaceRole.Owner &&
        workspaceRole !== WorkspaceRole.Admin
      ) {
        throw AppError.forbidden(
          "Only project lead or workspace owner/admin can perform this action"
        );
      }
    }

    req.projectRole = role || undefined;
    next();
  } catch (error) {
    next(error);
  }
};

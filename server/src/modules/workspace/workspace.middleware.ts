import { Request, Response, NextFunction } from "express";
import { WorkspaceService } from "./workspace.service.js";
import { WorkspaceRole } from "./workspace.workspaceRole.js";
import { UserRole } from "../user/user.types.js";
import { AppError } from "../../core/errors/AppError.js";

export const requireWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user!.id.toString();

    // System admins bypass workspace checks
    if (req.user!.role === UserRole.Admin) {
      return next();
    }

    const workspaceService = new WorkspaceService();
    if (workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
    await workspaceService.verifyMembership(workspaceId, userId);

    // Attach workspace role to request
    const role = await workspaceService.getMemberRole(workspaceId, userId);
    req.workspaceRole = role!;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireWorkspaceRole = (...allowedRoles: WorkspaceRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.id.toString();

      // System admins bypass workspace checks
      if (req.user!.role === UserRole.Admin) {
        return next();
      }

      const workspaceService = new WorkspaceService();
      if (workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
      const role = await workspaceService.getMemberRole(workspaceId, userId);

      if (!role || !allowedRoles.includes(role)) {
        throw AppError.forbidden("Insufficient workspace permissions");
      }

      req.workspaceRole = role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service.js';
import { WorkspaceRole } from './workspace.workspaceRole.js';

export class WorkspaceController {
  private service: WorkspaceService;

  constructor() {
    this.service = new WorkspaceService();
  }

  createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, description } = req.body;
      const ownerId = req.user!.id;

      const workspace = await this.service.createWorkspace({
        name,
        slug,
        description,
        ownerId
      });

      res.status(201).json({
        success: true,
        data: workspace,
        message: "Workspace created successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const workspace = await this.service.getWorkspaceById(workspaceId);

      res.status(200).json({
        success: true,
        data: workspace
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkspaceBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const workspace = await this.service.getWorkspaceBySlug(slug);

      res.status(200).json({
        success: true,
        data: workspace
      });
    } catch (error) {
      next(error);
    }
  };

  getUserWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id.toString();
      const workspaces = await this.service.getUserWorkspaces(userId);

      res.status(200).json({
        success: true,
        data: workspaces,
        count: workspaces.length
      });
    } catch (error) {
      next(error);
    }
  };

  updateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.id.toString();
      const updateData = req.body;

      const workspace = await this.service.updateWorkspace(
        updateData,
        workspaceId,
        userId
      );

      res.status(200).json({
        success: true,
        data: workspace,
        message: "Workspace updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { userId, role } = req.body;
      const requesterId = req.user!.id.toString();

      const workspace = await this.service.addMember(workspaceId, requesterId, {
        userId,
        role: role || WorkspaceRole.Member
      });

      res.status(200).json({
        success: true,
        data: workspace,
        message: "Member added successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId, memberId } = req.params;
      const requesterId = req.user!.id.toString();

      const workspace = await this.service.removeMember(
        workspaceId,
        requesterId,
        memberId
      );

      res.status(200).json({
        success: true,
        data: workspace,
        message: "Member removed successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId, memberId } = req.params;
      const { role } = req.body;
      const requesterId = req.user!.id.toString();

      const workspace = await this.service.updateMemberRole(
        workspaceId,
        requesterId,
        memberId,
        role
      );

      res.status(200).json({
        success: true,
        data: workspace,
        message: "Member role updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.id.toString();

      await this.service.deleteWorkspace(workspaceId, userId);

      res.status(200).json({
        success: true,
        message: "Workspace deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  };
}
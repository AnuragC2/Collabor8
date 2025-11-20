import { Request, Response, NextFunction } from "express";
import { ProjectStatus } from "./project.projectStatus.js";
import { ProjectService } from "./project.service.js";
import { addMemberParamsSchema, createProjectParamsSchema, projectIdParamsSchema, removeMemberParamsSchema } from "./project.schemas.js";

export class ProjectController {
  private service: ProjectService;

  constructor() {
    this.service = new ProjectService();
  }

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = createProjectParamsSchema.parse(req.params);
      const { name, key, description, leadId, visibility, startDate, targetEndDate } = req.body;
      const creatorId = req.user!.id.toString();
      
      const project = await this.service.createProject(
        {
          workspaceId,
          name,
          key,
          description,
          leadId: leadId || req.user!.id,
          visibility,
          startDate,
          targetEndDate
        },
        creatorId
      );

      res.status(201).json({
        success: true,
        data: project,
        message: "Project created successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  getProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = projectIdParamsSchema.parse(req.params);
      const userId = req.user!.id.toString();

      const project = await this.service.getProjectById(projectId, userId);

      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkspaceProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = createProjectParamsSchema.parse(req.params);
      const userId = req.user!.id.toString();
      const { status, visibility } = req.query;

      const projects = await this.service.getWorkspaceProjects(
        workspaceId,
        userId,
        {
          status: status as ProjectStatus,
          visibility: visibility as "public" | "private"
        }
      );

      res.status(200).json({
        success: true,
        data: projects,
        count: projects.length
      });
    } catch (error) {
      next(error);
    }
  };

  getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = createProjectParamsSchema.parse(req.params);
      const userId = req.user!.id.toString();

      const projects = await this.service.getUserProjectsInWorkspace(workspaceId, userId);

      res.status(200).json({
        success: true,
        data: projects,
        count: projects.length
      });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = projectIdParamsSchema.parse(req.params);
      const userId = req.user!.id.toString();
      const updateData = req.body;

      const project = await this.service.updateProject(projectId, userId, updateData);

      res.status(200).json({
        success: true,
        data: project,
        message: "Project updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = addMemberParamsSchema.parse(req.params);
      const { userId, role } = req.body;
      const requesterId = req.user!.id.toString();

      const project = await this.service.addMember(projectId, requesterId, {
        userId,
        role: role || "member"
      });

      res.status(200).json({
        success: true,
        data: project,
        message: "Member added successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, memberId } = removeMemberParamsSchema.parse(req.params);
      const requesterId = req.user!.id.toString();
      
      const project = await this.service.removeMember(projectId, requesterId, memberId);

      res.status(200).json({
        success: true,
        data: project,
        message: "Member removed successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, memberId } = removeMemberParamsSchema.parse(req.params);
      const { role } = req.body;
      const requesterId = req.user!.id.toString();

      const project = await this.service.updateMemberRole(
        projectId,
        requesterId,
        memberId,
        role
      );

      res.status(200).json({
        success: true,
        data: project,
        message: "Member role updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  archiveProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = projectIdParamsSchema.parse(req.params);
      const userId = req.user!.id.toString();

      const project = await this.service.archiveProject(projectId, userId);

      res.status(200).json({
        success: true,
        data: project,
        message: "Project archived successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = projectIdParamsSchema.parse(req.params);
      const userId = req.user!.id.toString();

      await this.service.deleteProject(projectId, userId);

      res.status(200).json({
        success: true,
        message: "Project deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  };
}
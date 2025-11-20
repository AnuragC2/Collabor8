import { ProjectRepository } from "./project.repository.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import { IProject } from "./project.IProject.js";
import { ProjectStatus } from "./project.projectStatus.js";
import { WorkspaceRole } from "../workspace/workspace.workspaceRole.js";
import { AppError } from "../../core/errors/AppError.js";
import { Schema } from 'mongoose';

export interface CreateProjectDTO {
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  leadId: Schema.Types.ObjectId;
  visibility?: "public" | "private";
  startDate?: Date;
  targetEndDate?: Date;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: "public" | "private";
  startDate?: Date;
  targetEndDate?: Date;
}

export interface AddProjectMemberDTO {
  userId: Schema.Types.ObjectId;
  role?: "lead" | "member";
}

export class ProjectService {
  private repository: ProjectRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.repository = new ProjectRepository();
    this.workspaceService = new WorkspaceService();
  }

  async createProject(data?: CreateProjectDTO, creatorId?: string): Promise<IProject> {
    // Verify creator is workspace member
    if(data == null || data == undefined) {
        throw AppError.badRequest("data cannot be null");
    }
    
    if (creatorId == null || creatorId == undefined) {
        throw AppError.badRequest("creatorId cannot be null");
    }
    await this.workspaceService.verifyMembership(
      data.workspaceId.toString(),
      creatorId
    );

    // Verify creator has permission (owner/admin can create projects)
    const workspaceRole = await this.workspaceService.getMemberRole(
      data.workspaceId.toString(),
      creatorId
    );

    if (
      workspaceRole !== WorkspaceRole.Owner &&
      workspaceRole !== WorkspaceRole.Admin
    ) {
      throw AppError.forbidden("Only workspace owners and admins can create projects");
    }

    // Check if project key already exists in workspace
    const existing = await this.repository.findByKey(
      data.key.toUpperCase(),
      data.workspaceId
    );
    if (existing) {
      throw AppError.badRequest("Project key already exists in this workspace");
    }

    // Verify lead is workspace member
    await this.workspaceService.verifyMembership(
      data.workspaceId.toString(),
      data.leadId.toString()
    );

    const wid = new Schema.Types.ObjectId(data.workspaceId);
    const project = await this.repository.create({
      ...data,
      workspaceId: wid,
      key: data.key.toUpperCase(),
      status: ProjectStatus.PLANNING,
      members: []
    });

    return project;
  }

  async getProjectById(projectId: string, userId: string): Promise<IProject> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    // Verify user has access to project
    await this.verifyProjectAccess(projectId, userId);

    return project;
  }

  async getWorkspaceProjects(
    workspaceId: string,
    userId: string,
    options?: {
      status?: ProjectStatus;
      visibility?: "public" | "private";
    }
  ): Promise<IProject[]> {
    // Verify user is workspace member
    await this.workspaceService.verifyMembership(workspaceId, userId);

    // Get user's projects (including public ones)
    return await this.repository.findUserProjects(workspaceId, userId);
  }

  async getUserProjectsInWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<IProject[]> {
    await this.workspaceService.verifyMembership(workspaceId, userId);
    return await this.repository.findUserProjects(workspaceId, userId);
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectDTO
  ): Promise<IProject> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    // Verify user can update project (lead, workspace owner/admin)
    await this.verifyProjectEditAccess(projectId, userId, project.workspaceId.toString());

    const updatedProject = await this.repository.update(projectId, data);
    if (!updatedProject) {
      throw AppError.notFound("Project not found");
    }

    return updatedProject;
  }

  async addMember(
    projectId: string,
    requesterId: string,
    memberData: AddProjectMemberDTO
  ): Promise<IProject> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    // Verify requester can add members
    await this.verifyProjectEditAccess(
      projectId,
      requesterId,
      project.workspaceId.toString()
    );

    // Verify new member is in workspace
    await this.workspaceService.verifyMembership(
      project.workspaceId.toString(),
      memberData.userId.toString()
    );

    // Check if already a member
    const isMember = await this.repository.isMember(projectId, memberData.userId);
    if (isMember) {
      throw AppError.badRequest("User is already a project member");
    }

    const updatedProject = await this.repository.addMember(
      projectId,
      memberData.userId,
      memberData.role || "member"
    );

    if (!updatedProject) {
      throw AppError.notFound("Project not found");
    }

    return updatedProject;
  }

  async removeMember(
    projectId: string,
    requesterId: string,
    memberIdToRemove: string
  ): Promise<IProject> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    // Can't remove project lead
    if (project.leadId.toString() === memberIdToRemove) {
      throw AppError.badRequest("Cannot remove project lead. Transfer lead role first.");
    }

    // Verify requester can remove members OR user is removing themselves
    const canRemove =
      requesterId === memberIdToRemove ||
      (await this.hasProjectEditAccess(
        projectId,
        requesterId,
        project.workspaceId.toString()
      ));

    if (!canRemove) {
      throw AppError.forbidden("Insufficient permissions to remove member");
    }

    const updatedProject = await this.repository.removeMember(projectId, memberIdToRemove);
    if (!updatedProject) {
      throw AppError.notFound("Project not found");
    }

    return updatedProject;
  }

  async updateMemberRole(
    projectId: string,
    requesterId: string,
    memberId: string,
    newRole: "lead" | "member"
  ): Promise<IProject> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    await this.verifyProjectEditAccess(
      projectId,
      requesterId,
      project.workspaceId.toString()
    );

    // If promoting to lead, demote current lead
    if (newRole === "lead" && project.leadId.toString() !== memberId) {
      throw AppError.badRequest(
        "To change project lead, update the leadId in project settings"
      );
    }

    const updatedProject = await this.repository.updateMemberRole(
      projectId,
      memberId,
      newRole
    );

    if (!updatedProject) {
      throw AppError.notFound("Member not found in project");
    }

    return updatedProject;
  }

  async archiveProject(projectId: string, userId: string): Promise<IProject> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    await this.verifyProjectEditAccess(
      projectId,
      userId,
      project.workspaceId.toString()
    );

    const archivedProject = await this.repository.archive(projectId);
    if (!archivedProject) {
      throw AppError.notFound("Project not found");
    }

    return archivedProject;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    // Only workspace owner or project lead can delete
    const workspaceRole = await this.workspaceService.getMemberRole(
      project.workspaceId.toString(),
      userId
    );

    const isLead = project.leadId.toString() === userId;
    const canDelete =
      workspaceRole === WorkspaceRole.Owner ||
      (workspaceRole === WorkspaceRole.Admin && isLead);

    if (!canDelete) {
      throw AppError.forbidden("Only workspace owner or project lead can delete project");
    }

    await this.repository.delete(projectId);
  }

  // Helper: Verify user has access to view project
  async verifyProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found");
    }

    // Verify user is workspace member
    await this.workspaceService.verifyMembership(
      project.workspaceId.toString(),
      userId
    );

    // If private, must be project member
    if (project.visibility === "private") {
      const isMember = await this.repository.isMember(projectId, userId);
      const workspaceRole = await this.workspaceService.getMemberRole(
        project.workspaceId.toString(),
        userId
      );

      if (!isMember && workspaceRole !== WorkspaceRole.Owner && workspaceRole !== WorkspaceRole.Admin) {
        throw AppError.forbidden("You don't have access to this private project");
      }
    }
  }

  // Helper: Check if user can edit project
  async hasProjectEditAccess(
    projectId: string,
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    const workspaceRole = await this.workspaceService.getMemberRole(workspaceId, userId);
    
    // Workspace owner/admin can edit
    if (
      workspaceRole === WorkspaceRole.Owner ||
      workspaceRole === WorkspaceRole.Admin
    ) {
      return true;
    }

    // Project lead can edit
    const projectRole = await this.repository.getMemberRole(projectId, userId);
    return projectRole === "lead";
  }

  // Helper: Verify user can edit project (throws error)
  async verifyProjectEditAccess(
    projectId: string,
    userId: string,
    workspaceId: string
  ): Promise<void> {
    const hasAccess = await this.hasProjectEditAccess(projectId, userId, workspaceId);
    if (!hasAccess) {
      throw AppError.forbidden(
        "Only workspace owners/admins or project lead can perform this action"
      );
    }
  }

  async getMemberRole(
    projectId: string,
    userId: string
  ): Promise<"lead" | "member" | null> {
    return await this.repository.getMemberRole(projectId, userId);
  }
}
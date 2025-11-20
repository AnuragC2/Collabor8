import { Schema } from 'mongoose';
import { AppError } from '../../core/errors/AppError.js';
import { WorkspaceRepository } from './workspace.repository.js';
import { WorkspaceRole } from './workspace.workspaceRole.js';
import { IWorkspace } from './workspace.IWorkspace.js';

export interface CreateWorkspaceDTO {
  name: string;
  slug: string;
  description: string;
  ownerId: Schema.Types.ObjectId;
}

export interface UpdateWorkspaceDTO {
  name?: string;
  description?: string;
  settings?: {
    allowGuestAccess?: boolean;
    defaultProjectVisibility?: "public" | "private";
  };
}

export interface AddMemberDTO {
  userId: Schema.Types.ObjectId;
  role: WorkspaceRole;
}

export class WorkspaceService {
  private repository: WorkspaceRepository;

  constructor() {
    this.repository = new WorkspaceRepository();
  }

  async createWorkspace(data: CreateWorkspaceDTO): Promise<IWorkspace> {
    // Check if slug already exists
    const existing = await this.repository.findBySlug(data.slug);
    if (existing) {
      throw AppError.badRequest("Workspace slug already exists");
    }

    // Create workspace with owner as first member
    const workspace = await this.repository.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      ownerId: data.ownerId,
      members: [],
      settings: {
        allowGuestAccess: false,
        defaultProjectVisibility: "private"
      },
      isActive: true
    });

    return workspace;
  }

  async getWorkspaceById(workspaceId?: string): Promise<IWorkspace> {
    if (workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("Workspace Id cannot be null");
    }
    const workspace = await this.repository.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound("Workspace not found");
    }
    return workspace;
  }

  async getWorkspaceBySlug(slug?: string): Promise<IWorkspace> {
    
    if(slug == null || slug == undefined) {
        throw AppError.badRequest("slug cannot be null")
    }
    const workspace = await this.repository.findBySlug(slug);
    if (!workspace) {
      throw AppError.notFound("Workspace not found");
    }
    return workspace;
  }

  async getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
    return await this.repository.findByUserId(userId);
  }

  async updateWorkspace(
    data?: UpdateWorkspaceDTO,
    workspaceId?: string,
    userId?: string
  ): Promise<IWorkspace> {

    if(workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest('workspaceId cannot be null');
    }
    if(userId == null || userId == undefined) {
        throw AppError.badRequest('workspaceId cannot be null');
    }
    if(data == null || data == undefined) {
        throw AppError.badRequest('workspaceId cannot be null');
    }
    await this.verifyOwnerOrAdmin(workspaceId, userId);
    
    const workspace = await this.repository.update(workspaceId, data);
    if (!workspace) {
      throw AppError.notFound("Workspace not found");
    }
    return workspace;
  }

  async addMember(
    workspaceId?: string,
    requesterId?: string,
    memberData?: AddMemberDTO
  ): Promise<IWorkspace> {

    if(workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
    if(requesterId == null || requesterId == undefined) {
        throw AppError.badRequest("requesterId cannot be null");
    }
    if(memberData == null || memberData == undefined) {
        throw AppError.badRequest("memberData cannot be null");
    }
    await this.verifyOwnerOrAdmin(workspaceId, requesterId);

    // Check if user is already a member
    const isMember = await this.repository.isMember(workspaceId, memberData.userId);
    if (isMember) {
      throw AppError.badRequest("User is already a member of this workspace");
    }

    const workspace = await this.repository.addMember(
      workspaceId,
      memberData.userId,
      memberData.role
    );

    if (!workspace) {
      throw AppError.notFound("Workspace not found");
    }

    return workspace;
  }

  async removeMember(
    workspaceId?: string,
    requesterId?: string,
    memberIdToRemove?: string
  ): Promise<IWorkspace> {

    if(workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
    if(requesterId == null || requesterId == undefined) {
        throw AppError.badRequest("requesterId cannot be null");
    }
    if(memberIdToRemove == null || memberIdToRemove == undefined) {
        throw AppError.badRequest("memberIdToRemove cannot be null");
    }
    const workspace = await this.getWorkspaceById(workspaceId);

    // Can't remove the owner
    if (workspace.ownerId.toString() === memberIdToRemove) {
      throw AppError.badRequest("Cannot remove workspace owner");
    }

    // Only owner/admin can remove members, or users can remove themselves
    const requesterRole = await this.repository.getMemberRole(workspaceId, requesterId);
    const canRemove =
      requesterRole === WorkspaceRole.Owner ||
      requesterRole === WorkspaceRole.Admin ||
      requesterId === memberIdToRemove;

    if (!canRemove) {
      throw AppError.forbidden("Insufficient permissions to remove member");
    }

    const updatedWorkspace = await this.repository.removeMember(workspaceId, memberIdToRemove);
    if (!updatedWorkspace) {
      throw AppError.notFound("Workspace not found");
    }

    return updatedWorkspace;
  }

  async updateMemberRole(
    workspaceId?: string,
    requesterId?: string,
    memberId?: string,
    newRole?: WorkspaceRole
  ): Promise<IWorkspace> {

    if(workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
    if(requesterId == null || requesterId == undefined) {
        throw AppError.badRequest("requesterId cannot be null");
    }
    if(memberId == null || memberId == undefined) {
        throw AppError.badRequest("memberId cannot be null");
    }
    if(newRole == null || newRole == undefined) {
        throw AppError.badRequest("memberId cannot be null");
    }

    await this.verifyOwnerOrAdmin(workspaceId, requesterId);

    const workspace = await this.getWorkspaceById(workspaceId);

    // Can't change owner's role
    if (workspace.ownerId.toString() === memberId) {
      throw AppError.badRequest("Cannot change owner's role");
    }

    // Can't promote to owner
    if (newRole === WorkspaceRole.Owner) {
      throw AppError.badRequest("Cannot assign owner role to members");
    }

    const updatedWorkspace = await this.repository.updateMemberRole(
      workspaceId,
      memberId,
      newRole
    );

    if (!updatedWorkspace) {
      throw AppError.notFound("Member not found in workspace");
    }

    return updatedWorkspace;
  }

  async deleteWorkspace(workspaceId?: string, userId?: string): Promise<void> {

    if(workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest('workspaceId cannnot be null');
    }
    const workspace = await this.getWorkspaceById(workspaceId);

    // Only owner can delete workspace
    if (workspace.ownerId.toString() !== userId) {
      throw AppError.forbidden("Only workspace owner can delete workspace");
    }

    await this.repository.softDelete(workspaceId);
  }

  async verifyMembership(workspaceId: string, userId: string): Promise<void> {
    const isMember = await this.repository.isMember(workspaceId, userId);
    if (!isMember) {
      throw AppError.forbidden("You are not a member of this workspace");
    }
  }

  async verifyOwnerOrAdmin(workspaceId: string, userId: string): Promise<void> {
    const role = await this.repository.getMemberRole(workspaceId, userId);
    if (role !== WorkspaceRole.Owner && role !== WorkspaceRole.Admin) {
      throw AppError.forbidden("Only workspace owner or admin can perform this action");
    }
  }

  async getMemberRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    return await this.repository.getMemberRole(workspaceId, userId);
  }
}
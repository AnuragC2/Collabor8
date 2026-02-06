import { Schema, Types } from "mongoose";
import { AppError } from '../../core/errors/AppError.js';
import { WorkspaceRepository } from './workspace.repository.js';
import { WorkspaceRole } from './workspace.workspaceRole.js';
import { IWorkspace } from './workspace.IWorkspace.js';
import { UserRepository } from '../user/user.repository.js';
import { ProjectRepository } from '../project/project.repository.js';
import { TaskRepository } from '../task/task.repository.js';
import { CommentRepository } from '../comment/comment.repository.js';
import { getObjectIdString } from "../../utils/id.ts";
import { WorkspaceInviteRepository } from '../workspaceInvite/workspaceInvite.repository.js';
import { IWorkspaceInvite } from '../workspaceInvite/workspaceInvite.IWorkspaceInvite.js';
import { randomBytes } from 'crypto';

export interface CreateWorkspaceDTO {
  name: string;
  slug: string;
  description: string;
  ownerId: Schema.Types.ObjectId;
}

interface AddMemberByEmailDTO {
    email: string;
    role: WorkspaceRole;
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
  private userRepository: UserRepository;
  private projectRepository: ProjectRepository;
  private taskRepository: TaskRepository;
  private commentRepository: CommentRepository;
  private inviteRepository: WorkspaceInviteRepository;

  constructor() {
    this.repository = new WorkspaceRepository();
    this.userRepository = new UserRepository();
    this.projectRepository = new ProjectRepository();
    this.taskRepository = new TaskRepository();
    this.commentRepository = new CommentRepository();
    this.inviteRepository = new WorkspaceInviteRepository();
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
    workspaceId ? : string,
    requesterId ? : string,
    memberData ? : AddMemberByEmailDTO
): Promise < IWorkspace > {

    if (workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
    if (requesterId == null || requesterId == undefined) {
        throw AppError.badRequest("requesterId cannot be null");
    }
    if (memberData == null || memberData == undefined) {
        throw AppError.badRequest("memberData cannot be null");
    }
    if (!memberData.email) {
        throw AppError.badRequest("email cannot be null");
    }

    await this.verifyOwnerOrAdmin(workspaceId, requesterId);

    // Find user by email
    const user = await this.userRepository.findByEmail(memberData.email);
    if (!user) {
        throw AppError.notFound(`User with email ${memberData.email} not found`);
    }

    // Check if user is already a member
    const isMember = await this.repository.isMember(workspaceId, user._id.toString());
    if (isMember) {
        throw AppError.badRequest("User is already a member of this workspace");
    }

    const workspace = await this.repository.addMember(
        workspaceId,
        user._id.toString(),
        memberData.role
    );

    if (!workspace) {
        throw AppError.notFound("Workspace not found");
    }

    return workspace;
}

async removeMember(
    workspaceId ? : string,
    requesterId ? : string,
    memberIdToRemove ? : string
): Promise < IWorkspace > {

    if (workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
    if (requesterId == null || requesterId == undefined) {
        throw AppError.badRequest("requesterId cannot be null");
    }
    if (memberIdToRemove == null || memberIdToRemove == undefined) {
        throw AppError.badRequest("memberIdToRemove cannot be null");
    }
    const workspace = await this.getWorkspaceById(workspaceId);

    // Can't remove the owner
    if (getObjectIdString(workspace.ownerId) === memberIdToRemove) {
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
    workspaceId ? : string,
    requesterId ? : string,
    memberId ? : string,
    newRole ? : WorkspaceRole
): Promise < IWorkspace > {

    if (workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest("workspaceId cannot be null");
    }
    if (requesterId == null || requesterId == undefined) {
        throw AppError.badRequest("requesterId cannot be null");
    }
    if (memberId == null || memberId == undefined) {
        throw AppError.badRequest("memberId cannot be null");
    }
    if (newRole == null || newRole == undefined) {
        throw AppError.badRequest("newRole cannot be null");
    }

    await this.verifyOwnerOrAdmin(workspaceId, requesterId);

    const workspace = await this.getWorkspaceById(workspaceId);

    // Can't change owner's role
    if (getObjectIdString(workspace.ownerId) === memberId) {
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



  async createInvite(
    workspaceId?: string,
    requesterId?: string,
    email?: string,
    role?: WorkspaceRole
  ): Promise<IWorkspaceInvite> {
    if (workspaceId == null || workspaceId == undefined) {
      throw AppError.badRequest("workspaceId cannot be null");
    }
    if (requesterId == null || requesterId == undefined) {
      throw AppError.badRequest("requesterId cannot be null");
    }
    if (!email || email.trim().length === 0) {
      throw AppError.badRequest("email cannot be null");
    }

    await this.getWorkspaceById(workspaceId);
    await this.verifyOwnerOrAdmin(workspaceId, requesterId);

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw AppError.badRequest("Invalid email address");
    }

    if (role === WorkspaceRole.Owner) {
      throw AppError.badRequest("Cannot invite with owner role");
    }

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      const isMember = await this.repository.isMember(workspaceId, existingUser._id.toString());
      if (isMember) {
        throw AppError.badRequest("User is already a member of this workspace");
      }
    }

    const pendingInvite = await this.inviteRepository.findPendingByEmail(workspaceId, normalizedEmail);
    if (pendingInvite) {
      if (pendingInvite.expiresAt.getTime() > Date.now()) {
        throw AppError.badRequest("Invite already pending");
      }
      await this.inviteRepository.markExpired(pendingInvite._id);
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return await this.inviteRepository.create({
      workspaceId,
      email: normalizedEmail,
      role: role || WorkspaceRole.Member,
      invitedBy: requesterId,
      token,
      status: "pending",
      expiresAt
    });
  }

  async listInvites(
    workspaceId?: string,
    requesterId?: string,
    status?: string
  ): Promise<IWorkspaceInvite[]> {
    if (workspaceId == null || workspaceId == undefined) {
      throw AppError.badRequest("workspaceId cannot be null");
    }
    if (requesterId == null || requesterId == undefined) {
      throw AppError.badRequest("requesterId cannot be null");
    }

    await this.verifyOwnerOrAdmin(workspaceId, requesterId);

    const allowedStatuses = ["pending", "accepted", "revoked", "expired"];
    if (status && !allowedStatuses.includes(status)) {
      throw AppError.badRequest("Invalid invite status");
    }

    return await this.inviteRepository.listByWorkspace(
      workspaceId,
      status as "pending" | "accepted" | "revoked" | "expired" | undefined
    );
  }

  async acceptInvite(token?: string, userId?: string): Promise<IWorkspace> {
    if (!token || token.trim().length === 0) {
      throw AppError.badRequest("Invite token is required");
    }
    if (userId == null || userId == undefined) {
      throw AppError.badRequest("userId cannot be null");
    }

    const invite = await this.inviteRepository.findByToken(token);
    if (!invite) {
      throw AppError.notFound("Invite not found");
    }

    if (invite.status !== "pending") {
      throw AppError.badRequest("Invite is no longer valid");
    }

    if (invite.expiresAt.getTime() <= Date.now()) {
      await this.inviteRepository.markExpired(invite._id);
      throw AppError.badRequest("Invite has expired");
    }

    const uid = new Types.ObjectId(userId);
    const user = await this.userRepository.findById(uid);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw AppError.forbidden("Invite email does not match your account");
    }

    const isMember = await this.repository.isMember(getObjectIdString(invite.workspaceId), user._id.toString());
    if (!isMember) {
      await this.repository.addMember(invite.workspaceId, user._id.toString(), invite.role);
    }

    await this.inviteRepository.markAccepted(invite._id, user._id.toString());

    const workspace = await this.repository.findById(invite.workspaceId);
    if (!workspace) {
      throw AppError.notFound("Workspace not found");
    }

    return workspace;
  }

  async revokeInvite(
    workspaceId?: string,
    requesterId?: string,
    inviteId?: string
  ): Promise<void> {
    if (workspaceId == null || workspaceId == undefined) {
      throw AppError.badRequest("workspaceId cannot be null");
    }
    if (requesterId == null || requesterId == undefined) {
      throw AppError.badRequest("requesterId cannot be null");
    }
    if (inviteId == null || inviteId == undefined) {
      throw AppError.badRequest("inviteId cannot be null");
    }

    await this.verifyOwnerOrAdmin(workspaceId, requesterId);

    const invite = await this.inviteRepository.findById(inviteId);
    if (!invite) {
      throw AppError.notFound("Invite not found");
    }

    if (getObjectIdString(invite.workspaceId) != workspaceId) {
      throw AppError.badRequest("Invite does not belong to this workspace");
    }

    if (invite.status !== "pending") {
      throw AppError.badRequest("Only pending invites can be revoked");
    }

    await this.inviteRepository.markRevoked(inviteId);
  }

// DTO interface


  async deleteWorkspace(workspaceId?: string, userId?: string): Promise<void> {

    if(workspaceId == null || workspaceId == undefined) {
        throw AppError.badRequest('workspaceId cannnot be null');
    }
    const workspace = await this.getWorkspaceById(workspaceId);
    
    const ownerIdString = getObjectIdString(workspace.ownerId);
    if (!ownerIdString) {
      throw AppError.notFound("Workspace owner not found.");
    }
    
    // Only owner can delete workspace
    if (ownerIdString !== userId) {
      throw AppError.forbidden("Only workspace owner can delete workspace");
    }

    await this.commentRepository.deleteByWorkspace(workspaceId);
    await this.taskRepository.deleteByWorkspace(workspaceId);
    await this.projectRepository.deleteByWorkspace(workspaceId);

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

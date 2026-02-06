import { Schema } from "mongoose";
import { WorkspaceInvite } from "./workspaceInvite.model.js";
import { IWorkspaceInvite } from "./workspaceInvite.IWorkspaceInvite.js";

export class WorkspaceInviteRepository {
  async create(data: Partial<IWorkspaceInvite>): Promise<IWorkspaceInvite> {
    const invite = new WorkspaceInvite(data);
    return await invite.save();
  }

  async findById(id: string | Schema.Types.ObjectId): Promise<IWorkspaceInvite | null> {
    return await WorkspaceInvite.findById(id)
      .populate("invitedBy", "name email")
      .populate("acceptedBy", "name email");
  }

  async findByToken(token: string): Promise<IWorkspaceInvite | null> {
    return await WorkspaceInvite.findOne({ token })
      .populate("invitedBy", "name email")
      .populate("acceptedBy", "name email");
  }

  async findPendingByEmail(
    workspaceId: string | Schema.Types.ObjectId,
    email: string
  ): Promise<IWorkspaceInvite | null> {
    return await WorkspaceInvite.findOne({
      workspaceId,
      email,
      status: "pending"
    });
  }

  async listByWorkspace(
    workspaceId: string | Schema.Types.ObjectId,
    status?: "pending" | "accepted" | "revoked" | "expired"
  ): Promise<IWorkspaceInvite[]> {
    const query: any = { workspaceId };
    if (status) query.status = status;

    return await WorkspaceInvite.find(query)
      .populate("invitedBy", "name email")
      .populate("acceptedBy", "name email")
      .sort({ createdAt: -1 });
  }

  async markAccepted(
    inviteId: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId
  ): Promise<IWorkspaceInvite | null> {
    return await WorkspaceInvite.findByIdAndUpdate(
      inviteId,
      {
        $set: {
          status: "accepted",
          acceptedBy: userId,
          acceptedAt: new Date()
        }
      },
      { new: true }
    );
  }

  async markRevoked(
    inviteId: string | Schema.Types.ObjectId
  ): Promise<IWorkspaceInvite | null> {
    return await WorkspaceInvite.findByIdAndUpdate(
      inviteId,
      {
        $set: {
          status: "revoked",
          revokedAt: new Date()
        }
      },
      { new: true }
    );
  }

  async markExpired(
    inviteId: string | Schema.Types.ObjectId
  ): Promise<IWorkspaceInvite | null> {
    return await WorkspaceInvite.findByIdAndUpdate(
      inviteId,
      { $set: { status: "expired" } },
      { new: true }
    );
  }
}

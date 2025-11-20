import { Schema } from 'mongoose';
import { Workspace } from './workspace.model.js';
import { IWorkspace } from './workspace.IWorkspace.js';
import { WorkspaceRole } from './workspace.workspaceRole.js';

export class WorkspaceRepository {
    async create(workspacedata : Partial<IWorkspace>): Promise<IWorkspace> {
        const workspace = new Workspace(workspacedata);
        await workspace.save();
        return workspace;
    }

    async findById(id: string | Schema.Types.ObjectId): Promise<IWorkspace | null> {
        return await Workspace.findById(id)
            .populate("ownerId", "name email")
            .populate("members.userId", "name email");
    }

    async findBySlug(slug: string): Promise<IWorkspace | null> {
        return await Workspace.findOne({ slug, isActive: true })
        .populate("ownerId", "name email")
        .populate("members.userId", "name email");
    }

    async findByUserId(userId: string | Schema.Types.ObjectId): Promise<IWorkspace[]> {
        return await Workspace.find({
        $or: [
            { ownerId: userId },
            { "members.userId": userId }
        ],
        isActive: true
        })
        .populate("ownerId", "name email")
        .sort({ updatedAt: -1 });
    }

    async update(
        id: string | Schema.Types.ObjectId,
        updateData: Partial<IWorkspace>
    ): Promise<IWorkspace | null> {
        return await Workspace.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
        ).populate("ownerId", "name email");
    }

    async addMember(
        workspaceId: string | Schema.Types.ObjectId,
        userId: string | Schema.Types.ObjectId,
        role: WorkspaceRole
    ): Promise<IWorkspace | null> {
        return await Workspace.findByIdAndUpdate(
        workspaceId,
        {
            $addToSet: {
            members: {
                userId,
                role,
                joinedAt: new Date()
            }
            }
        },
        { new: true }
        ).populate("members.userId", "name email");
    }

    async removeMember(
        workspaceId: string | Schema.Types.ObjectId,
        userId: string | Schema.Types.ObjectId
    ): Promise<IWorkspace | null> {
        return await Workspace.findByIdAndUpdate(
        workspaceId,
        {
            $pull: {
            members: { userId }
            }
        },
        { new: true }
        );
    }

    async updateMemberRole(
        workspaceId: string | Schema.Types.ObjectId,
        userId: string | Schema.Types.ObjectId,
        role: WorkspaceRole
    ): Promise<IWorkspace | null> {
        return await Workspace.findOneAndUpdate(
        { _id: workspaceId, "members.userId": userId },
        { $set: { "members.$.role": role } },
        { new: true }
        ).populate("members.userId", "name email");
    }

    async isMember(
        workspaceId: string | Schema.Types.ObjectId,
        userId: string | Schema.Types.ObjectId
    ): Promise<boolean> {
        const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [
            { ownerId: userId },
            { "members.userId": userId }
        ]
        });
        return !!workspace;
    }

    async getMemberRole(
        workspaceId: string | Schema.Types.ObjectId,
        userId: string | Schema.Types.ObjectId
    ): Promise<WorkspaceRole | null> {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return null;
        
        if (workspace.ownerId.toString() === (userId.toString())) {
        return WorkspaceRole.Owner;
        }

        const member = workspace.members.find(m => m.userId.toString() === (userId.toString()));
        return member?.role || null;
    }

    async softDelete(id: string | Schema.Types.ObjectId): Promise<IWorkspace | null> {
        return await Workspace.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
        );
    }
}
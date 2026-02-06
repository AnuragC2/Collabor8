import { Project } from "./project.model.js";
import { IProject } from "./project.IProject.js";
import { ProjectStatus } from "./project.projectStatus.js";
import { Schema } from 'mongoose';

export class ProjectRepository {
  async create(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return await project.save();
  }

  async findById(id: string | Schema.Types.ObjectId): Promise<IProject | null> {
    return await Project.findById(id)
      .populate("leadId", "name email")
      .populate("members.userId", "name email")
      .populate("workspaceId", "name slug");
  }

  async findByWorkspace(
    workspaceId: string | Schema.Types.ObjectId,
    options?: {
      status?: ProjectStatus;
      visibility?: "public" | "private";
    }
  ): Promise<IProject[]> {
    const query: any = { workspaceId };
    
    if (options?.status) {
      query.status = options.status;
    }
    
    if (options?.visibility) {
      query.visibility = options.visibility;
    }

    return await Project.find(query)
      .populate("leadId", "name email")
      .sort({ updatedAt: -1 });
  }

  async findByKey(
    key: string,
    workspaceId: string | Schema.Types.ObjectId
  ): Promise<IProject | null> {
    return await Project.findOne({ key, workspaceId })
      .populate("leadId", "name email")
      .populate("members.userId", "name email");
  }

  async findUserProjects(
    workspaceId: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId
  ): Promise<IProject[]> {
    return await Project.find({
      workspaceId,
      $or: [
        { leadId: userId },
        { "members.userId": userId },
        { visibility: "public" }
      ]
    })
      .populate("leadId", "name email")
      .sort({ updatedAt: -1 });
  }

  async update(
    id: string | Schema.Types.ObjectId,
    updateData: Partial<IProject>
  ): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("leadId", "name email")
      .populate("members.userId", "name email");
  }

  async addMember(
    projectId: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId,
    role: "lead" | "member"
  ): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
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
    projectId: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId
  ): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          members: { userId }
        }
      },
      { new: true }
    );
  }

  async updateMemberRole(
    projectId: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId,
    role: "lead" | "member"
  ): Promise<IProject | null> {
    return await Project.findOneAndUpdate(
      { _id: projectId, "members.userId": userId },
      { $set: { "members.$.role": role } },
      { new: true }
    ).populate("members.userId", "name email");
  }

  async isMember(
    projectId: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId
  ): Promise<boolean> {
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { leadId: userId },
        { "members.userId": userId }
      ]
    });
    return !!project;
  }

  async getMemberRole(
    projectId: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId
  ): Promise<"lead" | "member" | null> {
    const project = await Project.findById(projectId);
    if (!project) return null;

    if (project.leadId.toString() === (userId.toString())) {
      return "lead";
    }

    const member = project.members.find(m => m.userId.toString() === (userId.toString()));
    return member?.role || null;
  }

  async countByWorkspace(workspaceId: string | Schema.Types.ObjectId): Promise<number> {
    return await Project.countDocuments({ workspaceId });
  }

  async archive(id: string | Schema.Types.ObjectId): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      id,
      { $set: { status: ProjectStatus.ARCHIVED } },
      { new: true }
    );
  }

  async delete(id: string | Schema.Types.ObjectId): Promise<void> {
    await Project.findByIdAndDelete(id);
  }

  async deleteByWorkspace(workspaceId: string | Schema.Types.ObjectId): Promise<void> {
    await Project.deleteMany({ workspaceId });
  }
}

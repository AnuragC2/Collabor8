import { Schema } from 'mongoose';
import { ProjectStatus } from './project.projectStatus.js';
import { IProjectMember } from './project.IProjectMember.js';

export interface IProject extends Document {
  _id: Schema.Types.ObjectId;
  workspaceId: Schema.Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  leadId: Schema.Types.ObjectId;
  members: IProjectMember[];
  visibility: "public" | "private";
  startDate?: Date;
  targetEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
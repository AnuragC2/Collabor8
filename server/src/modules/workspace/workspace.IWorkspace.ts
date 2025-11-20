import { Schema } from 'mongoose';
import { IWorkspaceMember } from '../workspaceMember/workspace.IWorkspaceMember.js';
export interface IWorkspace extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    slug: string; 
    description?: string;
    ownerId: Schema.Types.ObjectId;
    members: IWorkspaceMember[];
    settings: {
        allowGuestAccess?: boolean;
        defaultProjectVisibility?: "public" | "private";
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

}
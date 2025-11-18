import { Schema } from "mongoose";
import { UserRole } from "./user.types.js";

export interface IUser {
    _id: Schema.Types.ObjectId;
    email: string; 
    passwordHash: string; 
    name: string;
    role: UserRole;
    isActive: boolean; 
    createdAt: Date;
    updatedAt: Date; 
    lastLoginAt: Date;
}
import { Schema, model } from "mongoose";
import { IUser } from "./user.IUser.js";
import { UserRole } from "./user.types.js";

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Member,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
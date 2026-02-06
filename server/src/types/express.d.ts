import { Schema } from "mongoose";
import "express";
import { WorkspaceRole } from "../modules/workspace/workspace.workspaceRole.ts";
import { UserRole } from '../modules/user/user.types.ts'

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: Schema.Types.ObjectId;
      role: UserRole;
    };
    sessionId?: Schema.Types.ObjectId;
    workspaceRole?: WorkspaceRole;
    projectRole?: "lead" | "member" | undefined;
  }
}

import { Schema } from "mongoose";
import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: Schema.Types.ObjectId;
      role: string;
    };
    sessionId?: Schema.Types.ObjectId;
  }
}

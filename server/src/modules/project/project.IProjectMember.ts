import { Schema } from "mongoose";

export interface IProjectMember {
    userId: Schema.Types.ObjectId;
    role: "lead" | "member";
    joinedAt: Date;
}

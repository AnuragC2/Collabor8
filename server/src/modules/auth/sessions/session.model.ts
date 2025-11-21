import { ISession } from "./session.types.js";
import {Schema, model, Types} from 'mongoose'

export interface SessionDocument extends ISession, Document {}

const sessionSchema = new Schema<SessionDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date },
}, { timestamps: true });

sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 });

export const SessionModel = model<SessionDocument>('Session', sessionSchema);
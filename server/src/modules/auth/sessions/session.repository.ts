import { SessionModel, SessionDocument } from './session.model.js';
import { Schema } from 'mongoose';
export class SessionRepository {
  async createSession(data: {
    userId: Schema.Types.ObjectId;
    refreshTokenHash: string;
    expiresAt: Date;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
  }): Promise<SessionDocument> {
    const session = new SessionModel(data);
    return session.save();
  }

  async findById(id: Schema.Types.ObjectId): Promise<SessionDocument | null> {
    return SessionModel.findById(id).exec();
  }

  async revokeSession(id: string): Promise<void> {
    await SessionModel.findByIdAndUpdate(id, { isRevoked: true }).exec();
  }

  async findValidSession(id: string | undefined) {
    return SessionModel.findOne({
        _id: id,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    }).exec();
  }

  async updateRefreshTokenHash(id: string, hash: string) {
    return SessionModel.findByIdAndUpdate(id, {
        refreshTokenHash: hash,
        lastUsedAt: new Date()
    }).exec();
  }

  async revokeAllUserSessions(userId: string) {
    await SessionModel.updateMany({ userId }, { isRevoked: true }).exec();
  } 
}

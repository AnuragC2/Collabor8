import {Schema} from 'mongoose'

export interface ISession {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date;
}

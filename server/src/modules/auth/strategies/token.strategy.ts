import { IUser } from '../../user/user.IUser.js';
import { Schema } from 'mongoose'

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;  // seconds
  refreshTokenExpiresAt: Date;
  refreshTokenExpiresInDays: number;
}

export interface ITokenStrategy {
  generateTokens(user: IUser, sessionId: Schema.Types.ObjectId): TokenPair;
  verifyAccessToken(token: string): { userId: Schema.Types.ObjectId; sessionId?: Schema.Types.ObjectId } | null;
  verifyRefreshToken(token: string): {userId: Schema.Types.ObjectId; sessionId?: Schema.Types.ObjectId } | null;
}

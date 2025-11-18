import jwt from 'jsonwebtoken';
import { ITokenStrategy, TokenPair } from './token.strategy.js';
import { IUser } from '../../user/user.IUser.js';
import config from '../../../config/env.js';
import { Schema } from 'mongoose';

export class JwtTokenStrategy implements ITokenStrategy {
    generateTokens(user: IUser, sessionId: Schema.Types.ObjectId): TokenPair {
        const accessTokenExpiresIn = 30 * 60;
        const refreshTokenExpiresInDays = 30;
        
        const accessToken = jwt.sign(
            { sub: user._id, role: user.role, sid: sessionId },
            config.JWT_ACCESS_SECRET,
            { expiresIn: accessTokenExpiresIn }
        );

        const refreshTokenPayload = {
            sub: user._id, sid: sessionId, typ: 'refresh',
        };

        const refreshToken = jwt.sign(
            refreshTokenPayload,
            config.JWT_REFRESH_SECRET,
            { expiresIn: `${refreshTokenExpiresInDays}d` }
        );

        const refreshTokenExpiresAt = new Date(
            Date.now() + refreshTokenExpiresInDays * 24 * 60 * 60 * 1000
        );

        return { accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresAt, refreshTokenExpiresInDays };
    }

    verifyAccessToken(Token: string | undefined) {
        if(Token == undefined) {
            return null;
        }
        const token = Token.toString();
        try {
            const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as any;
            return { userId: decoded.sub as Schema.Types.ObjectId, sessionId: decoded.sid as Schema.Types.ObjectId};
        } catch {
            return null;
        }
    }

    verifyRefreshToken(token: string) {
        try {
            const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
            if (decoded.typ !== 'refresh') return null;
            return {userId: decoded.sub, sessionId: decoded.sid};
        } catch {
            return null;
        }
    }
}
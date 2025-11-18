import { UserRepository } from '../user/user.repository.js';
import { SessionRepository } from './sessions/session.repository.js';
import { PasswordService } from '../../security/password.service.js';
import { ITokenStrategy, TokenPair } from './strategies/token.strategy.js';
import { RegisterInput, LoginInput } from './auth.types.js';
import { AppError } from '../../core/errors/AppError.js';

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository,
    private passwordService: PasswordService,
    private tokenStrategy: ITokenStrategy
  ) {}

  async register(input: RegisterInput, context: { ip: string | undefined; userAgent: string | undefined}): Promise<{ user: any; tokens: TokenPair }> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('Email already in use');
    }

    const passwordHash = await this.passwordService.hashPassword(input.password);

    const user = await this.userRepo.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    const session = await this.sessionRepo.createSession({
      userId: user._id,
      refreshTokenHash: 'TEMP', // will be updated after token generation if needed
      ipAddress: context.ip,
      userAgent: context.userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const tokens = this.tokenStrategy.generateTokens(user, session._id);

    const refreshTokenHash = await this.passwordService.hashPassword(tokens.refreshToken);
    await this.sessionRepo.updateRefreshTokenHash(session._id.toString(), refreshTokenHash);

    return { user: this.toPublicUser(user), tokens };
  }

  async login(input: LoginInput, context: { ip: string|undefined; userAgent: string|undefined }): Promise<{ user: any; tokens: TokenPair }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const isValid = await this.passwordService.comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    await this.userRepo.updateLastLogin(user._id.toString());

    const session = await this.sessionRepo.createSession({
      userId: user._id,
      refreshTokenHash: 'TEMP',
      ipAddress: context.ip,
      userAgent: context.userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const tokens = this.tokenStrategy.generateTokens(user, session._id);

    const refreshTokenHash = await this.passwordService.hashPassword(tokens.refreshToken);
    await this.sessionRepo.updateRefreshTokenHash(session._id.toString(), refreshTokenHash);

    return { user: this.toPublicUser(user), tokens };
  }

  async refreshTokens(refreshToken: string, context: { ip: string | undefined; userAgent?: string |undefined }) {
    const decoded = this.tokenStrategy.verifyRefreshToken(refreshToken);
    if (!decoded) throw AppError.unauthorized("Invalid refresh token");

    const session = await this.sessionRepo.findValidSession(decoded.sessionId?.toString());
    if (!session) throw AppError.unauthorized("Session expired or revoked");

    const matches = await this.passwordService.comparePassword(refreshToken, session.refreshTokenHash);
    if (!matches) {
        await this.sessionRepo.revokeSession(session._id.toString());
        throw AppError.unauthorized("Token reuse detected");
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user) throw AppError.unauthorized("User no longer exists");

    // ROTATE TOKEN: generate new tokens and update hash
    const tokens = this.tokenStrategy.generateTokens(user, session._id);

    const newRefreshHash = await this.passwordService.hashPassword(tokens.refreshToken);
    await this.sessionRepo.updateRefreshTokenHash(session._id.toString(), newRefreshHash);

    return {
        user: this.toPublicUser(user),
        tokens
    };
  }

  async logout(sessionId: string) {
    await this.sessionRepo.revokeSession(sessionId);
  }

  async logoutAll(userId: string) {
    await this.sessionRepo.revokeAllUserSessions(userId);
  }


  private toPublicUser(user: any) {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

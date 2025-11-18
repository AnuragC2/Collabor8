import { Request, Response, NextFunction } from "express";
import { JwtTokenStrategy } from "./strategies/jwt.strategy.js";
import { AppError } from "../../core/errors/AppError.js";

const tokenStrategy = new JwtTokenStrategy();

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("No token provided");
  }

  const token = header.split(" ")[1];
  const payload = tokenStrategy.verifyAccessToken(token);

  if (!payload) {
    throw AppError.unauthorized("Invalid or expired token");
  }

  req.user = {
    id: payload.userId,
    role: payload.role,
  };
  
  req.sessionId = payload.sessionId;

  return next();
};

export default requireAuth;

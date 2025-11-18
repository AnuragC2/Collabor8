import { UserRole } from "../../modules/user/user.types.js";
import { AppError } from "../../core/errors/AppError.js";
import { Request, Response, NextFunction } from "express";

const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authenticated");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw AppError.forbidden("Insufficient role permissions");
    }

    next();
  };
};

export default requireRole;

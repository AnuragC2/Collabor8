import { Request, Response, NextFunction } from "express";
import { AppError } from "../../core/errors/AppError.js";

export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) throw AppError.unauthorized("Unauthorized");

        if (!allowedRoles.includes(req.user.role)) {
            throw AppError.forbidden("Insufficient permissions");
        }

        next();
    };
};

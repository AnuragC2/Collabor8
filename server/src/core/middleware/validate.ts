import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export const validate = (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err
        });
      }
      next(err);
    }
  };

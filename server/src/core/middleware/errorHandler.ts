import { AppError } from "../errors/AppError.js";
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
      
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Internal server error"
  });
}

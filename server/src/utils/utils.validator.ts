import { Schema, Types } from "mongoose";
import { AppError } from "../core/errors/AppError.js";

// Simple regex Mongoose recommends internally
const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export class ValidationHelper {

  /**
   * Checks if value is ANY required type:
   * - Schema.Types.ObjectId instance
   * - string ObjectId
   * - primitives (string, number, boolean)
   */
  static requireParam<T>(
    value: T,
    paramName: string
  ): asserts value is NonNullable<T> {
    // null or undefined → invalid
    if (value === undefined || value === null) {
      throw AppError.badRequest(`${paramName} is required`);
    }

    // Empty string → invalid
    if (typeof value === "string" && value.trim() === "") {
      throw AppError.badRequest(`${paramName} cannot be empty`);
    }

    // Accept actual Schema.Types.ObjectId instances
    if (value instanceof Schema.Types.ObjectId) {
      return;
    }

    // Accept actual Types.ObjectId instances
    if (value instanceof Types.ObjectId) {
      return;
    }

    // Accept string ObjectId
    if (typeof value === "string" && objectIdRegex.test(value)) {
      return;
    }

    // Everything else is accepted (number, boolean, object)
    return;
  }

  /**
   * Multiple required params
   */
  static requireParams(params: Record<string, unknown>): void {
    const missing = Object.entries(params)
      .filter(([_, value]) => {
        if (value === undefined || value === null) return true;
        if (typeof value === "string" && value.trim() === "") return true;
        return false;
      })
      .map(([key]) => key);

    if (missing.length > 0) {
      throw AppError.badRequest(
        `Missing required parameters: ${missing.join(", ")}`
      );
    }
  }

  /**
   * Required body fields
   */
  static requireBody<T>(
    body: Partial<T>,
    requiredFields: (keyof T)[]
  ): asserts body is T {
    const missing = requiredFields.filter((field) => {
      const value = body[field];
      if (value === undefined || value === null) return true;
      if (typeof value === "string" && value.trim() === "") return true;
      return false;
    });

    if (missing.length > 0) {
      throw AppError.badRequest(
        `Missing required fields: ${missing.join(", ")}`
      );
    }
  }

  /**
   * Explicit ObjectId validator if needed
   */
  static requireObjectId(value: unknown, name = "ID"): asserts value is string {
    if (
      !(value instanceof Schema.Types.ObjectId) &&
      !(value instanceof Types.ObjectId) &&
      !(typeof value === "string" && objectIdRegex.test(value))
    ) {
      throw AppError.badRequest(`Invalid ${name}`);
    }
  }
}

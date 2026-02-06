import { Types } from "mongoose";

export function getObjectIdString(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "string") return value;

  // Real ObjectId instance
  if (value instanceof Types.ObjectId) return value.toString();

  if (typeof value === "object") {
    const asAny = value as any;

    // Mongoose populated refs commonly look like { _id: ObjectId, ... }
    if (asAny._id) return getObjectIdString(asAny._id);

    // Some code uses `.id` virtuals
    if (asAny.id) return getObjectIdString(asAny.id);
  }

  return String(value);
}


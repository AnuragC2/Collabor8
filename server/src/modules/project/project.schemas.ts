// validation/project.schemas.ts
import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createProjectParamsSchema = z.object({
  workspaceId: objectIdSchema,
});

export const projectIdParamsSchema = z.object({
  projectId: objectIdSchema,
});

export const addMemberParamsSchema = z.object({
  projectId: objectIdSchema,
});

export const removeMemberParamsSchema = z.object({
  projectId: objectIdSchema,
  memberId: objectIdSchema,
});

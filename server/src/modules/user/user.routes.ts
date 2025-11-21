import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js"
import { requireRole } from "./user.middleware.js";
import { UserController } from "./user.controller.js";

const controller = new UserController();
const userRoutes = Router();

userRoutes.get("/me", requireAuth, controller.getMe);

userRoutes.get("/", requireAuth, requireRole("Admin"), controller.listUsers);

userRoutes.post("/", requireAuth, requireRole("Admin"), controller.createUser);

userRoutes.get("/:id", requireAuth, requireRole("Admin"), controller.getUserById);

export default userRoutes;

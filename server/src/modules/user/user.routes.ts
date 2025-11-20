import { Router } from "express";
import requireAuth from "../../modules/auth/requireAuth.js";
import { requireRole } from "../../core/middleware/requireRole.js";
import { UserController } from "./user.controller.js";

const controller = new UserController();
const router = Router();

router.get("/me", requireAuth, controller.getMe);

router.get("/", requireAuth, requireRole("Admin"), controller.listUsers);

router.post("/", requireAuth, requireRole("Admin"), controller.createUser);

router.get("/:id", requireAuth, requireRole("Admin"), controller.getUserById);

export default router;

import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "../user/user.repository.js";
import { SessionRepository } from "./sessions/session.repository.js";
import { PasswordService } from "../../security/password.service.js";
import { JwtTokenStrategy } from "./strategies/jwt.strategy.js";
import { validate } from "../../core/middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.validators.js";
import requireAuth from "./auth.middleware.js";
import requireRole from "../../core/middleware/rbac.middleware.js";
import { UserRole } from "../user/user.types.js";

const router = Router();

const authService = new AuthService(
  new UserRepository(),
  new SessionRepository(),
  new PasswordService(),
  new JwtTokenStrategy()
);

const controller = new AuthController(authService);

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh", requireAuth, controller.refresh);

router.post("/logout", requireAuth, controller.logout);
router.post("/logout-all", requireAuth, controller.logoutAll);

export default router;

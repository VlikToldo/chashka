import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  smtpHealth,
} from "../../controllers/admin/authController.js";
import { authenticateAdmin } from "../../middleware/authenticateAdmin.js";
import { authLimiter, emailLimiter } from "../../middleware/rateLimiter.js";
import { validate } from "../../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../schemas/index.js";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/verify-email/:token", verifyEmail);
router.post(
  "/resend-verification",
  authenticateAdmin,
  emailLimiter,
  resendVerification,
);
router.post(
  "/forgot-password",
  emailLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  emailLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);
router.get("/smtp-health", authenticateAdmin, smtpHealth);
export default router;

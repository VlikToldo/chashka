import { Router } from "express";
import { register, login } from "../../controllers/admin/authController.js";
import { authLimiter } from "../../middleware/rateLimiter.js";
import { validate } from "../../middleware/validate.js";
import { registerSchema, loginSchema } from "../../schemas/index.js";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
export default router;

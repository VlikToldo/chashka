import { Router } from "express";
import { authenticateAdmin } from "../../middleware/authenticateAdmin.js";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../controllers/admin/profileController.js";
import { validate } from "../../middleware/validate.js";
import { updateProfileSchema, changePasswordSchema } from "../../schemas/index.js";

const router = Router();
router.get("/profile", authenticateAdmin, getProfile);
router.put("/profile", authenticateAdmin, validate(updateProfileSchema), updateProfile);
router.put("/password", authenticateAdmin, validate(changePasswordSchema), changePassword);
export default router;

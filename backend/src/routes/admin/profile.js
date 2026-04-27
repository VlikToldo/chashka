import { Router } from "express";
import { authenticateAdmin } from "../../middleware/authenticateAdmin.js";
import {
  getProfile,
  updateProfile,
  resendEmailChangeVerification,
  cancelEmailChange,
  changePassword,
  deleteAccount,
} from "../../controllers/admin/profileController.js";
import { validate } from "../../middleware/validate.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "../../schemas/index.js";

const router = Router();
router.get("/profile", authenticateAdmin, getProfile);
router.put(
  "/profile",
  authenticateAdmin,
  validate(updateProfileSchema),
  updateProfile,
);
router.post(
  "/email-change/resend",
  authenticateAdmin,
  resendEmailChangeVerification,
);
router.delete("/email-change", authenticateAdmin, cancelEmailChange);
router.put(
  "/password",
  authenticateAdmin,
  validate(changePasswordSchema),
  changePassword,
);
router.delete(
  "/account",
  authenticateAdmin,
  validate(deleteAccountSchema),
  deleteAccount,
);
export default router;

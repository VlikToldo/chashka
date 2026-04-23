import { Router } from "express";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../../controllers/admin/sectionsController.js";
import { validate } from "../../middleware/validate.js";
import { createSectionSchema, updateSectionSchema } from "../../schemas/index.js";

const router = Router();
router.get("/", getSections);
router.post("/", validate(createSectionSchema), createSection);
router.put("/:id", validate(updateSectionSchema), updateSection);
router.delete("/:id", deleteSection);
export default router;

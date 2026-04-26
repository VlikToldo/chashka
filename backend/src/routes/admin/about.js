import { Router } from "express";
import { uploadAboutImage } from "../../middleware/uploadCloudinary.js";
import {
  getAbout,
  createAbout,
  updateAbout,
  deleteAbout,
  reorderAbout,
  uploadAboutImage as uploadImage,
  updateAboutImages,
} from "../../controllers/admin/aboutController.js";
import { validate } from "../../middleware/validate.js";
import { createAboutSchema, updateAboutSchema } from "../../schemas/index.js";

const router = Router();
router.get("/", getAbout);
router.post("/", validate(createAboutSchema), createAbout);
router.put("/reorder", reorderAbout);
router.put("/:id", validate(updateAboutSchema), updateAbout);
router.delete("/:id", deleteAbout);
router.post("/:id/image", uploadAboutImage.single("image"), uploadImage);
router.put("/:id/images", updateAboutImages);
export default router;

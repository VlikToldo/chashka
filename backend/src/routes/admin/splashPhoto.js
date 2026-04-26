import { Router } from "express";
import { uploadSplashPhoto } from "../../middleware/uploadCloudinary.js";
import {
  getSplashPhoto,
  uploadSplashPhoto as uploadPhoto,
  updateSplashPhotoPosition,
  updateSplashPhotoEnabled,
  deleteSplashPhoto,
} from "../../controllers/admin/splashPhotoController.js";

const router = Router();

router.get("/", getSplashPhoto);
router.post("/", uploadSplashPhoto.single("image"), uploadPhoto);
router.put("/position", updateSplashPhotoPosition);
router.patch("/enabled", updateSplashPhotoEnabled);
router.delete("/", deleteSplashPhoto);

export default router;

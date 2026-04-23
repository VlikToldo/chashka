import { Router } from "express";
import { uploadCoverPhoto } from "../../middleware/uploadCloudinary.js";
import {
  getCoverPhoto,
  uploadCoverPhoto as uploadPhoto,
} from "../../controllers/admin/coverPhotoController.js";

const router = Router();
router.get("/", getCoverPhoto);
router.post("/", uploadCoverPhoto.single("image"), uploadPhoto);
export default router;

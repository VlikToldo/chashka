import { Router } from "express";
import { uploadCoverPhoto } from "../../middleware/uploadCloudinary.js";
import {
  getCoverPhoto,
  uploadCoverPhoto as uploadPhoto,
  updateCoverPhotoPosition,
} from "../../controllers/admin/coverPhotoController.js";
import { validate } from "../../middleware/validate.js";
import { updateCoverPhotoPositionSchema } from "../../schemas/index.js";

const router = Router();
router.get("/", getCoverPhoto);
router.post("/", uploadCoverPhoto.single("image"), uploadPhoto);
router.put(
  "/position",
  validate(updateCoverPhotoPositionSchema),
  updateCoverPhotoPosition,
);
export default router;

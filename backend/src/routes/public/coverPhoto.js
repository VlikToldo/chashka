import { Router } from "express";
import { getCoverPhoto } from "../../controllers/public/coverPhotoController.js";

const router = Router();
router.get("/", getCoverPhoto);
export default router;

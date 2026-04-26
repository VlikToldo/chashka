import { Router } from "express";
import { getSplashPhoto } from "../../controllers/public/splashPhotoController.js";

const router = Router();
router.get("/", getSplashPhoto);

export default router;

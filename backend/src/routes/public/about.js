import { Router } from "express";
import { getAbout } from "../../controllers/public/aboutController.js";

const router = Router();
router.get("/", getAbout);
export default router;

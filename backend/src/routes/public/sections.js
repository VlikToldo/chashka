import { Router } from "express";
import { getSections } from "../../controllers/public/sectionsController.js";

const router = Router();
router.get("/", getSections);
export default router;

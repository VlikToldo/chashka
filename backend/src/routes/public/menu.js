import { Router } from "express";
import { getMenuItems } from "../../controllers/public/menuController.js";

const router = Router();
router.get("/", getMenuItems);
export default router;

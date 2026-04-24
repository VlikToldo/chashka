import { Router } from "express";
import { getWorkingHours } from "../../controllers/admin/workingHoursController.js";

const router = Router();
router.get("/", getWorkingHours);
export default router;

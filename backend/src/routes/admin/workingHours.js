import { Router } from "express";
import {
  getWorkingHours,
  updateWorkingHours,
} from "../../controllers/admin/workingHoursController.js";
import { validate } from "../../middleware/validate.js";
import { updateWorkingHoursSchema } from "../../schemas/index.js";

const router = Router();
router.get("/", getWorkingHours);
router.put("/", validate(updateWorkingHoursSchema), updateWorkingHours);
export default router;

import { Router } from "express";
import {
  getVenue,
  updateVenue,
} from "../../controllers/admin/venueController.js";
import { validate } from "../../middleware/validate.js";
import { updateVenueSchema } from "../../schemas/index.js";

const router = Router();
router.get("/", getVenue);
router.put("/", validate(updateVenueSchema), updateVenue);
export default router;

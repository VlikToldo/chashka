import { Router } from "express";
import { getVenue } from "../../controllers/public/venueController.js";

const router = Router();
router.get("/", getVenue);
export default router;

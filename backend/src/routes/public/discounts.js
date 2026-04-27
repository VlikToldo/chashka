import { Router } from "express";
import { getActiveDiscounts } from "../../controllers/public/discountsController.js";

const router = Router();
router.get("/", getActiveDiscounts);
export default router;

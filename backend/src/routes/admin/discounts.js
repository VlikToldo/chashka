import { Router } from "express";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../../controllers/admin/discountsController.js";
import { validate } from "../../middleware/validate.js";
import {
  createDiscountSchema,
  updateDiscountSchema,
} from "../../schemas/index.js";

const router = Router();
router.get("/", getDiscounts);
router.post("/", validate(createDiscountSchema), createDiscount);
router.put("/:id", validate(updateDiscountSchema), updateDiscount);
router.delete("/:id", deleteDiscount);
export default router;

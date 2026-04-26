import { Router } from "express";
import { uploadMenuItemImage } from "../../middleware/uploadCloudinary.js";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  duplicateMenuItem,
  uploadMenuItemImage as uploadImage,
} from "../../controllers/admin/menuItemsController.js";
import { validate } from "../../middleware/validate.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "../../schemas/index.js";

const router = Router();
router.get("/", getMenuItems);
router.post("/", validate(createMenuItemSchema), createMenuItem);
router.patch("/reorder", reorderMenuItems);
router.post("/:id/duplicate", duplicateMenuItem);
router.put("/:id", validate(updateMenuItemSchema), updateMenuItem);
router.delete("/:id", deleteMenuItem);
router.post("/:id/image", uploadMenuItemImage.single("image"), uploadImage);
export default router;

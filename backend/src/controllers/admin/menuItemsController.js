import MenuItem from "../../models/MenuItem.js";
import Discount from "../../models/Discount.js";
import { translateToAllLanguages } from "../../services/translationService.js";
import { deleteCloudinaryImage } from "../../utils/cloudinaryUtils.js";

export async function getMenuItems(req, res) {
  const { sectionId, isExtra } = req.query;
  const filter = {};
  if (sectionId) filter.sectionId = sectionId;
  if (isExtra !== undefined) filter.isExtra = isExtra === "true";
  const items = await MenuItem.find(filter).sort({ order: 1 });
  res.json(items);
}

export async function createMenuItem(req, res) {
  const {
    sectionId,
    name,
    price,
    ingredients,
    allergens,
    yield: yld,
    isExtra,
    order,
    imagePosition,
  } = req.body;
  if (!sectionId || !name || !price)
    return res
      .status(400)
      .json({ error: "sectionId, name and price required" });

  const [
    translatedName,
    translatedIngredients,
    translatedAllergens,
    translatedYield,
  ] = await Promise.all([
    translateToAllLanguages(name),
    translateToAllLanguages(ingredients),
    translateToAllLanguages(allergens),
    translateToAllLanguages(yld),
  ]);

  let nextOrder = order;
  if (nextOrder === undefined) {
    const lastItem = await MenuItem.findOne({
      sectionId,
      isExtra: !!isExtra,
    })
      .sort({ order: -1 })
      .select("order")
      .lean();
    nextOrder = typeof lastItem?.order === "number" ? lastItem.order + 1 : 0;
  }

  const item = await MenuItem.create({
    sectionId,
    name: translatedName,
    price,
    ingredients: translatedIngredients,
    allergens: translatedAllergens,
    yield: translatedYield,
    isExtra: !!isExtra,
    order: nextOrder,
    ...(imagePosition !== undefined ? { imagePosition } : {}),
  });
  res.status(201).json(item);
}

export async function updateMenuItem(req, res) {
  const {
    name,
    price,
    ingredients,
    allergens,
    yield: yld,
    sectionId,
    isExtra,
    order,
    imagePosition,
  } = req.body;
  const update = {};

  if (sectionId !== undefined) update.sectionId = sectionId;
  if (price !== undefined) update.price = price;
  if (isExtra !== undefined) update.isExtra = !!isExtra;
  if (order !== undefined) update.order = order;
  if (imagePosition !== undefined) update.imagePosition = imagePosition;

  const translationFields = [
    ["name", name],
    ["ingredients", ingredients],
    ["allergens", allergens],
    ["yield", yld],
  ];

  await Promise.all(
    translationFields
      .filter(([, val]) => val !== undefined)
      .map(async ([key, val]) => {
        update[key] = await translateToAllLanguages(val);
      }),
  );

  const item = await MenuItem.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
}

export async function deleteMenuItem(req, res) {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  if (item.image) await deleteCloudinaryImage(item.image);
  // Remove this item from all discounts (cascade)
  await Discount.updateMany({}, { $pull: { items: { itemId: item._id } } });
  res.json({ success: true });
}

export async function reorderMenuItems(req, res) {
  const updates = req.body;
  if (!Array.isArray(updates))
    return res.status(400).json({ error: "Array expected" });
  await Promise.all(
    updates.map(({ id, order }) => MenuItem.findByIdAndUpdate(id, { order })),
  );
  res.json({ success: true });
}

export async function duplicateMenuItem(req, res) {
  const original = await MenuItem.findById(req.params.id);
  if (!original) return res.status(404).json({ error: "Not found" });
  const copy = await MenuItem.create({
    sectionId: original.sectionId,
    name: original.name,
    price: original.price,
    ingredients: original.ingredients,
    allergens: original.allergens,
    yield: original.yield,
    image: original.image,
    imagePosition: original.imagePosition,
    isExtra: original.isExtra,
    order: original.order,
  });
  res.status(201).json(copy);
}

export async function uploadMenuItemImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  const imageUrl = req.file.path; // Cloudinary URL
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  if (item.image) await deleteCloudinaryImage(item.image);
  item.image = imageUrl;
  await item.save();
  res.json({ image: imageUrl });
}

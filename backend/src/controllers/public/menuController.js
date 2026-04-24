import MenuItem from "../../models/MenuItem.js";

export async function getMenuItems(req, res) {
  const { sectionId, isExtra } = req.query;
  const filter = {};
  if (sectionId) filter.sectionId = sectionId;
  if (isExtra !== undefined) filter.isExtra = isExtra === "true";
  const items = await MenuItem.find(filter).sort({ order: 1 });
  res.json(items);
}

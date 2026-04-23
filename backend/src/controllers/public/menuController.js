import MenuItem from "../../models/MenuItem.js";

export async function getMenuItems(req, res) {
  const { sectionId } = req.query;
  const filter = sectionId ? { sectionId } : {};
  const items = await MenuItem.find(filter).sort({ order: 1 });
  res.json(items);
}

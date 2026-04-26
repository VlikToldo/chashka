import Section from "../../models/Section.js";
import MenuItem from "../../models/MenuItem.js";
import { translateToAllLanguages } from "../../services/translationService.js";

export async function getSections(_req, res) {
  const sections = await Section.find().sort({ order: 1 });
  res.json(sections);
}

export async function createSection(req, res) {
  const { name, category, order } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const section = await Section.create({
    name: await translateToAllLanguages(name),
    category: category ?? "food",
    order,
  });
  res.status(201).json(section);
}

export async function updateSection(req, res) {
  const { name, category, order } = req.body;
  const update = {};
  if (name !== undefined) update.name = await translateToAllLanguages(name);
  if (category !== undefined) update.category = category;
  if (order !== undefined) update.order = order;
  const section = await Section.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!section) return res.status(404).json({ error: "Not found" });
  res.json(section);
}

export async function deleteSection(req, res) {
  const itemCount = await MenuItem.countDocuments({ sectionId: req.params.id });
  if (itemCount > 0) {
    return res.status(409).json({
      message: `Не можна видалити розділ — у ньому є ${itemCount} ${itemCount === 1 ? "позиція" : "позицій"}. Спочатку видаліть або перенесіть усі позиції.`,
    });
  }
  const section = await Section.findByIdAndDelete(req.params.id);
  if (!section) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
}

export async function reorderSections(req, res) {
  const updates = req.body;
  if (!Array.isArray(updates))
    return res.status(400).json({ error: "Array expected" });
  await Promise.all(
    updates.map(({ id, order }) => Section.findByIdAndUpdate(id, { order })),
  );
  res.json({ success: true });
}

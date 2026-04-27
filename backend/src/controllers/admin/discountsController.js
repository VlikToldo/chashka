import Discount from "../../models/Discount.js";

export async function getDiscounts(_req, res) {
  const discounts = await Discount.find().sort({ createdAt: -1 });
  res.json(discounts);
}

export async function createDiscount(req, res) {
  const { label, items, schedule, utcOffset, enabled } = req.body;
  if (!items?.length) return res.status(400).json({ error: "items required" });

  const discount = await Discount.create({
    label: label ?? "",
    items,
    schedule: schedule ?? [],
    utcOffset: utcOffset ?? 0,
    enabled: enabled !== false,
  });
  res.status(201).json(discount);
}

export async function updateDiscount(req, res) {
  const { label, items, schedule, utcOffset, enabled } = req.body;
  const update = {};
  if (label !== undefined) update.label = label;
  if (items !== undefined) update.items = items;
  if (schedule !== undefined) update.schedule = schedule;
  if (utcOffset !== undefined) update.utcOffset = utcOffset;
  if (enabled !== undefined) update.enabled = enabled;

  const discount = await Discount.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!discount) return res.status(404).json({ error: "Not found" });
  res.json(discount);
}

export async function deleteDiscount(req, res) {
  const discount = await Discount.findByIdAndDelete(req.params.id);
  if (!discount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}

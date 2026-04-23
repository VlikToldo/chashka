import AboutBlock from "../../models/AboutBlock.js";
import { translateToAllLanguages } from "../../services/translationService.js";

export async function getAbout(_req, res) {
  const blocks = await AboutBlock.find().sort({ order: 1 });
  res.json(blocks);
}

export async function createAbout(req, res) {
  const { title, text, order } = req.body;
  if (!title || !text)
    return res.status(400).json({ error: "Title and text required" });

  const [translatedTitle, translatedText] = await Promise.all([
    translateToAllLanguages(title),
    translateToAllLanguages(text),
  ]);

  const block = await AboutBlock.create({
    title: translatedTitle,
    text: translatedText,
    order,
  });
  res.status(201).json(block);
}

export async function updateAbout(req, res) {
  const { title, text, order } = req.body;
  const update = {};
  if (order !== undefined) update.order = order;

  await Promise.all([
    title !== undefined &&
      translateToAllLanguages(title).then((t) => (update.title = t)),
    text !== undefined &&
      translateToAllLanguages(text).then((t) => (update.text = t)),
  ]);

  const block = await AboutBlock.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!block) return res.status(404).json({ error: "Not found" });
  res.json(block);
}

export async function deleteAbout(req, res) {
  const block = await AboutBlock.findByIdAndDelete(req.params.id);
  if (!block) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
}

export async function reorderAbout(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids must be an array" });

  await Promise.all(
    ids.map((id, index) => AboutBlock.findByIdAndUpdate(id, { order: index })),
  );
  res.json({ success: true });
}

export async function uploadAboutImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  const imageUrl = req.file.path; // Cloudinary URL
  const block = await AboutBlock.findByIdAndUpdate(
    req.params.id,
    { image: imageUrl },
    { new: true },
  );
  if (!block) return res.status(404).json({ error: "Not found" });
  res.json({ image: imageUrl });
}

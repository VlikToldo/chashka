import AboutBlock from "../../models/AboutBlock.js";
import { translateToAllLanguages } from "../../services/translationService.js";
import { deleteCloudinaryImage } from "../../utils/cloudinaryUtils.js";

// Normalize legacy `image` field into the `images` array
function normalizeBlock(block) {
  const obj = block.toObject ? block.toObject() : block;
  if ((!obj.images || obj.images.length === 0) && obj.image) {
    obj.images = [{ url: obj.image, position: obj.imagePosition || "{}" }];
  }
  obj.images = obj.images ?? [];
  return obj;
}

export async function getAbout(_req, res) {
  const blocks = await AboutBlock.find().sort({ order: 1 });
  res.json(blocks.map(normalizeBlock));
}

export async function createAbout(req, res) {
  const { title, text, order } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const titleIsEmpty =
    !title ||
    (typeof title === "object" &&
      Object.values(title).every((v) => !v?.trim()));

  const [translatedTitle, translatedText] = await Promise.all([
    titleIsEmpty
      ? Promise.resolve({ uk: "", en: "", es: "" })
      : translateToAllLanguages(title),
    translateToAllLanguages(text),
  ]);

  const block = await AboutBlock.create({
    title: translatedTitle,
    text: translatedText,
    order,
  });
  res.status(201).json(normalizeBlock(block));
}

export async function updateAbout(req, res) {
  const { title, text, order } = req.body;
  const update = {};
  if (order !== undefined) update.order = order;

  const titleIsEmpty =
    title === undefined ||
    (typeof title === "object" &&
      Object.values(title).every((v) => !v?.trim()));

  await Promise.all([
    !titleIsEmpty &&
      translateToAllLanguages(title).then((t) => (update.title = t)),
    titleIsEmpty &&
      title !== undefined &&
      Promise.resolve().then(() => (update.title = { uk: "", en: "", es: "" })),
    text !== undefined &&
      translateToAllLanguages(text).then((t) => (update.text = t)),
  ]);

  const block = await AboutBlock.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!block) return res.status(404).json({ error: "Not found" });
  res.json(normalizeBlock(block));
}

export async function deleteAbout(req, res) {
  const block = await AboutBlock.findByIdAndDelete(req.params.id);
  if (!block) return res.status(404).json({ error: "Not found" });
  const normalized = normalizeBlock(block);
  await Promise.all(
    normalized.images.map((img) => deleteCloudinaryImage(img.url)),
  );
  res.json({ success: true });
}

export async function reorderAbout(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids))
    return res.status(400).json({ error: "ids must be an array" });

  await Promise.all(
    ids.map((id, index) => AboutBlock.findByIdAndUpdate(id, { order: index })),
  );
  res.json({ success: true });
}

// Upload one image to Cloudinary and return its URL (does NOT persist to DB)
export async function uploadAboutImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  res.json({ url: req.file.path });
}

// Delete a single Cloudinary image by URL (cleanup for uploads not persisted to DB)
export async function deleteAboutImage(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });
  await deleteCloudinaryImage(url);
  res.json({ success: true });
}

// Replace the entire images array for a block
export async function updateAboutImages(req, res) {
  const { images } = req.body;
  if (!Array.isArray(images))
    return res.status(400).json({ error: "images must be an array" });

  const block = await AboutBlock.findById(req.params.id);
  if (!block) return res.status(404).json({ error: "Not found" });

  // Delete images that are no longer in the new list
  const existing = normalizeBlock(block);
  const newUrls = new Set(images.map((i) => i.url));
  const removed = existing.images.filter((i) => !newUrls.has(i.url));
  await Promise.all(removed.map((i) => deleteCloudinaryImage(i.url)));

  block.images = images;
  await block.save();
  res.json(normalizeBlock(block));
}

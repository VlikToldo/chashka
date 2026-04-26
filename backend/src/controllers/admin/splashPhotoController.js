import SplashPhoto from "../../models/SplashPhoto.js";

async function getOrCreateDoc() {
  let doc = await SplashPhoto.findOne();
  if (!doc)
    doc = await SplashPhoto.create({
      image: null,
      objectPosition: "{}",
      enabled: true,
    });
  return doc;
}

export async function getSplashPhoto(_req, res) {
  const doc = await getOrCreateDoc();
  res.json(doc);
}

export async function uploadSplashPhoto(req, res) {
  if (!req.file) return res.status(400).json({ message: "No image provided" });
  const doc = await getOrCreateDoc();
  doc.image = req.file.path;
  doc.objectPosition = req.body.objectPosition ?? "{}";
  await doc.save();
  res.json(doc);
}

export async function updateSplashPhotoPosition(req, res) {
  const { objectPosition } = req.body;
  if (!objectPosition)
    return res.status(400).json({ message: "objectPosition required" });
  const doc = await getOrCreateDoc();
  doc.objectPosition = objectPosition;
  await doc.save();
  res.json(doc);
}

export async function updateSplashPhotoEnabled(req, res) {
  const { enabled } = req.body;
  if (typeof enabled !== "boolean")
    return res.status(400).json({ message: "enabled must be boolean" });
  const doc = await getOrCreateDoc();
  doc.enabled = enabled;
  await doc.save();
  res.json(doc);
}

export async function deleteSplashPhoto(req, res) {
  const doc = await getOrCreateDoc();
  doc.image = null;
  doc.objectPosition = "{}";
  await doc.save();
  res.json(doc);
}

import CoverPhoto from "../../models/CoverPhoto.js";
import { deleteCloudinaryImage } from "../../utils/cloudinaryUtils.js";

export async function getCoverPhoto(_req, res) {
  let doc = await CoverPhoto.findOne();
  if (!doc)
    doc = await CoverPhoto.create({
      image: null,
      objectPosition: "center center",
    });
  res.json(doc);
}

export async function uploadCoverPhoto(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  const imageUrl = req.file.path; // Cloudinary URL
  const objectPosition = req.body.objectPosition || "center center";
  let doc = await CoverPhoto.findOne();
  if (doc) {
    if (doc.image) await deleteCloudinaryImage(doc.image);
    doc.image = imageUrl;
    doc.objectPosition = objectPosition;
    await doc.save();
  } else {
    doc = await CoverPhoto.create({ image: imageUrl, objectPosition });
  }
  res.json(doc);
}

export async function updateCoverPhotoPosition(req, res) {
  const { objectPosition } = req.body;
  if (!objectPosition)
    return res.status(400).json({ error: "objectPosition required" });
  let doc = await CoverPhoto.findOne();
  if (!doc) {
    return res.status(404).json({ error: "Cover photo not found" });
  }
  doc.objectPosition = objectPosition;
  await doc.save();
  res.json(doc);
}

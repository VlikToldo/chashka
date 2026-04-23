import CoverPhoto from "../../models/CoverPhoto.js";

export async function getCoverPhoto(_req, res) {
  let doc = await CoverPhoto.findOne();
  if (!doc) doc = await CoverPhoto.create({ image: null });
  res.json(doc);
}

export async function uploadCoverPhoto(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  const imageUrl = req.file.path; // Cloudinary URL
  let doc = await CoverPhoto.findOne();
  if (doc) {
    doc.image = imageUrl;
    await doc.save();
  } else {
    doc = await CoverPhoto.create({ image: imageUrl });
  }
  res.json(doc);
}

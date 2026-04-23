import CoverPhoto from "../../models/CoverPhoto.js";

export async function getCoverPhoto(_req, res) {
  const doc = await CoverPhoto.findOne();
  res.json(doc ?? { image: null });
}

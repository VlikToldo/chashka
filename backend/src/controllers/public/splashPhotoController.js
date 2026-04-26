import SplashPhoto from "../../models/SplashPhoto.js";

export async function getSplashPhoto(_req, res) {
  let doc = await SplashPhoto.findOne();
  if (!doc) doc = { image: null, enabled: false };
  res.json(doc);
}

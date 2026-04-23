import Venue from "../../models/Venue.js";

export async function getVenue(_req, res) {
  let doc = await Venue.findOne();
  if (!doc) doc = await Venue.create({ address: { uk: "", en: "", es: "" }, phone: "" });
  res.json(doc);
}

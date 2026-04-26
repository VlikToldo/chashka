import Venue from "../../models/Venue.js";
import { translateToAllLanguages } from "../../services/translationService.js";

async function getOrCreateVenue() {
  let doc = await Venue.findOne();
  if (!doc) doc = await Venue.create({ address: { uk: "", en: "", es: "" }, phone: "" });
  return doc;
}

export async function getVenue(_req, res) {
  const doc = await getOrCreateVenue();
  res.json(doc);
}

export async function updateVenue(req, res) {
  const { address, phone, mapEmbedUrl, instagramUrl } = req.body;
  const update = {};

  if (address !== undefined) {
    update.address = address.trim()
      ? await translateToAllLanguages(address)
      : { uk: "", en: "", es: "" };
  }
  if (phone !== undefined) update.phone = phone;
  if (mapEmbedUrl !== undefined) update.mapEmbedUrl = mapEmbedUrl;
  if (instagramUrl !== undefined) update.instagramUrl = instagramUrl;

  let doc = await Venue.findOneAndUpdate({}, update, { new: true });
  if (!doc) {
    const createData = {};
    if (address !== undefined) {
      createData.address = address.trim()
        ? await translateToAllLanguages(address)
        : { uk: "", en: "", es: "" };
    }
    if (phone !== undefined) createData.phone = phone;
    if (mapEmbedUrl !== undefined) createData.mapEmbedUrl = mapEmbedUrl;
    if (instagramUrl !== undefined) createData.instagramUrl = instagramUrl;
    doc = await Venue.create(createData);
  }
  res.json(doc);
}

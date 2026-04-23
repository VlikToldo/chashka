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
  const { address, phone } = req.body;
  const update = {};

  if (address !== undefined) update.address = await translateToAllLanguages(address);
  if (phone !== undefined) update.phone = phone;

  let doc = await Venue.findOneAndUpdate({}, update, { new: true });
  if (!doc) {
    const createData = {};
    if (address !== undefined) createData.address = await translateToAllLanguages(address);
    if (phone !== undefined) createData.phone = phone;
    doc = await Venue.create(createData);
  }
  res.json(doc);
}

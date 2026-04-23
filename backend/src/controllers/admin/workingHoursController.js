import WorkingHours from "../../models/WorkingHours.js";

export async function getWorkingHours(_req, res) {
  let doc = await WorkingHours.findOne();
  if (!doc) doc = await WorkingHours.create({ slots: [] });
  res.json(doc);
}

export async function updateWorkingHours(req, res) {
  const { slots } = req.body;
  let doc = await WorkingHours.findOne();
  if (doc) {
    doc.slots = slots;
    await doc.save();
  } else {
    doc = await WorkingHours.create({ slots });
  }
  res.json(doc);
}

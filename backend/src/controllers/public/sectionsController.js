import Section from "../../models/Section.js";

export async function getSections(_req, res) {
  const sections = await Section.find().sort({ order: 1 });
  res.json(sections);
}

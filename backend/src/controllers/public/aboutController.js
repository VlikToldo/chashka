import AboutBlock from "../../models/AboutBlock.js";

export async function getAbout(_req, res) {
  const blocks = await AboutBlock.find().sort({ order: 1 });
  res.json(blocks);
}

import AboutBlock from "../../models/AboutBlock.js";

function normalizeBlock(block) {
  const obj = block.toObject ? block.toObject() : block;
  if ((!obj.images || obj.images.length === 0) && obj.image) {
    obj.images = [{ url: obj.image, position: obj.imagePosition || "{}" }];
  }
  obj.images = obj.images ?? [];
  return obj;
}

export async function getAbout(_req, res) {
  const blocks = await AboutBlock.find().sort({ order: 1 });
  res.json(blocks.map(normalizeBlock));
}

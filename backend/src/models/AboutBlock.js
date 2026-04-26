import mongoose from "mongoose";

const multilingualString = (required = false) => ({
  uk: { type: String, required },
  en: { type: String },
  es: { type: String },
});

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    position: { type: String, default: "{}" },
  },
  { _id: false },
);

const aboutBlockSchema = new mongoose.Schema({
  title: multilingualString(false),
  text: multilingualString(true),
  images: { type: [imageSchema], default: [] },
  // Legacy fields — kept for backward compatibility with old documents
  image: { type: String },
  imagePosition: { type: String, default: "{}" },
  order: { type: Number, default: 0 },
});

export default mongoose.model("AboutBlock", aboutBlockSchema);

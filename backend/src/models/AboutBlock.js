import mongoose from "mongoose";

const multilingualString = (required = false) => ({
  uk: { type: String, required },
  en: { type: String },
  es: { type: String },
});

const aboutBlockSchema = new mongoose.Schema({
  title: multilingualString(true),
  text: multilingualString(true),
  image: { type: String },
  order: { type: Number, default: 0 },
});

export default mongoose.model("AboutBlock", aboutBlockSchema);

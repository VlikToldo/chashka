import mongoose from "mongoose";

const multilingualString = (required = false) => ({
  uk: { type: String, required },
  en: { type: String },
  es: { type: String },
});

const sectionSchema = new mongoose.Schema({
  name: multilingualString(true),
  category: { type: String, enum: ["food", "drinks"], default: "food" },
  order: { type: Number, default: 0 },
});

export default mongoose.model("Section", sectionSchema);

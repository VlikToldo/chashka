import mongoose from "mongoose";

const multilingualString = (required = false) => ({
  uk: { type: String, required },
  en: { type: String },
  es: { type: String },
});

const menuItemSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  name: multilingualString(true),
  price: { type: String, required: true },
  ingredients: multilingualString(),
  allergens: multilingualString(),
  yield: multilingualString(),
  image: { type: String },
  order: { type: Number, default: 0 },
});

export default mongoose.model("MenuItem", menuItemSchema);

import mongoose from "mongoose";

const multilingualString = (required = false) => ({
  uk: { type: String, required },
  en: { type: String },
  es: { type: String },
});

const venueSchema = new mongoose.Schema({
  address: multilingualString(),
  phone: { type: String, default: "" },
  mapEmbedUrl: { type: String, default: "" },
  instagramUrl: { type: String, default: "" },
});

export default mongoose.model("Venue", venueSchema);

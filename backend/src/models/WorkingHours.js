import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  days: [{ type: String }],
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true },
});

const workingHoursSchema = new mongoose.Schema({
  _singleton: {
    type: String,
    default: "singleton",
    unique: true,
    immutable: true,
  },
  slots: [slotSchema],
});

export default mongoose.model("WorkingHours", workingHoursSchema);

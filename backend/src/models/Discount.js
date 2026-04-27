import mongoose from "mongoose";

const scheduleSlotSchema = new mongoose.Schema(
  {
    days: {
      type: [
        {
          type: String,
          enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        },
      ],
      default: [],
    },
    startTime: { type: String, default: "00:00" }, // HH:MM UTC
    endTime: { type: String, default: "23:59" }, // HH:MM UTC
  },
  { _id: false },
);

const discountItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    discountPrice: { type: String, required: true },
  },
  { _id: false },
);

const discountSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    items: { type: [discountItemSchema], default: [] },
    schedule: { type: [scheduleSlotSchema], default: [] },
    utcOffset: { type: Number, default: 0 }, // hours offset from UTC (-12..+14)
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

discountSchema.index({ enabled: 1 });

export default mongoose.model("Discount", discountSchema);

import mongoose from "mongoose";

const splashPhotoSchema = new mongoose.Schema({
  _singleton: {
    type: String,
    default: "singleton",
    unique: true,
    immutable: true,
  },
  image: { type: String, default: null },
  objectPosition: { type: String, default: "{}" },
  enabled: { type: Boolean, default: true },
});

export default mongoose.model("SplashPhoto", splashPhotoSchema);

import mongoose from "mongoose";

const splashPhotoSchema = new mongoose.Schema({
  image: { type: String, default: null },
  objectPosition: { type: String, default: "{}" },
  enabled: { type: Boolean, default: true },
});

export default mongoose.model("SplashPhoto", splashPhotoSchema);

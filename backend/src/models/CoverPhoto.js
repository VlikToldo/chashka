import mongoose from "mongoose";

const coverPhotoSchema = new mongoose.Schema({
  image: { type: String },
  objectPosition: { type: String, default: "center center" }, // CSS object-position: e.g. "center top", "50% 50%", "left center"
});

export default mongoose.model("CoverPhoto", coverPhotoSchema);

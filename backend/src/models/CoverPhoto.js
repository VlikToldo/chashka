import mongoose from "mongoose";

const coverPhotoSchema = new mongoose.Schema({
  image: { type: String },
});

export default mongoose.model("CoverPhoto", coverPhotoSchema);

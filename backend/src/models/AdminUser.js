import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
});

export default mongoose.model("AdminUser", adminUserSchema);

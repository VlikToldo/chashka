import bcrypt from "bcrypt";
import AdminUser from "../../models/AdminUser.js";

export async function getProfile(req, res) {
  const user = await AdminUser.findById(req.admin.id).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

export async function updateProfile(req, res) {
  const { email, firstName, lastName } = req.body;
  const update = {};
  if (email !== undefined) update.email = email;
  if (firstName !== undefined) update.firstName = firstName;
  if (lastName !== undefined) update.lastName = lastName;

  const user = await AdminUser.findByIdAndUpdate(req.admin.id, update, {
    new: true,
  }).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res
      .status(400)
      .json({ error: "currentPassword and newPassword required" });

  const user = await AdminUser.findById(req.admin.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Wrong password" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true });
}

import crypto from "crypto";
import bcrypt from "bcrypt";
import AdminUser from "../../models/AdminUser.js";
import { sendEmailChangeVerification } from "../../services/emailService.js";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getProfile(req, res) {
  const user = await AdminUser.findById(req.admin.id).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

export async function updateProfile(req, res) {
  const { email, firstName, lastName } = req.body;
  const user = await AdminUser.findById(req.admin.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Update name fields directly
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;

  // Handle email change via pending flow
  if (email !== undefined && email !== user.email) {
    const taken = await AdminUser.findOne({ email, _id: { $ne: user._id } });
    if (taken) {
      return res
        .status(409)
        .json({ message: "Цей email вже використовується" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.pendingEmail = email;
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save pendingEmail first — email sending is best-effort
    await user.save();

    try {
      await sendEmailChangeVerification(email, verificationToken);
    } catch (e) {
      console.warn(
        "[profile] Failed to send email change verification:",
        e.message,
      );
    }

    const result = user.toObject();
    delete result.passwordHash;
    return res.json(result);
  }

  await user.save();
  const result = user.toObject();
  delete result.passwordHash;
  res.json(result);
}

export async function resendEmailChangeVerification(req, res) {
  const user = await AdminUser.findById(req.admin.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.pendingEmail) {
    return res.status(400).json({ message: "Немає очікуючої зміни email" });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  try {
    await sendEmailChangeVerification(user.pendingEmail, verificationToken);
    res.json({ success: true });
  } catch (e) {
    console.warn(
      "[profile] Failed to resend email change verification:",
      e.message,
    );
    res
      .status(500)
      .json({
        message: "Не вдалося надіслати лист. Перевірте налаштування SMTP.",
      });
  }
}

export async function cancelEmailChange(req, res) {
  const user = await AdminUser.findById(req.admin.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.pendingEmail = null;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  const result = user.toObject();
  delete result.passwordHash;
  res.json(result);
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
  if (!valid)
    return res.status(401).json({ message: "Невірний поточний пароль" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true });
}

export async function deleteAccount(req, res) {
  const { password } = req.body;

  const adminCount = await AdminUser.countDocuments();
  if (adminCount <= 1) {
    return res
      .status(403)
      .json({ error: "Неможливо видалити єдиний адміністраторський акаунт" });
  }

  const user = await AdminUser.findById(req.admin.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Невірний пароль" });

  await AdminUser.findByIdAndDelete(user._id);
  res.json({ success: true });
}

import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AdminUser from "../../models/AdminUser.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../services/emailService.js";

const MAX_ADMINS = 3;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function register(req, res) {
  const { email, password, secretCode } = req.body;

  if (secretCode !== process.env.ADMIN_REGISTER_CODE) {
    return res.status(403).json({ error: "Invalid registration code" });
  }

  const count = await AdminUser.countDocuments();
  if (count >= MAX_ADMINS) {
    return res.status(403).json({ error: "Maximum number of admins reached" });
  }

  const existing = await AdminUser.findOne({ email });
  if (existing)
    return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = await AdminUser.create({
    email,
    passwordHash,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (e) {
    console.warn("[auth] Failed to send verification email:", e.message);
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.status(201).json({
    token,
    user: { _id: user._id, email: user.email, emailVerified: false },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const user = await AdminUser.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({
    token,
    user: {
      _id: user._id,
      email: user.email,
      emailVerified: user.emailVerified,
    },
  });
}

export async function verifyEmail(req, res) {
  const { token } = req.params;
  const hashed = hashToken(token);

  const user = await AdminUser.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user)
    return res
      .status(400)
      .json({ error: "Invalid or expired verification link" });

  // If this was an email change verification, promote pendingEmail → email
  if (user.pendingEmail) {
    user.email = user.pendingEmail;
    user.pendingEmail = null;
  }
  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  res.json({ success: true });
}

export async function resendVerification(req, res) {
  const user = await AdminUser.findById(req.admin.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.emailVerified)
    return res.status(400).json({ error: "Email already verified" });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);
  res.json({ success: true });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;

  // Always return success to prevent email enumeration
  const user = await AdminUser.findOne({ email });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (e) {
      console.warn("[auth] Failed to send reset email:", e.message);
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      return res.status(500).json({ error: "Failed to send email" });
    }
  }

  res.json({ success: true });
}

export async function resetPassword(req, res) {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await AdminUser.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user)
    return res.status(400).json({ error: "Invalid or expired reset link" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.json({ success: true });
}

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AdminUser from "../../models/AdminUser.js";

const MAX_ADMINS = 3;

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
  const user = await AdminUser.create({ email, passwordHash });
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.status(201).json({ token, user: { _id: user._id, email: user.email } });
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
  res.json({ token, user: { _id: user._id, email: user.email } });
}

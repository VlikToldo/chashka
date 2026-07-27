import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import sectionsPublicRouter from "./routes/public/sections.js";
import menuPublicRouter from "./routes/public/menu.js";
import aboutPublicRouter from "./routes/public/about.js";
import coverPhotoPublicRouter from "./routes/public/coverPhoto.js";
import venuePublicRouter from "./routes/public/venue.js";
import workingHoursPublicRouter from "./routes/public/workingHours.js";
import splashPhotoPublicRouter from "./routes/public/splashPhoto.js";
import discountsPublicRouter from "./routes/public/discounts.js";

import authAdminRouter from "./routes/admin/auth.js";
import profileAdminRouter from "./routes/admin/profile.js";
import sectionsAdminRouter from "./routes/admin/sections.js";
import menuItemsAdminRouter from "./routes/admin/menuItems.js";
import workingHoursAdminRouter from "./routes/admin/workingHours.js";
import coverPhotoAdminRouter from "./routes/admin/coverPhoto.js";
import aboutAdminRouter from "./routes/admin/about.js";
import venueAdminRouter from "./routes/admin/venue.js";
import splashPhotoAdminRouter from "./routes/admin/splashPhoto.js";
import discountsAdminRouter from "./routes/admin/discounts.js";

import { authenticateAdmin } from "./middleware/authenticateAdmin.js";

// ── Env validation ────────────────────────────────────────────────────────────
const REQUIRED_ENV = ["JWT_SECRET", "MONGODB_URI", "ADMIN_REGISTER_CODE"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[startup] Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

if (!process.env.DEEPL_API_KEY) {
  console.warn(
    "[startup] DEEPL_API_KEY is not set — translations will fall back to the source language",
  );
}

if (process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGIN) {
  console.error(
    "[startup] ALLOWED_ORIGIN is not set — all cross-origin requests will be blocked. Set ALLOWED_ORIGIN to allow your frontend.",
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Render/other PaaS run behind reverse proxies; trust proxy to get real client IP.
// This is required for express-rate-limit to avoid treating all users as one IP.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.length === 0) {
        // No whitelist configured — block all cross-origin requests
        return callback(new Error("CORS: ALLOWED_ORIGIN is not configured"));
      }
      // Allow same-origin (no Origin header) or configured origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(
          `CORS: origin '${origin}' is not allowed. Allowed: ${allowedOrigins.join(", ")}`,
        ),
      );
    },
  }),
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Public routes
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/sections", sectionsPublicRouter);
app.use("/api/menu", menuPublicRouter);
app.use("/api/about", aboutPublicRouter);
app.use("/api/cover-photo", coverPhotoPublicRouter);
app.use("/api/venue", venuePublicRouter);
app.use("/api/working-hours", workingHoursPublicRouter);
app.use("/api/splash", splashPhotoPublicRouter);
app.use("/api/discounts", discountsPublicRouter);

// Admin auth (no middleware)
app.use("/api/admin", authAdminRouter);
app.use("/api/admin", profileAdminRouter);

// Admin protected routes
app.use("/api/admin/sections", authenticateAdmin, sectionsAdminRouter);
app.use("/api/admin/menu-items", authenticateAdmin, menuItemsAdminRouter);
app.use("/api/admin/working-hours", authenticateAdmin, workingHoursAdminRouter);
app.use("/api/admin/cover-photo", authenticateAdmin, coverPhotoAdminRouter);
app.use("/api/admin/about", authenticateAdmin, aboutAdminRouter);
app.use("/api/admin/venue", authenticateAdmin, venueAdminRouter);
app.use("/api/admin/splash", authenticateAdmin, splashPhotoAdminRouter);
app.use("/api/admin/discounts", authenticateAdmin, discountsAdminRouter);

// ── Centralized error handler ─────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";
  if (status >= 500) {
    console.error("[error]", err);
  }
  res.status(status).json({ error: message });
});
// ─────────────────────────────────────────────────────────────────────────────

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

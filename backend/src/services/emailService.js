import nodemailer from "nodemailer";

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const APP_BASE_URL =
  process.env.APP_BASE_URL || allowedOrigins[0] || "http://localhost:5173";
const FROM = process.env.SMTP_FROM || "noreply@chashka.com.es";
const RESEND_API_KEY = process.env.RESEND_API_KEY || null;

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function extractEmailDomain(fromValue) {
  const match =
    fromValue.match(/<([^>]+)>/) || fromValue.match(/([^\s<>@]+@[^\s<>@]+)/);
  const email = match?.[1] || match?.[0];
  if (!email || !email.includes("@")) return null;
  return email.split("@")[1].toLowerCase();
}

async function sendViaResendApi({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `Resend API error (${response.status}): ${data?.message || data?.error || "Unknown error"}`,
    );
  }
}

async function sendEmail({ to, subject, html }) {
  if (RESEND_API_KEY) {
    await sendViaResendApi({ to, subject, html });
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
  });
}

export async function checkEmailTransport() {
  if (RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        `Resend API auth failed (${response.status}): ${data?.message || data?.error || "Unknown error"}`,
      );
    }

    const fromDomain = extractEmailDomain(FROM);
    const domains = Array.isArray(data?.data) ? data.data : [];
    if (fromDomain && domains.length > 0) {
      const domain = domains.find((item) => item?.name === fromDomain);
      if (!domain) {
        throw new Error(
          `Resend domain '${fromDomain}' is not found in account domains`,
        );
      }
      if (String(domain.status).toLowerCase() !== "verified") {
        throw new Error(
          `Resend domain '${fromDomain}' status is '${domain.status}', expected 'verified'`,
        );
      }
    }

    return { channel: "resend-api" };
  }

  const transporter = createTransporter();
  await transporter.verify();
  return { channel: "smtp" };
}

export async function sendVerificationEmail(to, token) {
  const url = `${APP_BASE_URL}/admin/verify-email/${token}`;
  await sendEmail({
    to,
    subject: "CHASHKA — підтвердіть email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="font-weight:300;letter-spacing:0.1em">CHASHKA</h2>
        <p>Для підтвердження вашої електронної адреси перейдіть за посиланням:</p>
        <p><a href="${url}" style="color:#1a1a1a">${url}</a></p>
        <p style="color:#888;font-size:0.85em">Посилання дійсне 24 години.<br>Якщо ви не реєструвались — проігноруйте цей лист.</p>
      </div>
    `,
  });
}

export async function sendEmailChangeVerification(to, token) {
  const url = `${APP_BASE_URL}/admin/verify-email/${token}`;
  await sendEmail({
    to,
    subject: "CHASHKA — підтвердіть новий email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="font-weight:300;letter-spacing:0.1em">CHASHKA</h2>
        <p>Для підтвердження нової електронної адреси перейдіть за посиланням:</p>
        <p><a href="${url}" style="color:#1a1a1a">${url}</a></p>
        <p style="color:#888;font-size:0.85em">Посилання дійсне 24 години.<br>Якщо ви не змінювали email — проігноруйте цей лист.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const url = `${APP_BASE_URL}/admin/reset-password/${token}`;
  await sendEmail({
    to,
    subject: "CHASHKA — відновлення пароля",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="font-weight:300;letter-spacing:0.1em">CHASHKA</h2>
        <p>Для встановлення нового пароля перейдіть за посиланням:</p>
        <p><a href="${url}" style="color:#1a1a1a">${url}</a></p>
        <p style="color:#888;font-size:0.85em">Посилання дійсне 1 годину.<br>Якщо ви не запитували відновлення пароля — проігноруйте цей лист.</p>
      </div>
    `,
  });
}

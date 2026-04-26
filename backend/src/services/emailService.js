import nodemailer from "nodemailer";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
const FROM = process.env.SMTP_FROM || "noreply@chashka.cafe";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail(to, token) {
  const url = `${ALLOWED_ORIGIN}/admin/verify-email/${token}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
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
  const url = `${ALLOWED_ORIGIN}/admin/verify-email/${token}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
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
  const url = `${ALLOWED_ORIGIN}/admin/reset-password/${token}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
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

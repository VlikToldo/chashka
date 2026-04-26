import "dotenv/config";

const API_KEY = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM;
const TO = "YOUR_EMAIL@HERE.COM"; // <-- замініть на свій email

console.log("Resend API key length:", API_KEY?.length);
console.log("From:", FROM);
console.log("To:", TO);

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: FROM,
    to: [TO],
    subject: "Test CHASHKA",
    html: "<p>Тест — якщо бачите це, все працює.</p>",
  }),
});

const data = await res.json();
if (res.ok) {
  console.log("✓ Відправлено! ID:", data.id);
} else {
  console.error("✗ Помилка:", data);
}

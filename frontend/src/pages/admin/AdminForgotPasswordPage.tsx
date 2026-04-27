import { useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminForgotPasswordPage() {
  const { t } = useLanguage();
  const a = t.auth;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            to="/admin/login"
            className="inline-block text-xs tracking-[0.15em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors mb-6"
          >
            {a.toLogin}
          </Link>
          <div>
            <Link to="/" className="text-2xl font-light tracking-[0.3em]">
              CHASHKA
            </Link>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
              {a.forgotPasswordTitle}
            </p>
          </div>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-foreground">{a.forgotSent}</p>
            <Link
              to="/admin/login"
              className="block text-xs tracking-wide uppercase underline text-muted-foreground hover:text-foreground transition-colors"
            >
              {a.backToLogin}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground text-center mb-8">
              {a.forgotDesc}
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs tracking-wide uppercase text-muted-foreground">
                  {a.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-foreground text-background text-sm tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                {loading ? a.sending : a.sendLinkBtn}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

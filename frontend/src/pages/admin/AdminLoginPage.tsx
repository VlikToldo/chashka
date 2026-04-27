import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import PasswordInput from "../../components/ui/PasswordInput";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const a = t.auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const successMessage = (location.state as { message?: string } | null)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await adminService.login(email, password);
      login(token, user);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка входу. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-block text-xs tracking-[0.15em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors mb-6"
          >
            {a.toSite}
          </Link>
          <div>
            <Link to="/" className="text-2xl font-light tracking-[0.3em]">
              CHASHKA
            </Link>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
              {a.adminPanel}
            </p>
          </div>
        </div>

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
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs tracking-wide uppercase text-muted-foreground">
                {a.passwordLabel}
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {a.forgotPasswordLink}
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
          </div>

          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-foreground text-background text-sm tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {loading ? a.signingIn : a.signInBtn}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          {a.noAccount}{" "}
          <Link
            to="/admin/register"
            className="underline hover:text-foreground transition-colors"
          >
            {a.registerLink}
          </Link>
        </p>

        <div className="text-center mt-6"></div>
      </div>
    </main>
  );
}

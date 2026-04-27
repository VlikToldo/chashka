import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import PasswordInput from "../../components/ui/PasswordInput";

const isValidPassword = (v: string) => v.length >= 8 && /\d/.test(v);

export default function AdminResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const a = t.auth;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidPassword(newPassword)) {
      setError(a.weakPassword);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(a.passwordMismatch);
      return;
    }
    if (!token) {
      setError(a.invalidResetLink);
      return;
    }

    setLoading(true);
    try {
      await adminService.resetPassword(token, newPassword);
      navigate("/admin/login", {
        state: { message: "Пароль змінено. Увійдіть з новим паролем." },
      });
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
              {a.newPasswordTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              {a.newPasswordLabel}
            </label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder={a.passwordHint}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              {a.confirmPasswordLabel}
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-foreground text-background text-sm tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {loading ? a.saving : a.savePasswordBtn}
          </button>
        </form>
      </div>
    </main>
  );
}

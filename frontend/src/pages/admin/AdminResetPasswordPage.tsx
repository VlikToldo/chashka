import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminService } from "../../services/adminService";
import PasswordInput from "../../components/ui/PasswordInput";

const isValidPassword = (v: string) => v.length >= 8 && /\d/.test(v);

export default function AdminResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidPassword(newPassword)) {
      setError("Пароль має бути мінімум 8 символів та містити хоча б одну цифру");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }
    if (!token) {
      setError("Невірне посилання для відновлення");
      return;
    }

    setLoading(true);
    try {
      await adminService.resetPassword(token, newPassword);
      navigate("/admin/login", {
        state: { message: "Пароль змінено. Увійдіть з новим паролем." },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка. Спробуйте ще раз.",
      );
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
            ← До входу
          </Link>
          <div>
            <Link to="/" className="text-2xl font-light tracking-[0.3em]">
              CHASHKA
            </Link>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
              Новий пароль
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Новий пароль
            </label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Мінімум 8 символів та одна цифра"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Підтвердіть пароль
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
            {loading ? "Збереження..." : "Зберегти пароль"}
          </button>
        </form>
      </div>
    </main>
  );
}

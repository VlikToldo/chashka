import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import PasswordInput from "../../components/ui/PasswordInput";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const isValidPassword = (v: string) => v.length >= 8 && /\d/.test(v);

export default function AdminRegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Введіть коректний email (наприклад admin@example.com)");
      return;
    }
    if (!isValidPassword(password)) {
      setError("Пароль має бути мінімум 8 символів та містити хоча б одну цифру");
      return;
    }
    if (password !== confirm) {
      setError("Паролі не збігаються");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await adminService.register(email, password, secretCode);
      login(token, user);
      navigate("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка реєстрації. Спробуйте ще раз.",
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
            to="/"
            className="inline-block text-xs tracking-[0.15em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors mb-6"
          >
            ← На сайт
          </Link>
          <div>
            <Link to="/" className="text-2xl font-light tracking-[0.3em]">
              CHASHKA
            </Link>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
              Реєстрація
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Email
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
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Пароль
            </label>
            <PasswordInput
              value={password}
              onChange={setPassword}
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
              value={confirm}
              onChange={setConfirm}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Секретний код доступу
            </label>
            <PasswordInput
              value={secretCode}
              onChange={setSecretCode}
              required
              autoComplete="off"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-foreground text-background text-sm tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {loading ? "Реєстрація..." : "Зареєструватись"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Вже є акаунт?{" "}
          <Link
            to="/admin/login"
            className="underline hover:text-foreground transition-colors"
          >
            Увійти
          </Link>
        </p>
      </div>
    </main>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AdminRegisterPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Паролі не збігаються");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await adminService.register(email, password, secretCode);
      login(token, user);
      navigate("/admin");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.error ?? "";

        if (status === 403) {
          if (message === "Maximum number of admins reached") {
            showToast("Доступ заблоковано: досягнуто максимальну кількість адмінів (3)", "warning");
          } else {
            showToast("Доступ заблоковано: невірний секретний код", "warning");
          }
          return;
        }
        if (status === 409) {
          setError("Цей email вже зареєстровано");
          return;
        }
      }
      setError("Помилка реєстрації. Спробуйте ще раз.");
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
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Пароль
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors"
              placeholder="Мінімум 6 символів"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Підтвердіть пароль
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              Секретний код доступу
            </label>
            <input
              type="password"
              required
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors"
              placeholder="••••••••"
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

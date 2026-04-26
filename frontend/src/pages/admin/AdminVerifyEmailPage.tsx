import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminService } from "../../services/adminService";

type Status = "loading" | "success" | "error";

export default function AdminVerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    adminService
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div>
          <Link to="/" className="text-2xl font-light tracking-[0.3em]">
            CHASHKA
          </Link>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
            Підтвердження email
          </p>
        </div>

        {status === "loading" && (
          <p className="text-sm text-muted-foreground">Перевіряємо...</p>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Email успішно підтверджено!
            </p>
            <Link
              to="/admin"
              className="block text-xs tracking-wide uppercase underline text-muted-foreground hover:text-foreground transition-colors"
            >
              До адмін панелі
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-sm text-red-500">
              Посилання недійсне або застаріло.
            </p>
            <Link
              to="/admin"
              className="block text-xs tracking-wide uppercase underline text-muted-foreground hover:text-foreground transition-colors"
            >
              До адмін панелі
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

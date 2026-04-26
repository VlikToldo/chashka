import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { VenueProvider } from "./context/VenueContext";
import { ToastProvider } from "./context/ToastContext";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/admin/AdminPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import AdminForgotPasswordPage from "./pages/admin/AdminForgotPasswordPage";
import AdminResetPasswordPage from "./pages/admin/AdminResetPasswordPage";
import AdminVerifyEmailPage from "./pages/admin/AdminVerifyEmailPage";
import PrivateRoute from "./components/PrivateRoute";
import SplashScreen from "./components/SplashScreen";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <VenueProvider>
            <BrowserRouter>
              <ScrollToTop />
              <SplashScreen />
              <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/register" element={<AdminRegisterPage />} />
                <Route
                  path="/admin/forgot-password"
                  element={<AdminForgotPasswordPage />}
                />
                <Route
                  path="/admin/reset-password/:token"
                  element={<AdminResetPasswordPage />}
                />
                <Route
                  path="/admin/verify-email/:token"
                  element={<AdminVerifyEmailPage />}
                />
              </Routes>
            </BrowserRouter>
          </VenueProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

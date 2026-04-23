import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { VenueProvider } from "./context/VenueContext";
import { ToastProvider } from "./context/ToastContext";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/admin/AdminPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
      <AuthProvider>
        <VenueProvider>
          <BrowserRouter>
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
            </Routes>
          </BrowserRouter>
        </VenueProvider>
      </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

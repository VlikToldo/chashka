import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import axios from "axios";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import Loader from "../ui/Loader";
import type { AdminProfile } from "../../types/admin";

const inputClass =
  "w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors";
const labelClass = "text-xs tracking-wide uppercase text-muted-foreground";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium tracking-wide uppercase border-b border-border pb-2 mb-4">
      {children}
    </h3>
  );
}

export default function ProfileManager() {
  const { t } = useLanguage();
  const p = t.admin.profile;
  const c = t.admin.common;

  const [profile, setProfile] = useState<AdminProfile>({
    _id: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(true);

  // Password state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [savingPw, setSavingPw] = useState(false);
  const [savedPw, setSavedPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      const updated = await adminService.updateProfile({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      setProfile(updated);
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } catch {
      setProfileError(c.errorSave);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError(p.passwordMismatch);
      return;
    }
    setSavingPw(true);
    setPwError(null);
    try {
      await adminService.changePassword(
        pwForm.currentPassword,
        pwForm.newPassword,
      );
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSavedPw(true);
      setTimeout(() => setSavedPw(false), 2500);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : c.errorSave;
      setPwError(msg);
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-12 max-w-2xl">
      {/* Personal info */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <SectionTitle>{p.personalTitle}</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>{p.firstName}</label>
            <input
              value={profile.firstName}
              onChange={(e) =>
                setProfile((f) => ({ ...f, firstName: e.target.value }))
              }
              className={inputClass}
              placeholder={p.firstName}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{p.lastName}</label>
            <input
              value={profile.lastName}
              onChange={(e) =>
                setProfile((f) => ({ ...f, lastName: e.target.value }))
              }
              className={inputClass}
              placeholder={p.lastName}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>{p.email}</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((f) => ({ ...f, email: e.target.value }))
            }
            className={inputClass}
            placeholder="email@example.com"
            required
          />
        </div>

        {profileError && <p className="text-sm text-red-500">{profileError}</p>}

        <button
          type="submit"
          disabled={savingProfile}
          className="flex items-center gap-1.5 px-5 py-2 bg-foreground text-background text-xs tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {savedProfile ? <Check size={14} /> : <Save size={14} />}
          {savingProfile ? c.saving : savedProfile ? c.saved : c.save}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={handleSavePassword} className="space-y-4">
        <SectionTitle>{p.passwordTitle}</SectionTitle>

        <div className="space-y-1">
          <label className={labelClass}>{p.currentPassword}</label>
          <input
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) =>
              setPwForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
            className={inputClass}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>{p.newPassword}</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{p.confirmPassword}</label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              className={inputClass}
              required
            />
          </div>
        </div>

        {pwError && <p className="text-sm text-red-500">{pwError}</p>}

        <button
          type="submit"
          disabled={savingPw}
          className="flex items-center gap-1.5 px-5 py-2 bg-foreground text-background text-xs tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {savedPw ? <Check size={14} /> : <Save size={14} />}
          {savingPw ? c.saving : savedPw ? c.saved : c.save}
        </button>
      </form>

    </div>
  );
}

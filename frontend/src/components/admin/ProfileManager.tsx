import { useState, useEffect } from "react";
import { Save, Check, Mail, ShieldCheck } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import SectionTitle from "../ui/SectionTitle";
import type { AdminProfile } from "../../types/admin";

const inputClass =
  "w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors";
const labelClass = "text-xs tracking-wide uppercase text-muted-foreground";

export default function ProfileManager() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const p = t.admin.profile;
  const c = t.admin.common;

  const [profile, setProfile] = useState<AdminProfile>({
    _id: "",
    email: "",
    firstName: "",
    lastName: "",
    emailVerified: false,
  });
  const [loading, setLoading] = useState(true);

  // Resend verification
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

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

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await adminService.resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setResending(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.email.trim()) {
      setProfileError(c.errorSave);
      return;
    }
    setSavingProfile(true);
    setProfileError(null);
    try {
      const updated = await adminService.updateProfile({
        email: profile.email.trim(),
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
      });
      setProfile(updated);
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
      showToast(c.saved, "success");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : c.errorSave);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !pwForm.currentPassword.trim() ||
      !pwForm.newPassword.trim() ||
      !pwForm.confirmPassword.trim()
    ) {
      setPwError(c.errorSave);
      return;
    }
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
      showToast(c.saved, "success");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : c.errorSave);
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-12 max-w-2xl admin-fade-in">
      {/* Email verification banner */}
      {!profile.emailVerified && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded px-4 py-3 text-sm">
          <Mail size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-amber-800">{p.emailNotVerifiedBanner}</p>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resending || resent}
            className="text-xs underline text-amber-700 hover:text-amber-900 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {resent ? p.resent : resending ? "..." : p.resendVerification}
          </button>
        </div>
      )}

      {profile.emailVerified && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <ShieldCheck size={15} />
          <span>{p.emailVerifiedStatus}</span>
        </div>
      )}

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

        <Button type="submit" disabled={savingProfile} className="px-5 py-2">
          {savedProfile ? <Check size={14} /> : <Save size={14} />}
          {savingProfile ? c.saving : savedProfile ? c.saved : c.save}
        </Button>
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

        <Button type="submit" disabled={savingPw} className="px-5 py-2">
          {savedPw ? <Check size={14} /> : <Save size={14} />}
          {savingPw ? c.saving : savedPw ? c.saved : c.save}
        </Button>
      </form>
    </div>
  );
}

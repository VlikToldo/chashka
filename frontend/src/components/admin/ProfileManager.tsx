import { useState, useEffect } from "react";
import { Save, Check, Mail, ShieldCheck, X, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import SectionTitle from "../ui/SectionTitle";
import PasswordInput from "../ui/PasswordInput";
import type { AdminProfile } from "../../types/admin";

const inputClass =
  "w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors";
const labelClass = "text-xs tracking-wide uppercase text-muted-foreground";

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const isValidPassword = (v: string) => v.length >= 8 && /\d/.test(v);

export default function ProfileManager() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const p = t.admin.profile;
  const c = t.admin.common;

  const [profile, setProfile] = useState<AdminProfile>({
    _id: "",
    email: "",
    pendingEmail: undefined,
    firstName: "",
    lastName: "",
    emailVerified: false,
  });
  const [loading, setLoading] = useState(true);

  // Resend verification
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Email change form
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cancellingEmail, setCancellingEmail] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resentEmail, setResentEmail] = useState(false);

  // Name form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savedName, setSavedName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Password form
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);
  const [savedPw, setSavedPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Delete account form
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
      })
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

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setNameError(null);
    try {
      const updated = await adminService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setProfile(updated);
      setSavedName(true);
      setTimeout(() => setSavedName(false), 2500);
      showToast(c.saved, "success");
    } catch (err) {
      setNameError(err instanceof Error ? err.message : c.errorSave);
    } finally {
      setSavingName(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailChangeSent(false);

    if (!isValidEmail(newEmail)) {
      setEmailError("Введіть коректний email (наприклад admin@example.com)");
      return;
    }
    if (newEmail.trim() === profile.email) {
      setEmailError("Новий email збігається з поточним");
      return;
    }

    setSavingEmail(true);
    try {
      const updated = await adminService.updateProfile({
        email: newEmail.trim(),
      });
      setProfile(updated);
      setNewEmail("");
      setEmailChangeSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : c.errorSave);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleResendEmailChange = async () => {
    setResendingEmail(true);
    try {
      await adminService.resendEmailChange();
      setResentEmail(true);
      setTimeout(() => setResentEmail(false), 4000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleCancelEmailChange = async () => {
    setCancellingEmail(true);
    try {
      const updated = await adminService.cancelEmailChange();
      setProfile(updated);
      setEmailChangeSent(false);
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setCancellingEmail(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (!isValidPassword(pwForm.newPassword)) {
      setPwError(
        "Пароль має бути мінімум 8 символів та містити хоча б одну цифру",
      );
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError(p.passwordMismatch);
      return;
    }

    setSavingPw(true);
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

      {profile.emailVerified && !profile.pendingEmail && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <ShieldCheck size={15} />
          <span>{p.emailVerifiedStatus}</span>
        </div>
      )}

      {/* Personal info — name only */}
      <form onSubmit={handleSaveName} className="space-y-4">
        <SectionTitle>{p.personalTitle}</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>{p.firstName}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              placeholder={p.firstName}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{p.lastName}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              placeholder={p.lastName}
            />
          </div>
        </div>

        {nameError && <p className="text-sm text-red-500">{nameError}</p>}

        <Button type="submit" disabled={savingName} className="px-5 py-2">
          {savedName ? <Check size={14} /> : <Save size={14} />}
          {savingName ? c.saving : savedName ? c.saved : c.save}
        </Button>
      </form>

      {/* Email change section */}
      <div className="space-y-4">
        <SectionTitle>{p.email}</SectionTitle>

        {/* Current email */}
        <div className="space-y-1">
          <label className={labelClass}>{p.email}</label>
          <p className="py-2 text-sm border-b border-border/50">
            {profile.email}
          </p>
        </div>

        {/* Pending email banner */}
        {profile.pendingEmail && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded px-4 py-3 text-sm">
            <Mail size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-blue-800 font-medium">{p.pendingEmailNote}</p>
              <p className="text-blue-700 mt-0.5">{profile.pendingEmail}</p>
              <p className="text-blue-600 text-xs mt-1">{p.emailChangeSent}</p>
              <button
                onClick={handleResendEmailChange}
                disabled={resendingEmail || resentEmail}
                className="mt-2 text-xs underline text-blue-700 hover:text-blue-900 transition-colors disabled:opacity-50"
              >
                {resentEmail
                  ? p.resentEmailChange
                  : resendingEmail
                    ? "..."
                    : p.resendEmailChange}
              </button>
            </div>
            <button
              onClick={handleCancelEmailChange}
              disabled={cancellingEmail}
              className="shrink-0 text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
              title={p.cancelEmailChange}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Email change success message */}
        {emailChangeSent && !profile.pendingEmail && (
          <p className="text-sm text-green-700">{p.emailChangeSent}</p>
        )}

        {/* New email form — hidden while pending */}
        {!profile.pendingEmail && (
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div className="space-y-1">
              <label className={labelClass}>{p.newEmailLabel}</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={inputClass}
                placeholder="new@example.com"
                autoComplete="email"
              />
            </div>

            {emailError && <p className="text-sm text-red-500">{emailError}</p>}

            <Button
              type="submit"
              disabled={savingEmail || !newEmail.trim()}
              className="px-5 py-2"
            >
              {savingEmail ? c.saving : p.changeEmailBtn}
            </Button>
          </form>
        )}

        {/* Cancel pending — shown as text button inside the banner (X icon), also separately */}
        {profile.pendingEmail && (
          <Button
            variant="ghost"
            onClick={handleCancelEmailChange}
            disabled={cancellingEmail}
            className="px-4 py-2 text-xs"
          >
            {cancellingEmail ? c.saving : p.cancelEmailChange}
          </Button>
        )}
      </div>

      {/* Password */}
      <form onSubmit={handleSavePassword} className="space-y-4">
        <SectionTitle>{p.passwordTitle}</SectionTitle>

        <div className="space-y-1">
          <label className={labelClass}>{p.currentPassword}</label>
          <PasswordInput
            value={pwForm.currentPassword}
            onChange={(v) => setPwForm((f) => ({ ...f, currentPassword: v }))}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>{p.newPassword}</label>
            <PasswordInput
              value={pwForm.newPassword}
              onChange={(v) => setPwForm((f) => ({ ...f, newPassword: v }))}
              placeholder="Мін. 8 символів та цифра"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{p.confirmPassword}</label>
            <PasswordInput
              value={pwForm.confirmPassword}
              onChange={(v) => setPwForm((f) => ({ ...f, confirmPassword: v }))}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        {pwError && <p className="text-sm text-red-500">{pwError}</p>}

        <Button type="submit" disabled={savingPw} className="px-5 py-2">
          {savedPw ? <Check size={14} /> : <Save size={14} />}
          {savingPw ? c.saving : savedPw ? c.saved : c.save}
        </Button>
      </form>

      {/* Delete account */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setDeleteError(null);
          setDeletingAccount(true);
          try {
            await adminService.deleteAccount(deletePassword);
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            window.location.href = "/admin/login";
          } catch (err) {
            setDeleteError(err instanceof Error ? err.message : c.errorDelete);
          } finally {
            setDeletingAccount(false);
          }
        }}
        className="space-y-4 border border-red-200 rounded-lg p-5"
      >
        <SectionTitle>
          <span className="text-red-600">{p.deleteAccountTitle}</span>
        </SectionTitle>
        <p className="text-sm text-muted-foreground">{p.deleteAccountHint}</p>

        <div className="space-y-1">
          <label className={labelClass}>{p.deleteAccountPasswordLabel}</label>
          <PasswordInput
            value={deletePassword}
            onChange={setDeletePassword}
            required
            autoComplete="current-password"
          />
        </div>

        {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}

        <Button
          type="submit"
          disabled={deletingAccount || !deletePassword}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
        >
          <Trash2 size={14} />
          {deletingAccount ? p.deleteAccountDeleting : p.deleteAccountBtn}
        </Button>
      </form>
    </div>
  );
}

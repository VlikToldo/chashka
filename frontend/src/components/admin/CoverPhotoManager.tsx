import { useState, useEffect, useRef } from "react";
import { ImageIcon, Upload, Save } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import Loader from "../ui/Loader";

export default function CoverPhotoManager() {
  const { t } = useLanguage();
  const a = t.admin.cover;
  const c = t.admin.common;

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminService
      .getCoverPhoto()
      .then((data) => setCurrentImage(data.image))
      .catch(() => { /* no cover photo yet */ })
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    setSaving(true);
    setError(null);
    try {
      const { image } = await adminService.uploadCoverPhoto(pendingFile);
      setCurrentImage(image);
      setPreview(null);
      setPendingFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(c.errorSave);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const displayImage = preview ?? currentImage;

  return (
    <div className="space-y-6 max-w-2xl">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-8">
        <div
          className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer border border-border hover:border-foreground transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {displayImage ? (
            <img src={displayImage} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={32} className="text-muted-foreground" />
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs tracking-wide uppercase border-b border-border pb-0.5 hover:border-foreground transition-colors"
          >
            <Upload size={12} />
            {a.chooseBtn}
          </button>
          <p className="text-xs text-muted-foreground">{a.hint}</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {pendingFile && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-foreground text-background text-xs tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          <Save size={14} />
          {saving ? a.uploadingBtn : saved ? a.savedBtn : a.saveBtn}
        </button>
      )}
    </div>
  );
}

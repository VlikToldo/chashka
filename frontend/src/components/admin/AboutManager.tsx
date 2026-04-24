import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { localize } from "../../utils/localize";
import LocalizedInput from "./LocalizedInput";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import AdminModal from "../ui/AdminModal";
import ConfirmModal from "../ui/ConfirmModal";
import type { AboutBlock } from "../../types/about";
import type { LocalizedString } from "../../types/menu";
import { getOptimizedUrl } from "../../utils/imageUrl";

const EMPTY_L: LocalizedString = { uk: "", en: "", es: "" };
const EMPTY_FORM: Omit<AboutBlock, "_id"> = {
  title: { ...EMPTY_L },
  text: { ...EMPTY_L },
  image: "",
};

export default function AboutManager() {
  const { lang, t } = useLanguage();
  const a = t.admin.about;
  const c = t.admin.common;
  const [blocks, setBlocks] = useState<AboutBlock[]>([]);
  const [form, setForm] = useState<Omit<AboutBlock, "_id">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminService
      .getAboutBlocks()
      .then(setBlocks)
      .catch(() => setError(c.errorLoad))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setPendingFile(null);
    setShowForm(true);
  };

  const openEdit = (block: AboutBlock) => {
    setEditingId(block._id ?? null);
    setForm({ title: block.title, text: block.text, image: block.image ?? "" });
    setImagePreview(block.image ?? null);
    setPendingFile(null);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await adminService.updateAboutBlock(editingId, form);
        if (pendingFile) {
          const { image } = await adminService.uploadAboutBlockImage(
            editingId,
            pendingFile,
          );
          updated.image = image;
        }
        setBlocks((prev) =>
          prev.map((b) => (b._id === editingId ? updated : b)),
        );
      } else {
        const created = await adminService.createAboutBlock(form);
        if (pendingFile && created._id) {
          const { image } = await adminService.uploadAboutBlockImage(
            created._id,
            pendingFile,
          );
          created.image = image;
        }
        setBlocks((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch {
      setError(c.errorSave);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteAboutBlock(id);
      setBlocks((prev) => prev.filter((b) => b._id !== id));
    } catch {
      setError(c.errorDelete);
    } finally {
      setConfirmId(null);
    }
  };

  const moveBlock = async (index: number, direction: -1 | 1) => {
    const newBlocks = [...blocks];
    const target = index + direction;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[index], newBlocks[target]] = [
      newBlocks[target],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
    try {
      await adminService.reorderAboutBlocks(
        newBlocks.map((b) => b._id as string),
      );
    } catch {
      setError(c.errorSave);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button onClick={openCreate} className="px-4 py-2">
        <Plus size={14} />
        {a.addBtn}
      </Button>

      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <ul className="divide-y divide-border/50">
          {blocks.map((block, i) => (
            <li key={block._id} className="py-4 flex items-start gap-4">
              {block.image ? (
                <img
                  src={getOptimizedUrl(block.image)}
                  alt={localize(block.title, lang)}
                  loading="lazy"
                  className="w-14 h-14 object-cover rounded flex-shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-14 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={16} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {localize(block.title, lang)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-light">
                  {localize(block.text, lang)}
                </p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  disabled={i === 0}
                  onClick={() => moveBlock(i, -1)}
                  className="p-1"
                >
                  <ChevronUp size={13} />
                </Button>
                <Button
                  variant="ghost"
                  disabled={i === blocks.length - 1}
                  onClick={() => moveBlock(i, 1)}
                  className="p-1"
                >
                  <ChevronDown size={13} />
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => openEdit(block)}
                className="p-1 flex-shrink-0"
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost-danger"
                onClick={() => block._id && setConfirmId(block._id)}
                className="p-1 flex-shrink-0"
              >
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        isOpen={!!confirmId}
        message={c.confirmDelete}
        confirmLabel={c.delete ?? "Видалити"}
        cancelLabel={c.cancel}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      {/* Modal */}
      {showForm && (
        <AdminModal
          title={editingId ? a.editHeading : a.newHeading}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
            <LocalizedInput
              label={a.fields.blockTitle}
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
              placeholder={a.fields.blockTitle}
              required
            />
            <LocalizedInput
              label={a.fields.text}
              value={form.text}
              onChange={(v) => setForm((f) => ({ ...f, text: v }))}
              placeholder={a.fields.text}
              multiline
              rows={6}
              required
            />

            <div className="space-y-2">
              <label className="text-xs tracking-wide uppercase text-muted-foreground">
                {a.fields.photo}
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setPendingFile(null);
                        setForm((f) => ({ ...f, image: "" }));
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 bg-muted rounded flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <ImageIcon size={20} className="text-muted-foreground" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs tracking-wide uppercase border-b border-border pb-0.5 hover:border-foreground transition-colors"
                >
                  {c.choosePhoto}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Footer */}
            <div className="flex gap-3 pt-2 border-t border-border mt-5">
              <Button type="submit" disabled={saving} className="flex-1 py-2.5">
                {saving ? c.saving : c.save}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5"
              >
                {c.cancel}
              </Button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

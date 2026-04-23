import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { localize } from "../../utils/localize";
import LocalizedInput from "./LocalizedInput";
import Loader from "../ui/Loader";
import ConfirmModal from "../ui/ConfirmModal";
import type { Section } from "../../types/admin";
import type { LocalizedString } from "../../types/menu";

const EMPTY_NAME: LocalizedString = { uk: "", en: "", es: "" };

export default function SectionManager() {
  const { lang, t } = useLanguage();
  const a = t.admin.sections;
  const c = t.admin.common;
  const [sections, setSections] = useState<Section[]>([]);
  const [newName, setNewName] = useState<LocalizedString>(EMPTY_NAME);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<LocalizedString>(EMPTY_NAME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getSections()
      .then(setSections)
      .catch(() => setError("Не вдалося завантажити розділи"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newName.uk.trim() && !newName.en.trim() && !newName.es.trim()) return;
    try {
      const created = await adminService.createSection({ name: newName });
      setSections((prev) => [...prev, created]);
      setNewName(EMPTY_NAME);
    } catch {
      setError(c.errorSave);
    }
  };

  const handleStartEdit = (s: Section) => {
    setEditingId(s._id ?? null);
    setEditingName(s.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const updated = await adminService.updateSection(editingId, {
        name: editingName,
      });
      setSections((prev) =>
        prev.map((s) => (s._id === editingId ? updated : s)),
      );
      setEditingId(null);
    } catch {
      setError(c.errorSave);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteSection(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch {
      setError(c.errorDelete);
    } finally {
      setConfirmId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-2xl">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Add new */}
      <div className="space-y-3 border-b border-border pb-6">
        <LocalizedInput
          label={a.newLabel}
          value={newName}
          onChange={setNewName}
          placeholder={a.newLabel}
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs tracking-wide uppercase hover:opacity-80 transition-opacity"
        >
          <Plus size={14} />
          {a.addBtn}
        </button>
      </div>

      {/* List */}
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <ul className="divide-y divide-border/50">
          {sections.map((s) => (
            <li key={s._id} className="py-3">
              {editingId === s._id ? (
                <div className="space-y-3">
                  <LocalizedInput
                    label={a.editLabel}
                    value={editingName}
                    onChange={setEditingName}
                    placeholder={a.editLabel}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-sm">
                    {localize(s.name, lang)}
                  </span>
                  <button
                    onClick={() => s._id && handleStartEdit(s)}
                    className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => s._id && setConfirmId(s._id)}
                    className="p-1 hover:text-red-500 text-muted-foreground transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
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
    </div>
  );
}

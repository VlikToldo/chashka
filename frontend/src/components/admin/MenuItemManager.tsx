import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, ImageIcon } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { localize } from "../../utils/localize";
import LocalizedInput from "./LocalizedInput";
import Loader from "../ui/Loader";
import ConfirmModal from "../ui/ConfirmModal";
import type { AdminMenuItem, Section } from "../../types/admin";
import type { LocalizedString } from "../../types/menu";

const EMPTY_L: LocalizedString = { uk: "", en: "", es: "" };

const EMPTY_FORM: Omit<AdminMenuItem, "_id"> = {
  sectionId: "",
  name: { ...EMPTY_L },
  price: "",
  ingredients: { ...EMPTY_L },
  allergens: { ...EMPTY_L },
  yield: { ...EMPTY_L },
  image: "",
};

export default function MenuItemManager() {
  const { lang, t } = useLanguage();
  const a = t.admin.menu;
  const c = t.admin.common;
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [form, setForm] = useState<Omit<AdminMenuItem, "_id">>(EMPTY_FORM);
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
    Promise.all([adminService.getMenuItems(), adminService.getSections()])
      .then(([menuItems, secs]) => {
        setItems(menuItems);
        setSections(secs);
        if (secs.length > 0)
          setForm((f) => ({ ...f, sectionId: secs[0]._id ?? "" }));
      })
      .catch(() => setError(c.errorLoad))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sectionId: sections[0]?._id ?? "" });
    setImagePreview(null);
    setPendingFile(null);
    setShowForm(true);
  };

  const openEdit = (item: AdminMenuItem) => {
    setEditingId(item._id ?? null);
    setForm({
      sectionId: item.sectionId,
      name: item.name,
      price: item.price,
      ingredients: item.ingredients,
      allergens: item.allergens,
      yield: item.yield,
      image: item.image ?? "",
    });
    setImagePreview(item.image ?? null);
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
        const updated = await adminService.updateMenuItem(editingId, form);
        if (pendingFile) {
          const { image } = await adminService.uploadMenuItemImage(
            editingId,
            pendingFile,
          );
          updated.image = image;
        }
        setItems((prev) =>
          prev.map((i) => (i._id === editingId ? updated : i)),
        );
      } else {
        const created = await adminService.createMenuItem(form);
        if (pendingFile && created._id) {
          const { image } = await adminService.uploadMenuItemImage(
            created._id,
            pendingFile,
          );
          created.image = image;
        }
        setItems((prev) => [...prev, created]);
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
      await adminService.deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      setError(c.errorDelete);
    } finally {
      setConfirmId(null);
    }
  };

  const sectionName = (id: string) =>
    localize(sections.find((s) => s._id === id)?.name, lang, id);

  if (loading)
    return <Loader />;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!showForm ? (
        <>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs tracking-wide uppercase hover:opacity-80 transition-opacity"
          >
            <Plus size={14} />
            {a.addBtn}
          </button>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{a.empty}</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-border/50">
              {items.map((item) => (
                <li key={item._id} className="py-4 flex items-center gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={localize(item.name, lang)}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {localize(item.name, lang)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sectionName(item.sectionId)} · {item.price}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => item._id && setConfirmId(item._id)}
                    className="p-1 hover:text-red-500 text-muted-foreground transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-wide uppercase">
              {editingId ? a.editHeading : a.newHeading}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section */}
          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              {a.fields.section}
            </label>
            <select
              value={form.sectionId}
              onChange={(e) =>
                setForm((f) => ({ ...f, sectionId: e.target.value }))
              }
              className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors"
            >
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {localize(s.name, lang)}
                </option>
              ))}
              {sections.length === 0 && (
                <option value="">{a.fields.noSection}</option>
              )}
            </select>
          </div>

          <LocalizedInput
            label={a.fields.name}
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder={a.fields.name}
            required
          />

          <div className="space-y-1">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              {a.fields.price}
            </label>
            <input
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors"
              placeholder="3.50€"
            />
          </div>

          <LocalizedInput
            label={a.fields.ingredients}
            value={form.ingredients}
            onChange={(v) => setForm((f) => ({ ...f, ingredients: v }))}
            placeholder={a.fields.ingredients}
            multiline
          />

          <LocalizedInput
            label={a.fields.allergens}
            value={form.allergens}
            onChange={(v) => setForm((f) => ({ ...f, allergens: v }))}
            placeholder={a.fields.allergens}
          />

          <LocalizedInput
            label={a.fields.yieldLabel}
            value={form.yield}
            onChange={(v) => setForm((f) => ({ ...f, yield: v }))}
            placeholder="250 ml"
          />

          <div className="space-y-2">
            <label className="text-xs tracking-wide uppercase text-muted-foreground">
              {a.fields.photo}
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-foreground text-background text-xs tracking-wide uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {saving ? c.saving : c.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-border text-xs tracking-wide uppercase hover:bg-muted transition-colors"
            >
              {c.cancel}
            </button>
          </div>
        </form>
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

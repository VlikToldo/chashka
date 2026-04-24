import { useState, useEffect, useRef } from "react";
import { Reorder } from "framer-motion";
import { Plus, Pencil, Trash2, ImageIcon, GripVertical } from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { localize } from "../../utils/localize";
import LocalizedInput from "./LocalizedInput";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import AdminModal from "../ui/AdminModal";
import ConfirmModal from "../ui/ConfirmModal";
import CustomSelect from "../ui/CustomSelect";
import type { AdminMenuItem, Section } from "../../types/admin";
import type { LocalizedString } from "../../types/menu";
import { getOptimizedUrl } from "../../utils/imageUrl";

const EMPTY_L: LocalizedString = { uk: "", en: "", es: "" };

const EMPTY_FORM: Omit<AdminMenuItem, "_id"> = {
  sectionId: "",
  name: { ...EMPTY_L },
  price: "",
  ingredients: { ...EMPTY_L },
  allergens: { ...EMPTY_L },
  yield: { ...EMPTY_L },
  image: "",
  isExtra: false,
};

export default function MenuItemManager() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const a = t.admin.menu;
  const c = t.admin.common;

  const countFilled = (v: LocalizedString) =>
    (["es", "uk", "en"] as const).filter((k) => v[k]?.trim()).length;

  function parsePrice(raw: string): { amount: string; currency: string } {
    for (const c of ["\u20ac", "$", "\u00a3"]) {
      if (raw.endsWith(c))
        return { amount: raw.slice(0, -c.length).trim(), currency: c };
      if (raw.startsWith(c))
        return { amount: raw.slice(c.length).trim(), currency: c };
    }
    return { amount: raw, currency: "\u20ac" };
  }
  function parseYield(raw: string): {
    amount: string;
    unit: "ml" | "l" | "g" | "kg";
  } {
    const trimmed = raw.trim();
    if (!trimmed) return { amount: "", unit: "ml" };
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace === -1) return { amount: trimmed, unit: "ml" };
    const unit = trimmed.slice(lastSpace + 1);
    const known = ["ml", "l", "g", "kg"];
    const mapped = unit === "г" ? "g" : unit;
    return {
      amount: trimmed.slice(0, lastSpace),
      unit: (known.includes(mapped) ? mapped : "ml") as "ml" | "l" | "g" | "kg",
    };
  }

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
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("€");
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState<"ml" | "l" | "g" | "kg">("ml");
  const fileRef = useRef<HTMLInputElement>(null);
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [itemsBySection, setItemsBySection] = useState<
    Record<string, AdminMenuItem[]>
  >({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([adminService.getMenuItems(), adminService.getSections()])
      .then(([menuItems, secs]) => {
        setItems(menuItems);
        setSections(secs);
        if (secs.length > 0)
          setForm((f) => ({ ...f, sectionId: secs[0]._id ?? "" }));
        // build grouped map (non-extras only)
        const map: Record<string, AdminMenuItem[]> = {};
        for (const s of secs) map[s._id!] = [];
        for (const item of menuItems) {
          if (!item.isExtra && item.sectionId in map) {
            map[item.sectionId].push(item);
          }
        }
        setItemsBySection(map);
      })
      .catch(() => setError(c.errorLoad))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sectionId: sections[0]?._id ?? "" });
    setImagePreview(null);
    setPendingFile(null);
    setPriceAmount("");
    setPriceCurrency("\u20ac");
    setYieldAmount("");
    setYieldUnit("ml");
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
      isExtra: item.isExtra ?? false,
    });
    setImagePreview(item.image ?? null);
    setPendingFile(null);
    const { amount: pAmt, currency: pCur } = parsePrice(item.price);
    setPriceAmount(pAmt);
    setPriceCurrency(pCur);
    const yieldRaw = item.yield?.[lang] || item.yield?.es || "";
    const { amount: yAmt, unit: yUnit } = parseYield(yieldRaw);
    setYieldAmount(yAmt);
    setYieldUnit(yUnit);
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
    const localizedFields: LocalizedString[] = [
      form.name,
      form.ingredients,
      form.allergens,
    ];
    if (localizedFields.some((f) => countFilled(f) === 2)) {
      showToast(c.langWarning, "warning");
      return;
    }
    const yieldStr = yieldAmount.trim()
      ? `${yieldAmount.trim()} ${yieldUnit}`
      : "";
    const formData = {
      ...form,
      price: priceAmount.trim() ? `${priceAmount.trim()}${priceCurrency}` : "",
      yield: { es: yieldStr, uk: yieldStr, en: yieldStr } as LocalizedString,
    };
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await adminService.updateMenuItem(editingId, formData);
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
        rebuildGrouped(items.map((i) => (i._id === editingId ? updated : i)));
      } else {
        const created = await adminService.createMenuItem(formData);
        if (pendingFile && created._id) {
          const { image } = await adminService.uploadMenuItemImage(
            created._id,
            pendingFile,
          );
          created.image = image;
        }
        rebuildGrouped([...items, created]);
      }
      showToast(c.saved, "success");
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
      rebuildGrouped(items.filter((i) => i._id !== id));
    } catch {
      setError(c.errorDelete);
    } finally {
      setConfirmId(null);
    }
  };

  const sectionName = (id: string) =>
    localize(sections.find((s) => s._id === id)?.name, lang, id);

  const handleReorderSection = (
    sectionId: string,
    newOrder: AdminMenuItem[],
  ) => {
    setItemsBySection((prev) => ({ ...prev, [sectionId]: newOrder }));
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    reorderTimer.current = setTimeout(() => {
      adminService
        .reorderMenuItems(
          newOrder.map((item, i) => ({ id: item._id!, order: i })),
        )
        .catch(() => showToast(c.errorSave, "error"));
    }, 500);
  };

  // rebuild itemsBySection when items list changes after create/delete
  const rebuildGrouped = (newItems: AdminMenuItem[]) => {
    setItems(newItems);
    setItemsBySection((prev) => {
      const map: Record<string, AdminMenuItem[]> = {};
      for (const sid of Object.keys(prev)) map[sid] = [];
      for (const item of newItems) {
        if (!item.isExtra && item.sectionId in map)
          map[item.sectionId].push(item);
      }
      return map;
    });
  };

  if (loading) return <Loader />;

  const allNames = (item: AdminMenuItem) =>
    [item.name.uk, item.name.en, item.name.es]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  const q = search.toLowerCase().trim();
  const matchesSearch = (item: AdminMenuItem) =>
    !q || allNames(item).includes(q);

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!showForm ? (
        <>
          <Button onClick={openCreate} className="px-4 py-2">
            <Plus size={14} />
            {a.addBtn}
          </Button>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={a.searchPlaceholder}
            className="w-full max-w-sm bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
          />

          {items.filter((i) => !i.isExtra).length === 0 ? (
            <p className="text-sm text-muted-foreground">{a.empty}</p>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => {
                const sectionItems = (
                  itemsBySection[section._id!] ?? []
                ).filter(matchesSearch);
                if (sectionItems.length === 0) return null;
                return (
                  <div key={section._id}>
                    <p className="text-sm font-medium tracking-wide uppercase text-foreground mb-3 border-b border-border/50 pb-2">
                      {localize(section.name, lang)}
                    </p>
                    <Reorder.Group
                      axis="y"
                      values={sectionItems}
                      onReorder={(newOrder) =>
                        handleReorderSection(section._id!, newOrder)
                      }
                      className="divide-y divide-border/50"
                    >
                      {sectionItems.map((item) => (
                        <Reorder.Item
                          key={item._id}
                          value={item}
                          className="list-none"
                        >
                          <div className="flex items-center gap-3 py-3">
                            <GripVertical
                              size={14}
                              className="text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing"
                            />
                            {item.image ? (
                              <img
                                src={getOptimizedUrl(item.image)}
                                alt={localize(item.name, lang)}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <ImageIcon
                                  size={14}
                                  className="text-muted-foreground"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">
                                {localize(item.name, lang)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.price}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => openEdit(item)}
                              className="p-1"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="ghost-danger"
                              onClick={() => item._id && setConfirmId(item._id)}
                              className="p-1"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}

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
            {/* Section */}
            <div className="space-y-1">
              <label className="text-xs tracking-wide uppercase text-muted-foreground">
                {a.fields.section}
              </label>
              <CustomSelect
                value={form.sectionId}
                onChange={(v) => setForm((f) => ({ ...f, sectionId: v }))}
                options={
                  sections.length > 0
                    ? sections.map((s) => ({
                        value: s._id!,
                        label: localize(s.name, lang),
                      }))
                    : [{ value: "", label: a.fields.noSection }]
                }
              />
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
              <div className="flex items-center gap-2 border-b border-border">
                <input
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  className="flex-1 bg-transparent py-2 text-sm outline-none"
                  placeholder="3.50"
                  inputMode="decimal"
                />
                <CustomSelect
                  value={priceCurrency}
                  onChange={setPriceCurrency}
                  options={[
                    { value: "€", label: "€" },
                    { value: "$", label: "$" },
                    { value: "£", label: "£" },
                  ]}
                  inline
                />
              </div>
            </div>

            {/* isExtra toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setForm((f) => ({ ...f, isExtra: !f.isExtra }))}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  form.isExtra ? "bg-foreground" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full shadow transition-transform ${
                    form.isExtra ? "translate-x-4" : ""
                  }`}
                />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {a.fields.isExtra}
              </span>
            </label>

            {!form.isExtra && (
              <>
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
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs tracking-wide uppercase text-muted-foreground">
                {a.fields.yieldLabel}
              </label>
              <div className="flex items-center gap-2 border-b border-border">
                <input
                  value={yieldAmount}
                  onChange={(e) => setYieldAmount(e.target.value)}
                  className="flex-1 bg-transparent py-2 text-sm outline-none"
                  placeholder="250"
                  inputMode="decimal"
                />
                <CustomSelect
                  value={yieldUnit}
                  onChange={(v) => setYieldUnit(v as "ml" | "l" | "g" | "kg")}
                  options={[
                    { value: "ml", label: "ml" },
                    { value: "l", label: "l" },
                    { value: "g", label: "g" },
                    { value: "kg", label: "kg" },
                  ]}
                  inline
                />
              </div>
            </div>

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

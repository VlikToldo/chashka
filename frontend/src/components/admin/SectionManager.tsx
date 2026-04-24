import { useState, useEffect, useCallback, useRef } from "react";
import { Reorder } from "framer-motion";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { Pencil, Trash2, Plus, Loader2, GripVertical } from "lucide-react";
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
import type { Section, AdminMenuItem } from "../../types/admin";
import type { LocalizedString } from "../../types/menu";
import type { Lang } from "../../i18n/translations";

const EMPTY_NAME: LocalizedString = { uk: "", en: "", es: "" };
const EMPTY_EXTRA = {
  name: { ...EMPTY_NAME } as LocalizedString,
  yieldAmount: "",
  yieldUnit: "ml" as "ml" | "l" | "g" | "kg",
  priceAmount: "",
  priceCurrency: "€",
};

function SectionRow({
  s,
  lang,
  onEdit,
  onDelete,
  onGripPointerDown,
}: {
  s: Section;
  lang: Lang;
  onEdit: (s: Section) => void;
  onDelete: (id: string) => void;
  onGripPointerDown: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-3 border-b border-border/50 last:border-b-0">
      <GripVertical
        size={14}
        className="text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing"
        onPointerDown={onGripPointerDown}
      />
      <span className="flex-1 text-sm">{localize(s.name, lang)}</span>
      <Button variant="ghost" onClick={() => s._id && onEdit(s)} className="p-1">
        <Pencil size={14} />
      </Button>
      <Button variant="ghost-danger" onClick={() => s._id && onDelete(s._id)} className="p-1">
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

function ReorderColumn({
  items,
  category,
  emptyText,
  lang,
  onReorder,
  onEdit,
  onDelete,
  onGripPointerDown,
}: {
  items: Section[];
  category: "food" | "drinks";
  emptyText: string;
  lang: Lang;
  onReorder: (category: "food" | "drinks", newOrder: Section[]) => void;
  onEdit: (s: Section) => void;
  onDelete: (id: string) => void;
  onGripPointerDown: () => void;
}) {
  return items.length === 0 ? (
    <p className="py-3 text-sm text-muted-foreground">{emptyText}</p>
  ) : (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={(newOrder) => onReorder(category, newOrder)}
      className="space-y-0"
    >
      {items.map((s) => (
        <Reorder.Item key={s._id} value={s} className="list-none">
          <SectionRow
            s={s}
            lang={lang}
            onEdit={onEdit}
            onDelete={onDelete}
            onGripPointerDown={onGripPointerDown}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

export default function SectionManager() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { startAutoScroll } = useAutoScroll();
  const a = t.admin.sections;
  const c = t.admin.common;

  const countFilled = (v: LocalizedString) =>
    (["es", "uk", "en"] as const).filter((k) => v[k]?.trim()).length;

  // sections list
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<Section | null>(null);
  const [modalName, setModalName] = useState<LocalizedString>({
    ...EMPTY_NAME,
  });
  const [modalCategory, setModalCategory] = useState<"food" | "drinks">("food");
  const [savingSection, setSavingSection] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // extras inside modal
  const [extras, setExtras] = useState<AdminMenuItem[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [newExtra, setNewExtra] = useState({ ...EMPTY_EXTRA });
  const [addingExtra, setAddingExtra] = useState(false);
  const [confirmExtraId, setConfirmExtraId] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getSections()
      .then(setSections)
      .catch(() => setError("Не вдалося завантажити розділи"))
      .finally(() => setLoading(false));
  }, []);

  const loadExtras = useCallback(
    async (sectionId: string) => {
      setLoadingExtras(true);
      try {
        const data = await adminService.getExtras(sectionId);
        setExtras(data);
      } catch {
        showToast(c.errorLoad, "error");
      } finally {
        setLoadingExtras(false);
      }
    },
    [c.errorLoad, showToast],
  );

  useEffect(() => {
    if (activeSectionId) loadExtras(activeSectionId);
    else setExtras([]);
  }, [activeSectionId, loadExtras]);

  const openCreate = () => {
    setModalSection(null);
    setModalName({ ...EMPTY_NAME });
    setModalCategory("food");
    setActiveSectionId(null);
    setExtras([]);
    setNewExtra({ ...EMPTY_EXTRA });
    setModalOpen(true);
  };

  const openEdit = (s: Section) => {
    setModalSection(s);
    setModalName({ ...s.name });
    setModalCategory(s.category ?? "food");
    setActiveSectionId(s._id ?? null);
    setNewExtra({ ...EMPTY_EXTRA });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSection(null);
    setActiveSectionId(null);
    setExtras([]);
  };

  const handleSaveSection = async () => {
    const filled = countFilled(modalName);
    if (filled === 0) {
      showToast(c.errorSave, "error");
      return;
    }
    if (filled === 2) {
      showToast(c.langWarning, "warning");
      return;
    }
    setSavingSection(true);
    try {
      if (modalSection?._id) {
        const updated = await adminService.updateSection(modalSection._id, {
          name: modalName,
          category: modalCategory,
        });
        setSections((prev) =>
          prev.map((s) => (s._id === modalSection._id ? updated : s)),
        );
        showToast(c.saved, "success");
      } else {
        const created = await adminService.createSection({
          name: modalName,
          category: modalCategory,
        });
        setSections((prev) => [...prev, created]);
        setModalSection(created);
        setActiveSectionId(created._id ?? null);
        showToast(c.saved, "success");
      }
    } catch {
      showToast(c.errorSave, "error");
    } finally {
      setSavingSection(false);
    }
  };

  const handleAddExtra = async () => {
    if (!activeSectionId) return;
    const filled = countFilled(newExtra.name);
    if (filled === 0) {
      showToast(c.errorSave, "error");
      return;
    }
    if (filled === 2) {
      showToast(c.langWarning, "warning");
      return;
    }
    if (!newExtra.priceAmount.trim()) {
      showToast(c.errorSave, "error");
      return;
    }
    setAddingExtra(true);
    try {
      const yldStr = newExtra.yieldAmount.trim()
        ? `${newExtra.yieldAmount.trim()} ${newExtra.yieldUnit}`
        : "";
      const yld: LocalizedString = { uk: yldStr, en: yldStr, es: yldStr };
      const priceStr = `${newExtra.priceAmount.trim()}${newExtra.priceCurrency}`;
      const created = await adminService.createMenuItem({
        sectionId: activeSectionId,
        name: newExtra.name,
        price: priceStr,
        ingredients: { uk: "", en: "", es: "" },
        allergens: { uk: "", en: "", es: "" },
        yield: yld,
        isExtra: true,
      });
      setExtras((prev) => [...prev, created]);
      setNewExtra({ ...EMPTY_EXTRA });
    } catch {
      showToast(c.errorSave, "error");
    } finally {
      setAddingExtra(false);
    }
  };

  const handleDeleteExtra = async (id: string) => {
    try {
      await adminService.deleteMenuItem(id);
      setExtras((prev) => prev.filter((e) => e._id !== id));
    } catch {
      showToast(c.errorDelete, "error");
    } finally {
      setConfirmExtraId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteSection(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch {
      showToast(c.errorDelete, "error");
    } finally {
      setConfirmId(null);
    }
  };

  const [mobileTab, setMobileTab] = useState<"food" | "drinks">("food");
  const [foodOrder, setFoodOrder] = useState<Section[]>([]);
  const [drinksOrder, setDrinksOrder] = useState<Section[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // sync derived lists from sections
  useEffect(() => {
    setFoodOrder(sections.filter((s) => s.category !== "drinks"));
    setDrinksOrder(sections.filter((s) => s.category === "drinks"));
  }, [sections]);

  const handleReorder = (category: "food" | "drinks", newOrder: Section[]) => {
    if (category === "food") setFoodOrder(newOrder);
    else setDrinksOrder(newOrder);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      adminService
        .reorderSections(newOrder.map((s, i) => ({ id: s._id!, order: i })))
        .catch(() => showToast(c.errorSave, "error"));
    }, 500);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-3xl">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Add button */}
      <Button onClick={openCreate} className="px-4 py-2">
        <Plus size={14} />
        {a.addBtn}
      </Button>

      {/* Sections list — desktop: two columns, mobile: tab toggle */}
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <>
          {/* Desktop two-column layout */}
          <div className="hidden sm:grid sm:grid-cols-2 sm:gap-8">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-2">
                {a.categoryFood}
              </p>
              <ReorderColumn items={foodOrder} category="food" emptyText={a.empty} lang={lang} onReorder={handleReorder} onEdit={openEdit} onDelete={setConfirmId} onGripPointerDown={startAutoScroll} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-2">
                {a.categoryDrinks}
              </p>
              <ReorderColumn items={drinksOrder} category="drinks" emptyText={a.empty} lang={lang} onReorder={handleReorder} onEdit={openEdit} onDelete={setConfirmId} onGripPointerDown={startAutoScroll} />
            </div>
          </div>

          {/* Mobile tab toggle */}
          <div className="sm:hidden space-y-4">
            <div className="flex border border-border">
              {(["food", "drinks"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMobileTab(cat)}
                  className={`flex-1 py-2 text-xs tracking-wide uppercase transition-colors ${
                    mobileTab === cat
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "food" ? a.categoryFood : a.categoryDrinks}
                </button>
              ))}
            </div>
            <ReorderColumn
              items={mobileTab === "food" ? foodOrder : drinksOrder}
              category={mobileTab}
              emptyText={a.empty}
              lang={lang}
              onReorder={handleReorder}
              onEdit={openEdit}
              onDelete={setConfirmId}
              onGripPointerDown={startAutoScroll}
            />
          </div>
        </>
      )}

      {/* Delete section confirm */}
      <ConfirmModal
        isOpen={!!confirmId}
        message={c.confirmDelete}
        confirmLabel={c.delete ?? "Видалити"}
        cancelLabel={c.cancel}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      {/* Delete extra confirm */}
      <ConfirmModal
        isOpen={!!confirmExtraId}
        message={c.confirmDelete}
        confirmLabel={c.delete ?? "Видалити"}
        cancelLabel={c.cancel}
        onConfirm={() => confirmExtraId && handleDeleteExtra(confirmExtraId)}
        onCancel={() => setConfirmExtraId(null)}
        zIndex="z-[60]"
      />

      {/* Modal */}
      {modalOpen && (
        <AdminModal
          title={modalSection ? a.modalEditTitle : a.modalCreateTitle}
          onClose={closeModal}
        >
          {/* Section form */}
          <div className="px-6 py-5 space-y-5 border-b border-border">
            {/* Category toggle */}
            <div className="flex items-center gap-4">
              <label className="text-xs tracking-wide uppercase text-muted-foreground shrink-0">
                {a.categoryLabel}
              </label>
              <div className="flex gap-2">
                {(["food", "drinks"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setModalCategory(cat)}
                    className={`px-3 py-1 text-xs tracking-wide uppercase border transition-colors ${
                      modalCategory === cat
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/50"
                    }`}
                  >
                    {cat === "food" ? a.categoryFood : a.categoryDrinks}
                  </button>
                ))}
              </div>
            </div>

            {/* Section name */}
            <LocalizedInput
              label={a.editLabel}
              value={modalName}
              onChange={setModalName}
              placeholder={a.newLabel}
            />

            {/* Save section */}
            <Button
              onClick={handleSaveSection}
              disabled={savingSection}
              className="px-4 py-2"
            >
              {savingSection && <Loader2 size={13} className="animate-spin" />}
              {savingSection ? c.saving : c.save}
            </Button>
          </div>

          {/* Extras — always visible; form disabled until section saved */}
          <div className="px-6 py-5 space-y-4">
            <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {a.extrasTitle}
            </h3>

            {!activeSectionId ? (
              <p className="text-sm text-muted-foreground">
                {a.extrasSaveFirst}
              </p>
            ) : loadingExtras ? (
              <Loader size={32} className="py-2" />
            ) : extras.length === 0 ? (
              <p className="text-sm text-muted-foreground">{a.extrasEmpty}</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {extras.map((ex) => (
                  <li key={ex._id} className="py-2.5 flex items-center gap-3">
                    <span className="flex-1 text-sm">
                      {localize(ex.name, lang)}
                    </span>
                    {ex.yield?.en && (
                      <span className="text-xs text-muted-foreground">
                        {ex.yield.en}
                      </span>
                    )}
                    <span className="text-sm font-light">{ex.price}</span>
                    <Button
                      variant="ghost-danger"
                      onClick={() => ex._id && setConfirmExtraId(ex._id)}
                      className="p-1 shrink-0"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add extra form — only when section saved */}
            {activeSectionId && (
              <div className="border border-border/60 p-4 space-y-4 bg-muted/10">
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground/60">
                  {a.extrasAddBtn}
                </p>

                <LocalizedInput
                  label={a.extrasNameLabel}
                  value={newExtra.name}
                  onChange={(v) => setNewExtra((p) => ({ ...p, name: v }))}
                  placeholder={a.extrasNameLabel}
                />

                <div className="flex gap-3">
                  {/* Yield */}
                  <div className="flex-1 space-y-1">
                    <label className="text-xs tracking-wide uppercase text-muted-foreground">
                      {a.extrasYield}
                    </label>
                    <div className="flex items-center gap-1 border-b border-border">
                      <input
                        value={newExtra.yieldAmount}
                        onChange={(e) =>
                          setNewExtra((p) => ({
                            ...p,
                            yieldAmount: e.target.value,
                          }))
                        }
                        placeholder="30"
                        inputMode="decimal"
                        className="flex-1 bg-transparent py-1.5 text-sm outline-none"
                      />
                      <CustomSelect
                        value={newExtra.yieldUnit}
                        onChange={(v) =>
                          setNewExtra((p) => ({
                            ...p,
                            yieldUnit: v as "ml" | "l" | "g" | "kg",
                          }))
                        }
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
                  {/* Price */}
                  <div className="flex-1 space-y-1">
                    <label className="text-xs tracking-wide uppercase text-muted-foreground">
                      {a.extrasPrice}
                    </label>
                    <div className="flex items-center gap-1 border-b border-border">
                      <input
                        value={newExtra.priceAmount}
                        onChange={(e) =>
                          setNewExtra((p) => ({
                            ...p,
                            priceAmount: e.target.value,
                          }))
                        }
                        placeholder="0.50"
                        inputMode="decimal"
                        className="flex-1 bg-transparent py-1.5 text-sm outline-none"
                      />
                      <CustomSelect
                        value={newExtra.priceCurrency}
                        onChange={(v) =>
                          setNewExtra((p) => ({ ...p, priceCurrency: v }))
                        }
                        options={[
                          { value: "€", label: "€" },
                          { value: "$", label: "$" },
                          { value: "£", label: "£" },
                        ]}
                        inline
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddExtra}
                  disabled={addingExtra}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-foreground text-xs tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                >
                  {addingExtra ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Plus size={12} />
                  )}
                  {c.add}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-end">
            <Button
              variant="ghost"
              onClick={closeModal}
              className="px-4 py-2 text-xs tracking-wide uppercase"
            >
              {activeSectionId ? a.done : c.cancel}
            </Button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { Reorder } from "framer-motion";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useLongPressDrag } from "../../hooks/useLongPressDrag";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  ImageIcon,
  GripVertical,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
import type { Lang } from "../../i18n/translations";
import { getOptimizedUrl } from "../../utils/imageUrl";
import {
  type PhotoPosition,
  DEFAULT_POSITION,
  parsePosition,
  positionToString,
  getWrapperStyle,
  imgStyle as photoImgStyle,
  clampPosition,
} from "../../utils/photoPosition";

// 16:9 frame for menu item photo positioning
const ITEM_FRAME_W = 240;
const ITEM_FRAME_H = Math.round((ITEM_FRAME_W * 9) / 16);
const ITEM_FRAME_AR = 16 / 9;

const EMPTY_L: LocalizedString = { uk: "", en: "", es: "" };

function SortableMenuItem({
  item,
  lang,
  onEdit,
  onDuplicate,
  onDelete,
  onAutoScroll,
}: {
  item: AdminMenuItem;
  lang: Lang;
  onEdit: (item: AdminMenuItem) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAutoScroll: () => void;
}) {
  const { controls, onPointerDown, pressing, startDrag } =
    useLongPressDrag(500);
  const [isDragging, setIsDragging] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const rowDivRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      onPointerDown(e);
      onAutoScroll();
    },
    [onPointerDown, onAutoScroll],
  );

  const handleGripPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (itemRef.current) itemRef.current.style.touchAction = "none";
      onAutoScroll();
      startDrag(e);
    },
    [startDrag, onAutoScroll],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (itemRef.current) itemRef.current.style.touchAction = "";
  }, []);

  // Touch long-press drag: non-passive touchstart to prevent scroll/pointercancel,
  // then bridge touchmove → synthetic PointerEvents so framer-motion can track movement
  useEffect(() => {
    const el = rowDivRef.current;
    const item = itemRef.current;
    if (!el || !item) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!(e.target as HTMLElement).closest("[data-drag-grip='true']")) return;
      e.preventDefault();
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const earlyAc = new AbortController();
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cancelEarly = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        earlyAc.abort();
      };

      window.addEventListener(
        "touchmove",
        (me: TouchEvent) => {
          const dx = me.touches[0].clientX - startX;
          const dy = me.touches[0].clientY - startY;
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) cancelEarly();
        },
        { passive: true, signal: earlyAc.signal },
      );
      window.addEventListener("touchend", cancelEarly, {
        once: true,
        signal: earlyAc.signal,
      });
      window.addEventListener("touchcancel", cancelEarly, {
        once: true,
        signal: earlyAc.signal,
      });

      timer = setTimeout(() => {
        earlyAc.abort();
        item.style.touchAction = "none";
        onAutoScroll();
        controls.start(
          new PointerEvent("pointerdown", {
            clientX: startX,
            clientY: startY,
            pointerId: 1,
            bubbles: true,
          }),
        );

        const dragAc = new AbortController();

        window.addEventListener(
          "touchmove",
          (me: TouchEvent) => {
            me.preventDefault();
            const t = me.touches[0];
            window.dispatchEvent(
              new PointerEvent("pointermove", {
                clientX: t.clientX,
                clientY: t.clientY,
                pointerId: 1,
                bubbles: true,
              }),
            );
          },
          { passive: false, signal: dragAc.signal },
        );

        const endDrag = (me: TouchEvent) => {
          dragAc.abort();
          item.style.touchAction = "";
          const t = me.changedTouches[0];
          window.dispatchEvent(
            new PointerEvent("pointerup", {
              clientX: t.clientX,
              clientY: t.clientY,
              pointerId: 1,
              bubbles: true,
            }),
          );
        };
        window.addEventListener("touchend", endDrag, {
          once: true,
          signal: dragAc.signal,
        });
        window.addEventListener("touchcancel", endDrag, {
          once: true,
          signal: dragAc.signal,
        });
      }, 400);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => el.removeEventListener("touchstart", onTouchStart);
  }, [controls, onAutoScroll]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  return (
    <Reorder.Item
      ref={itemRef}
      value={item}
      className="list-none"
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={rowDivRef}
        className={`flex items-center gap-3 py-3 select-none transition-shadow duration-150
          ${isDragging ? "rounded-sm shadow-md ring-1 ring-foreground/10 bg-background cursor-grabbing" : ""}
          ${pressing && !isDragging ? "cursor-grab" : ""}
        `}
        onPointerDown={handlePointerDown}
      >
        <GripVertical
          size={14}
          data-drag-grip="true"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleGripPointerDown(e);
          }}
          className={`shrink-0 transition-colors duration-200 ${
            pressing || isDragging
              ? "text-foreground animate-pulse"
              : "text-muted-foreground/40"
          }`}
        />
        {item.image ? (
          <img
            src={getOptimizedUrl(item.image)}
            alt={localize(item.name, lang)}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ImageIcon size={14} className="text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{localize(item.name, lang)}</p>
          <p className="text-xs text-muted-foreground">{item.price}</p>
        </div>
        <Button
          variant="ghost"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(item)}
          className="p-2"
        >
          <Pencil size={14} />
        </Button>
        <Button
          variant="ghost"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => item._id && onDuplicate(item._id)}
          className="p-2"
        >
          <Copy size={14} />
        </Button>
        <Button
          variant="ghost-danger"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => item._id && onDelete(item._id)}
          className="p-2"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Reorder.Item>
  );
}

const EMPTY_FORM: Omit<AdminMenuItem, "_id"> = {
  sectionId: "",
  name: { ...EMPTY_L },
  price: "",
  ingredients: { ...EMPTY_L },
  allergens: { ...EMPTY_L },
  yield: { ...EMPTY_L },
  image: "",
  imagePosition: "",
  isExtra: false,
};

export default function MenuItemManager() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { startAutoScroll } = useAutoScroll();
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
    unit: "ml" | "l" | "g" | "kg" | "pcs";
  } {
    const trimmed = raw.trim();
    if (!trimmed) return { amount: "", unit: "ml" };
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace === -1) return { amount: trimmed, unit: "ml" };
    const unit = trimmed.slice(lastSpace + 1);
    const known = ["ml", "l", "g", "kg", "pcs"];
    const mapped = unit === "г" ? "g" : unit;
    return {
      amount: trimmed.slice(0, lastSpace),
      unit: (known.includes(mapped) ? mapped : "ml") as
        | "ml"
        | "l"
        | "g"
        | "kg"
        | "pcs",
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
  const [yieldUnit, setYieldUnit] = useState<"ml" | "l" | "g" | "kg" | "pcs">(
    "ml",
  );
  const [editPos, setEditPos] = useState<PhotoPosition>(DEFAULT_POSITION);
  const fileRef = useRef<HTMLInputElement>(null);
  const editPosFrameRef = useRef<HTMLDivElement>(null);
  const editPosDragState = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);
  const editPosTouchState = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [itemsBySection, setItemsBySection] = useState<
    Record<string, AdminMenuItem[]>
  >({});
  const [search, setSearch] = useState("");

  // Wheel zoom on the photo position frame
  useEffect(() => {
    const el = editPosFrameRef.current;
    if (!el || !imagePreview) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setEditPos((prev) =>
        clampPosition(
          { ...prev, scale: Math.max(1, Math.min(4, prev.scale + delta)) },
          ITEM_FRAME_AR,
        ),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [imagePreview]);

  // Global mousemove/mouseup for photo position drag
  useEffect(() => {
    if (!imagePreview) return;
    const onMove = (e: MouseEvent) => {
      const drag = editPosDragState.current;
      if (!drag) return;
      setEditPos((prev) =>
        clampPosition(
          {
            ...prev,
            x: drag.posX + (e.clientX - drag.x) * (100 / ITEM_FRAME_W),
            y: drag.posY + (e.clientY - drag.y) * (100 / ITEM_FRAME_H),
          },
          ITEM_FRAME_AR,
        ),
      );
    };
    const onUp = () => {
      editPosDragState.current = null;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [imagePreview]);

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
    const keepSectionId = form.sectionId || (sections[0]?._id ?? "");
    setForm({ ...EMPTY_FORM, sectionId: keepSectionId });
    setImagePreview(null);
    setPendingFile(null);
    setPriceAmount("");
    setPriceCurrency("\u20ac");
    setYieldAmount("");
    setEditPos(DEFAULT_POSITION);
    // yieldUnit intentionally not reset — preserves last-used unit
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
      imagePosition: item.imagePosition ?? "",
      isExtra: item.isExtra ?? false,
    });
    setImagePreview(item.image ?? null);
    setPendingFile(null);
    setEditPos(parsePosition(item.imagePosition ?? "{}"));
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
    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setImagePreview(url);
    const tmp = new Image();
    tmp.onload = () => {
      setEditPos({
        ...DEFAULT_POSITION,
        ar: tmp.naturalWidth / tmp.naturalHeight,
      });
    };
    tmp.src = url;
    e.target.value = "";
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
      imagePosition: imagePreview ? positionToString(editPos) : "",
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
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorSave);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await adminService.duplicateMenuItem(id);
      rebuildGrouped([...items, copy]);
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteMenuItem(id);
      rebuildGrouped(items.filter((i) => i._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorDelete);
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

  const foodSections = sections.filter((s) => s.category !== "drinks");
  const drinksSections = sections.filter((s) => s.category === "drinks");

  const renderSectionColumn = (cols: Section[]) => (
    <div className="space-y-8">
      {cols.map((section) => {
        const sectionItems = (itemsBySection[section._id!] ?? []).filter(
          matchesSearch,
        );
        if (sectionItems.length === 0 && q) return null;
        return (
          <div key={section._id}>
            <p className="text-sm font-medium tracking-wide uppercase text-foreground mb-3 border-b border-border/50 pb-2">
              {localize(section.name, lang)}
            </p>
            {sectionItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">{a.empty}</p>
            ) : (
              <Reorder.Group
                axis="y"
                values={sectionItems}
                onReorder={(newOrder) =>
                  handleReorderSection(section._id!, newOrder)
                }
                className="divide-y divide-border/50"
              >
                {sectionItems.map((item) => (
                  <SortableMenuItem
                    key={item._id}
                    item={item}
                    lang={lang}
                    onEdit={openEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={setConfirmId}
                    onAutoScroll={startAutoScroll}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 admin-fade-in">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!showForm ? (
        <>
          <div className="flex items-center gap-4">
            <Button onClick={openCreate} className="px-4 py-2 shrink-0">
              <Plus size={14} />
              {a.addBtn}
            </Button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={a.searchPlaceholder}
              className="flex-1 max-w-sm bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          {items.filter((i) => !i.isExtra).length === 0 && !q ? (
            <p className="text-sm text-muted-foreground">{a.empty}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">
              {/* Food column */}
              <div>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-4">
                  {t.admin.sections.categoryFood}
                </p>
                {renderSectionColumn(foodSections)}
              </div>
              {/* Drinks column */}
              <div>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-4">
                  {t.admin.sections.categoryDrinks}
                </p>
                {renderSectionColumn(drinksSections)}
              </div>
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
                  required
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
                  onChange={(v) =>
                    setYieldUnit(v as "ml" | "l" | "g" | "kg" | "pcs")
                  }
                  options={[
                    { value: "ml", label: "ml" },
                    { value: "l", label: "l" },
                    { value: "g", label: "g" },
                    { value: "kg", label: "kg" },
                    { value: "pcs", label: a.fields.unitPcs },
                  ]}
                  inline
                />
              </div>
            </div>

            {!form.isExtra && (
              <div className="space-y-2">
                <label className="text-xs tracking-wide uppercase text-muted-foreground">
                  {a.fields.photo}
                </label>
                <div className="flex items-center gap-4">
                  {!imagePreview && (
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

                {imagePreview && (
                  <div className="space-y-2 pt-1">
                    <div
                      ref={editPosFrameRef}
                      className="relative overflow-hidden rounded-lg bg-muted border border-border cursor-grab active:cursor-grabbing select-none"
                      style={{
                        width: ITEM_FRAME_W,
                        height: ITEM_FRAME_H,
                        touchAction: "none",
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        editPosDragState.current = {
                          x: e.clientX,
                          y: e.clientY,
                          posX: editPos.x,
                          posY: editPos.y,
                        };
                      }}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        editPosTouchState.current = {
                          x: touch.clientX,
                          y: touch.clientY,
                          posX: editPos.x,
                          posY: editPos.y,
                        };
                      }}
                      onTouchMove={(e) => {
                        if (!editPosTouchState.current) return;
                        e.preventDefault();
                        const ts = editPosTouchState.current;
                        const touch = e.touches[0];
                        setEditPos((prev) =>
                          clampPosition(
                            {
                              ...prev,
                              x:
                                ts.posX +
                                (touch.clientX - ts.x) * (100 / ITEM_FRAME_W),
                              y:
                                ts.posY +
                                (touch.clientY - ts.y) * (100 / ITEM_FRAME_H),
                            },
                            ITEM_FRAME_AR,
                          ),
                        );
                      }}
                      onTouchEnd={() => {
                        editPosTouchState.current = null;
                      }}
                    >
                      <div style={getWrapperStyle(editPos, ITEM_FRAME_AR)}>
                        <img
                          src={imagePreview}
                          alt="preview"
                          draggable={false}
                          style={photoImgStyle}
                        />
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      style={{ width: ITEM_FRAME_W }}
                    >
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() =>
                          setEditPos((p) =>
                            clampPosition(
                              { ...p, scale: Math.max(1, p.scale - 0.15) },
                              ITEM_FRAME_AR,
                            ),
                          )
                        }
                        disabled={editPos.scale <= 1}
                        className="p-1"
                      >
                        <ZoomOut size={14} />
                      </Button>
                      <input
                        type="range"
                        min={100}
                        max={400}
                        step={1}
                        value={Math.round(editPos.scale * 100)}
                        onChange={(e) =>
                          setEditPos((p) =>
                            clampPosition(
                              { ...p, scale: Number(e.target.value) / 100 },
                              ITEM_FRAME_AR,
                            ),
                          )
                        }
                        className="flex-1 accent-foreground cursor-pointer"
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() =>
                          setEditPos((p) =>
                            clampPosition(
                              { ...p, scale: Math.min(4, p.scale + 0.15) },
                              ITEM_FRAME_AR,
                            ),
                          )
                        }
                        disabled={editPos.scale >= 4}
                        className="p-1"
                      >
                        <ZoomIn size={14} />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60">
                      перетягуйте · прокручуйте для масштабу
                    </p>
                  </div>
                )}
              </div>
            )}

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

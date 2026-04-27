import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import AdminModal from "../ui/AdminModal";
import { localize } from "../../utils/localize";
import type { Lang } from "../../i18n/translations";
import {
  type Discount,
  type DiscountItem,
  type DiscountScheduleSlot,
  type DayKey,
  type AdminMenuItem,
  ALL_DAYS,
  DAY_LABELS,
} from "../../types/admin";
import type { Section } from "../../types/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

type SlottedSlot = DiscountScheduleSlot & { _key: string };
type DraftDiscount = Omit<Discount, "_id" | "items" | "schedule"> & {
  _key: string;
  _id?: string;
  items: DiscountItem[];
  schedule: SlottedSlot[];
  utcOffset: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genId = () => crypto.randomUUID();

const emptySlot = (): SlottedSlot => ({
  _key: genId(),
  days: [],
  startTime: "08:00",
  endTime: "22:00",
});

const emptyDraft = (): DraftDiscount => ({
  _key: genId(),
  label: "",
  items: [],
  schedule: [],
  utcOffset: 0,
  enabled: true,
});

const labelClass = "text-xs tracking-wide uppercase text-muted-foreground";
const inputClass =
  "w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-foreground transition-colors";

function parseCurrency(price: string): string {
  for (const c of ["€", "$", "£", "₴"]) {
    if (price.endsWith(c) || price.startsWith(c)) return c;
  }
  return "";
}

// ─── Item picker sub-component ────────────────────────────────────────────────

interface ItemPickerProps {
  allItems: AdminMenuItem[];
  sections: Section[];
  selectedItems: DiscountItem[];
  lang: Lang;
  labels: {
    searchPlaceholder: string;
    selectedItems: string;
    noItemsFound: string;
    priceField: string;
  };
  onChange: (items: DiscountItem[]) => void;
}

function ItemPicker({
  allItems,
  sections,
  selectedItems,
  lang,
  labels,
  onChange,
}: ItemPickerProps) {
  const [query, setQuery] = useState("");

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((i) => i.itemId)),
    [selectedItems],
  );

  const nonExtraItems = useMemo(
    () => allItems.filter((it) => !it.isExtra),
    [allItems],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return nonExtraItems;
    const q = query.toLowerCase();
    return nonExtraItems.filter((it) =>
      localize(it.name, lang).toLowerCase().includes(q),
    );
  }, [query, nonExtraItems, lang]);

  const grouped = useMemo(
    () =>
      sections
        .map((sec) => ({
          section: sec,
          items: filtered.filter((it) => it.sectionId === sec._id),
        }))
        .filter((g) => g.items.length > 0),
    [filtered, sections],
  );

  const ungrouped = useMemo(
    () =>
      filtered.filter((it) => !sections.find((s) => s._id === it.sectionId)),
    [filtered, sections],
  );

  const toggleItem = (item: AdminMenuItem) => {
    if (selectedIds.has(item._id!)) {
      onChange(selectedItems.filter((i) => i.itemId !== item._id));
    } else {
      onChange([...selectedItems, { itemId: item._id!, discountPrice: "" }]);
    }
  };

  const updatePrice = (itemId: string, discountPrice: string) => {
    onChange(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, discountPrice } : i,
      ),
    );
  };

  const removeItem = (itemId: string) => {
    onChange(selectedItems.filter((i) => i.itemId !== itemId));
  };

  const renderItemRow = (item: AdminMenuItem) => {
    const isSelected = selectedIds.has(item._id!);
    return (
      <button
        key={item._id}
        type="button"
        onClick={() => toggleItem(item)}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
          isSelected
            ? "bg-foreground/10 text-foreground"
            : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="truncate">{localize(item.name, lang)}</span>
        <span className="text-xs ml-2 shrink-0 text-muted-foreground">
          {item.price}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          className="w-full bg-transparent border-b border-border py-2 pl-5 text-sm outline-none focus:border-foreground transition-colors"
          placeholder={labels.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Item list */}
      <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
        {grouped.map(({ section, items }) => (
          <div key={section._id}>
            <p className="text-xs text-muted-foreground mb-0.5 px-2">
              {localize(section.name, lang)}
            </p>
            <div className="space-y-0.5">{items.map(renderItemRow)}</div>
          </div>
        ))}
        {ungrouped.length > 0 && (
          <div className="space-y-0.5">{ungrouped.map(renderItemRow)}</div>
        )}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 text-center">
            {labels.noItemsFound}
          </p>
        )}
      </div>

      {/* Selected items with individual price inputs */}
      {selectedItems.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-border">
          <p className={labelClass}>{labels.selectedItems}</p>
          {selectedItems.map((entry) => {
            const item = allItems.find((it) => it._id === entry.itemId);
            if (!item) return null;
            return (
              <div key={entry.itemId} className="flex items-center gap-2">
                <span className="text-sm flex-1 truncate min-w-0">
                  {localize(item.name, lang)}
                  <span className="text-xs text-muted-foreground ml-1.5">
                    {item.price}
                  </span>
                </span>
                <div className="flex items-center shrink-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-16 bg-transparent border-b border-border py-1 text-sm outline-none focus:border-foreground text-right"
                    placeholder="0"
                    value={entry.discountPrice}
                    onChange={(e) => updatePrice(entry.itemId, e.target.value)}
                  />
                  {parseCurrency(item.price) && (
                    <span className="text-sm text-muted-foreground ml-0.5">
                      {parseCurrency(item.price)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(entry.itemId)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DiscountManager() {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const a = t.admin.discounts;
  const c = t.admin.common;

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [allItems, setAllItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDraft, setCreateDraft] = useState<DraftDiscount>(emptyDraft());
  const [createSaving, setCreateSaving] = useState(false);

  // Edit drafts (accordion, existing discounts)
  const [drafts, setDrafts] = useState<Record<string, DraftDiscount>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.allSettled([
      adminService.getDiscounts(),
      adminService.getSections(),
      adminService.getMenuItems(),
    ])
      .then(([dRes, sRes, iRes]) => {
        if (dRes.status === "fulfilled") setDiscounts(dRes.value);
        if (sRes.status === "fulfilled") setSections(sRes.value);
        if (iRes.status === "fulfilled") setAllItems(iRes.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const getDraft = useCallback(
    (key: string): DraftDiscount => {
      if (drafts[key]) return drafts[key];
      const existing = discounts.find((d) => d._id === key);
      if (existing) {
        return {
          ...existing,
          _key: existing._id!,
          items: existing.items as DiscountItem[],
          schedule: (existing.schedule as DiscountScheduleSlot[]).map((s) => ({
            ...s,
            _key: genId(),
          })),
          utcOffset: existing.utcOffset ?? 0,
        };
      }
      return emptyDraft();
    },
    [drafts, discounts],
  );

  const setDraft = useCallback(
    (key: string, patch: Partial<DraftDiscount>) => {
      setDrafts((prev) => ({ ...prev, [key]: { ...getDraft(key), ...patch } }));
    },
    [getDraft],
  );

  const patchCreate = (patch: Partial<DraftDiscount>) => {
    setCreateDraft((prev) => ({ ...prev, ...patch }));
  };

  const openCreate = () => {
    setCreateDraft(emptyDraft());
    setShowCreateModal(true);
  };

  // ── Validation + payload ─────────────────────────────────────────────────

  const validate = (draft: DraftDiscount): boolean => {
    if (draft.items.length === 0) {
      showToast(a.validationError, "error");
      return false;
    }
    if (draft.items.some((i) => !i.discountPrice.trim())) {
      showToast(a.validationError, "error");
      return false;
    }
    return true;
  };

  const buildPayload = (draft: DraftDiscount) => ({
    label: draft.label,
    items: draft.items.map(({ itemId, discountPrice }) => ({
      itemId,
      discountPrice,
    })),
    schedule: draft.schedule.map(({ days, startTime, endTime }) => ({
      days,
      startTime,
      endTime,
    })),
    utcOffset: draft.utcOffset,
    enabled: draft.enabled,
  });

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!validate(createDraft)) return;
    setCreateSaving(true);
    try {
      const created = await adminService.createDiscount(
        buildPayload(createDraft),
      );
      setDiscounts((prev) => [created, ...prev]);
      setShowCreateModal(false);
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleSave = async (key: string) => {
    const draft = getDraft(key);
    if (!validate(draft)) return;
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const updated = await adminService.updateDiscount(
        draft._id!,
        buildPayload(draft),
      );
      setDiscounts((prev) =>
        prev.map((d) => (d._id === draft._id ? updated : d)),
      );
      setSaved((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2500);
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.deleteDiscount(deleteId);
      setDiscounts((prev) => prev.filter((d) => d._id !== deleteId));
      showToast(c.deleted ?? a.deleted, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setDeleteId(null);
    }
  };

  // ── Schedule helpers ─────────────────────────────────────────────────────

  const addSlot = (
    draft: DraftDiscount,
    setFn: (patch: Partial<DraftDiscount>) => void,
  ) => setFn({ schedule: [...draft.schedule, emptySlot()] });

  const removeSlot = (
    draft: DraftDiscount,
    setFn: (patch: Partial<DraftDiscount>) => void,
    slotKey: string,
  ) =>
    setFn({
      schedule: draft.schedule.filter((s) => s._key !== slotKey),
    });

  const updateSlot = (
    draft: DraftDiscount,
    setFn: (patch: Partial<DraftDiscount>) => void,
    slotKey: string,
    patch: Partial<DiscountScheduleSlot>,
  ) =>
    setFn({
      schedule: draft.schedule.map((s) =>
        s._key === slotKey ? { ...s, ...patch } : s,
      ),
    });

  const toggleDay = (
    draft: DraftDiscount,
    setFn: (patch: Partial<DraftDiscount>) => void,
    slotKey: string,
    day: DayKey,
  ) => {
    const slot = draft.schedule.find((s) => s._key === slotKey);
    if (!slot) return;
    const days = slot.days.includes(day)
      ? slot.days.filter((d) => d !== day)
      : [...slot.days, day];
    updateSlot(draft, setFn, slotKey, { days });
  };

  // ── Shared form renderer ──────────────────────────────────────────────────

  const pickerLabels = {
    searchPlaceholder: a.searchPlaceholder,
    selectedItems: a.selectedItems,
    noItemsFound: a.noItemsFound,
    priceField: a.priceField,
  };

  const renderForm = (
    draft: DraftDiscount,
    setFn: (patch: Partial<DraftDiscount>) => void,
    opts: { showActions?: boolean; actionKey?: string } = {},
  ) => (
    <div className="space-y-5">
      {/* Label */}
      <div className="space-y-1">
        <label className={labelClass}>{a.labelField}</label>
        <input
          className={inputClass}
          placeholder={a.labelPlaceholder}
          value={draft.label}
          onChange={(e) => setFn({ label: e.target.value })}
        />
      </div>

      {/* Items picker */}
      <div className="space-y-2">
        <label className={labelClass}>{a.itemsField}</label>
        <ItemPicker
          allItems={allItems}
          sections={sections}
          selectedItems={draft.items}
          lang={lang}
          labels={pickerLabels}
          onChange={(items) => setFn({ items })}
        />
      </div>

      {/* Schedule slots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>{a.scheduleField}</label>
          <button
            type="button"
            onClick={() => addSlot(draft, setFn)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            {a.addSlot}
          </button>
        </div>

        {/* UTC offset selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground shrink-0">
            {a.utcOffsetLabel}:
          </label>
          <select
            value={draft.utcOffset}
            onChange={(e) => setFn({ utcOffset: Number(e.target.value) })}
            className="bg-transparent border-b border-border py-1 text-sm outline-none focus:border-foreground cursor-pointer"
          >
            {Array.from({ length: 27 }, (_, i) => i - 12).map((offset) => (
              <option key={offset} value={offset}>
                UTC{offset >= 0 ? `+${offset}` : offset}
              </option>
            ))}
          </select>
        </div>

        {draft.schedule.length === 0 && (
          <p className="text-xs text-muted-foreground">{a.scheduleEmpty}</p>
        )}

        {draft.schedule.map((slot) => (
          <div
            key={slot._key}
            className="border border-border rounded-lg p-3 space-y-3"
          >
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(draft, setFn, slot._key, day)}
                  className={`w-8 h-8 text-xs rounded-full border transition-colors ${
                    slot.days.includes(day)
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <label className={labelClass}>{a.from}</label>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    updateSlot(draft, setFn, slot._key, {
                      startTime: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border py-1.5 text-sm outline-none focus:border-foreground"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className={labelClass}>{a.to}</label>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    updateSlot(draft, setFn, slot._key, {
                      endTime: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-border py-1.5 text-sm outline-none focus:border-foreground"
                />
              </div>
              <Button
                variant="ghost-danger"
                className="mt-4"
                onClick={() => removeSlot(draft, setFn, slot._key)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Enabled */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="accent-foreground"
          checked={draft.enabled}
          onChange={(e) => setFn({ enabled: e.target.checked })}
        />
        <span className="text-sm">{a.enabledLabel}</span>
      </label>

      {opts.showActions && opts.actionKey && (
        <div className="flex gap-3 pt-1">
          <Button
            onClick={() => handleSave(opts.actionKey!)}
            disabled={saving[opts.actionKey!]}
            className="flex items-center gap-1.5 px-4 py-2"
          >
            {saved[opts.actionKey!] ? <Check size={14} /> : <Save size={14} />}
            {saving[opts.actionKey!]
              ? c.saving
              : saved[opts.actionKey!]
                ? c.saved
                : c.save}
          </Button>
          <Button
            variant="ghost-danger"
            onClick={() => setDeleteId(draft._id!)}
            className="flex items-center gap-1.5 px-4 py-2"
          >
            <Trash2 size={14} />
            {c.delete}
          </Button>
        </div>
      )}
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-2xl admin-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{a.hint}</p>
        <Button
          variant="secondary"
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2"
        >
          <Plus size={14} />
          {a.addBtn}
        </Button>
      </div>

      {discounts.length === 0 && (
        <p className="text-sm text-muted-foreground">{a.empty}</p>
      )}

      {discounts.map((discount) => {
        const key = discount._id!;
        const draft = getDraft(key);
        const isOpen = openId === key;
        return (
          <div
            key={key}
            className={`border rounded-xl p-4 transition-colors ${
              discount.enabled ? "border-border" : "border-border/50 opacity-60"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : key)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium truncate">
                  {discount.label || a.unnamed}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {discount.items.length} {a.itemsCount}
                </span>
                {!discount.enabled && (
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {a.disabled}
                  </span>
                )}
              </div>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen && (
              <div className="pt-4">
                {renderForm(draft, (patch) => setDraft(key, patch), {
                  showActions: true,
                  actionKey: key,
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Create modal */}
      {showCreateModal && (
        <AdminModal
          title={a.newDiscount}
          onClose={() => setShowCreateModal(false)}
          maxWidth="max-w-lg"
        >
          <div className="space-y-5">
            {renderForm(createDraft, patchCreate)}
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button
                onClick={handleCreate}
                disabled={createSaving}
                className="flex items-center gap-1.5 px-4 py-2"
              >
                <Save size={14} />
                {createSaving ? c.saving : c.save}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2"
              >
                {c.cancel}
              </Button>
            </div>
          </div>
        </AdminModal>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title={a.deleteTitle}
        message={a.deleteMsg}
        confirmLabel={c.delete}
        cancelLabel={c.cancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        danger
      />
    </div>
  );
}

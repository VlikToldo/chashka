import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  ChevronDown,
  ChevronUp,
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
import type { AboutBlock } from "../../types/about";
import type { LocalizedString } from "../../types/menu";
import { getOptimizedUrl } from "../../utils/imageUrl";
import {
  type PhotoPosition,
  DEFAULT_POSITION,
  parsePosition,
  positionToString,
  getWrapperStyle,
  imgStyle,
  clampPosition,
} from "../../utils/photoPosition";

const FRAME_W = 280;
const FRAME_H = Math.round((FRAME_W * 4) / 5); // 224 — 5:4
const FRAME_AR = FRAME_W / FRAME_H;
const MAX_IMAGES = 4;

const EMPTY_L: LocalizedString = { uk: "", en: "", es: "" };
const EMPTY_FORM = { title: { ...EMPTY_L }, text: { ...EMPTY_L } };

// One image slot in the editor
interface LocalImage {
  key: string;
  preview: string; // blob URL (new) or cloudinary URL (existing)
  position: PhotoPosition;
  file?: File; // set only for newly selected files
  cloudUrl?: string; // set for already-saved images
}

let keyCounter = 0;
const newKey = () => String(++keyCounter);

export default function AboutManager() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const a = t.admin.about;
  const c = t.admin.common;

  const [blocks, setBlocks] = useState<AboutBlock[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Multi-image state
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);
  const touchState = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);

  useEffect(() => {
    adminService
      .getAboutBlocks()
      .then(setBlocks)
      .catch(() => setError(c.errorLoad))
      .finally(() => setLoading(false));
  }, []);

  // ─── helpers ────────────────────────────────────────────────────────────────

  const activeImage =
    activeIdx !== null ? (localImages[activeIdx] ?? null) : null;

  const setActivePos = useCallback(
    (pos: PhotoPosition) => {
      setLocalImages((prev) =>
        prev.map((img, i) =>
          i === activeIdx ? { ...img, position: pos } : img,
        ),
      );
    },
    [activeIdx],
  );

  // ─── open / close ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLocalImages([]);
    setActiveIdx(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (block: AboutBlock) => {
    setEditingId(block._id ?? null);
    setForm({ title: block.title, text: block.text });
    setError(null);

    const imgs: LocalImage[] = (block.images ?? []).map((img) => {
      const pos = parsePosition(img.position ?? "{}");
      const entry: LocalImage = {
        key: newKey(),
        preview: img.url,
        position: pos,
        cloudUrl: img.url,
      };
      // If ar not stored, read from the image
      if (pos.ar === undefined) {
        const tmp = new Image();
        tmp.onload = () => {
          setLocalImages((prev) =>
            prev.map((li) =>
              li.cloudUrl === img.url && li.position.ar === undefined
                ? {
                    ...li,
                    position: {
                      ...li.position,
                      ar: tmp.naturalWidth / tmp.naturalHeight,
                    },
                  }
                : li,
            ),
          );
        };
        tmp.src = img.url;
      }
      return entry;
    });

    setLocalImages(imgs);
    setActiveIdx(imgs.length > 0 ? 0 : null);
    setShowForm(true);
  };

  // ─── file picker ─────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const blobUrl = URL.createObjectURL(file);
    const tmp = new Image();
    tmp.onload = () => {
      const ar = tmp.naturalWidth / tmp.naturalHeight;
      const newImg: LocalImage = {
        key: newKey(),
        preview: blobUrl,
        position: { ...DEFAULT_POSITION, ar },
        file,
      };
      setLocalImages((prev) => {
        const next = [...prev, newImg];
        setActiveIdx(next.length - 1);
        return next;
      });
    };
    tmp.src = blobUrl;
  };

  const removeImage = (idx: number) => {
    setLocalImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setActiveIdx(next.length > 0 ? Math.min(idx, next.length - 1) : null);
      return next;
    });
  };

  // ─── drag / zoom ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showForm || !activeImage) return;
    const onMove = (e: MouseEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      setActivePos(
        clampPosition(
          {
            ...activeImage.position,
            x: drag.posX + (e.clientX - drag.x) * (100 / FRAME_W),
            y: drag.posY + (e.clientY - drag.y) * (100 / FRAME_H),
          },
          FRAME_AR,
        ),
      );
    };
    const onUp = () => {
      dragState.current = null;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [showForm, activeImage, setActivePos]);

  useEffect(() => {
    if (!showForm || !activeImage || !frameRef.current) return;
    const el = frameRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setActivePos(
        clampPosition(
          {
            ...activeImage.position,
            scale: Math.max(1, Math.min(4, activeImage.position.scale + delta)),
          },
          FRAME_AR,
        ),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [showForm, activeImage, setActivePos]);

  const handleFrameMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!activeImage) return;
      e.preventDefault();
      dragState.current = {
        x: e.clientX,
        y: e.clientY,
        posX: activeImage.position.x,
        posY: activeImage.position.y,
      };
    },
    [activeImage],
  );

  const handleFrameTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!activeImage) return;
      const touch = e.touches[0];
      touchState.current = {
        x: touch.clientX,
        y: touch.clientY,
        posX: activeImage.position.x,
        posY: activeImage.position.y,
      };
    },
    [activeImage],
  );

  const handleFrameTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchState.current || !activeImage) return;
      e.preventDefault();
      const ts = touchState.current;
      const touch = e.touches[0];
      setActivePos(
        clampPosition(
          {
            ...activeImage.position,
            x: ts.posX + (touch.clientX - ts.x) * (100 / FRAME_W),
            y: ts.posY + (touch.clientY - ts.y) * (100 / FRAME_H),
          },
          FRAME_AR,
        ),
      );
    },
    [activeImage, setActivePos],
  );

  const handleZoom = useCallback(
    (dir: "in" | "out") => {
      if (!activeImage) return;
      setActivePos(
        clampPosition(
          {
            ...activeImage.position,
            scale: Math.max(
              1,
              Math.min(
                4,
                activeImage.position.scale + (dir === "in" ? 0.15 : -0.15),
              ),
            ),
          },
          FRAME_AR,
        ),
      );
    },
    [activeImage, setActivePos],
  );

  // ─── save ────────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const textFilled = Object.values(form.text).some((v) => v.trim() !== "");
    if (!textFilled) {
      setError(c.errorSave);
      return;
    }
    setSaving(true);
    setError(null);
    const uploadedUrls: string[] = [];
    try {
      // 1. Save text content
      let block: AboutBlock;
      if (editingId) {
        block = await adminService.updateAboutBlock(editingId, form);
      } else {
        block = await adminService.createAboutBlock({ ...form, images: [] });
      }
      const id = (editingId ?? block._id)!;

      // 2. Upload new images (files), collect final array
      const finalImages: { url: string; position: string }[] = [];
      for (const img of localImages) {
        if (img.file) {
          const { url } = await adminService.uploadAboutBlockImage(
            id,
            img.file,
          );
          uploadedUrls.push(url);
          finalImages.push({ url, position: positionToString(img.position) });
        } else if (img.cloudUrl) {
          finalImages.push({
            url: img.cloudUrl,
            position: positionToString(img.position),
          });
        }
      }

      // 3. Replace entire images array (also clears deleted ones)
      const updated = await adminService.updateAboutBlockImages(
        id,
        finalImages,
      );

      setBlocks((prev) =>
        editingId
          ? prev.map((b) => (b._id === editingId ? updated : b))
          : [...prev, updated],
      );
      showToast(c.saved, "success");
      setShowForm(false);
    } catch (err) {
      // Cleanup images uploaded to Cloudinary but not persisted to DB
      if (uploadedUrls.length > 0) {
        await Promise.allSettled(
          uploadedUrls.map((url) => adminService.deleteAboutImage(url)),
        );
      }
      setError(err instanceof Error ? err.message : c.errorSave);
    } finally {
      setSaving(false);
    }
  };

  // ─── delete block ────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteAboutBlock(id);
      setBlocks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorDelete);
    } finally {
      setConfirmId(null);
    }
  };

  // ─── reorder ─────────────────────────────────────────────────────────────────

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
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorSave);
    }
  };

  if (loading) return <Loader />;

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 admin-fade-in">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button onClick={openCreate} className="px-4 py-2">
        <Plus size={14} />
        {a.addBtn}
      </Button>

      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <ul className="divide-y divide-border/50">
          {blocks.map((block, i) => {
            const firstImg = block.images?.[0];
            return (
              <li key={block._id} className="py-4 flex items-start gap-4">
                {firstImg ? (
                  <img
                    src={getOptimizedUrl(firstImg.url)}
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
                  {block.images?.length > 1 && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {block.images.length} фото
                    </p>
                  )}
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
            );
          })}
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

            {/* ── Photo section ─────────────────────────────────────────── */}
            <div className="space-y-3">
              <label className="text-xs tracking-wide uppercase text-muted-foreground">
                {a.fields.photo}
                <span className="ml-1 normal-case text-muted-foreground/50">
                  ({localImages.length}/{MAX_IMAGES})
                </span>
              </label>

              {/* Thumbnails row */}
              <div className="flex gap-2 flex-wrap">
                {localImages.map((img, i) => (
                  <button
                    key={img.key}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`relative w-16 h-[52px] rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      activeIdx === i
                        ? "border-foreground"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <img
                      src={img.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-foreground/80 text-background rounded-full flex items-center justify-center hover:bg-foreground transition-colors z-10"
                    >
                      <X size={8} />
                    </span>
                  </button>
                ))}

                {/* Add slot */}
                {localImages.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-16 h-[52px] rounded-lg border-2 border-dashed border-border hover:border-foreground/50 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Position editor for active image */}
              {activeImage && (
                <div className="space-y-2">
                  <div
                    ref={frameRef}
                    className="relative overflow-hidden rounded-xl border border-border bg-muted cursor-grab active:cursor-grabbing select-none"
                    style={{
                      width: FRAME_W,
                      height: FRAME_H,
                      touchAction: "none",
                    }}
                    onMouseDown={handleFrameMouseDown}
                    onTouchStart={handleFrameTouchStart}
                    onTouchMove={handleFrameTouchMove}
                    onTouchEnd={() => {
                      touchState.current = null;
                    }}
                  >
                    <div
                      style={getWrapperStyle(activeImage.position, FRAME_AR)}
                    >
                      <img
                        src={activeImage.preview}
                        alt="preview"
                        draggable={false}
                        style={imgStyle}
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2"
                    style={{ width: FRAME_W }}
                  >
                    <button
                      type="button"
                      onClick={() => handleZoom("out")}
                      disabled={activeImage.position.scale <= 1}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <input
                      type="range"
                      min={100}
                      max={400}
                      step={1}
                      value={Math.round(activeImage.position.scale * 100)}
                      onChange={(e) =>
                        setActivePos(
                          clampPosition(
                            {
                              ...activeImage.position,
                              scale: Number(e.target.value) / 100,
                            },
                            FRAME_AR,
                          ),
                        )
                      }
                      className="flex-1 accent-foreground cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleZoom("in")}
                      disabled={activeImage.position.scale >= 4}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      <ZoomIn size={15} />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60">
                    Перетягуйте · прокручуйте для масштабу
                  </p>
                </div>
              )}

              {localImages.length === 0 && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
                  style={{ width: FRAME_W, height: FRAME_H }}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon size={28} />
                    <span className="text-xs">{c.choosePhoto}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-amber-500/90">
                Рекомендований розмір: 800×640 px (горизонтальна, 5:4)
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

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

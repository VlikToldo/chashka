import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Trash2,
  ImageOff,
  AlertTriangle,
  Save,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import {
  type PhotoPosition,
  DEFAULT_POSITION,
  parsePosition,
  positionToString,
  getWrapperStyle,
  imgStyle,
  clampPosition,
} from "../../utils/photoPosition";

// 9:16 portrait preview frame dimensions (px)
const FRAME_W = 200;
const FRAME_H = Math.round((FRAME_W * 16) / 9);
const FRAME_AR = FRAME_W / FRAME_H; // 9/16 ≈ 0.5625

export default function SplashPhotoManager() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const s = t.admin.splash;
  const c = t.admin.common;

  const [image, setImage] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] =
    useState<PhotoPosition>(DEFAULT_POSITION);
  const [enabled, setEnabled] = useState(true);

  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editPos, setEditPos] = useState<PhotoPosition>(DEFAULT_POSITION);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPos, setSavingPos] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

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
      .getSplashPhoto()
      .then((data) => {
        setImage(data.image);
        setCurrentPosition(parsePosition(data.objectPosition ?? "{}"));
        setEnabled(data.enabled);
      })
      .catch(() => showToast(c.errorLoad, "error"))
      .finally(() => setLoading(false));
  }, []);

  // Global mousemove/mouseup for edit-modal drag
  useEffect(() => {
    if (!preview) return;
    const onMove = (e: MouseEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      setEditPos((prev) =>
        clampPosition({
          ...prev,
          x: drag.posX + (e.clientX - drag.x) * (100 / FRAME_W),
          y: drag.posY + (e.clientY - drag.y) * (100 / FRAME_H),
        }, FRAME_AR),
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
  }, [preview]);

  // Wheel zoom on edit-modal frame
  useEffect(() => {
    if (!preview || !frameRef.current) return;
    const el = frameRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setEditPos((prev) =>
        clampPosition({
          ...prev,
          scale: Math.max(1, Math.min(4, prev.scale + delta)),
        }, FRAME_AR),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [preview]);

  const handleMouseDownEdit = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragState.current = {
        x: e.clientX,
        y: e.clientY,
        posX: editPos.x,
        posY: editPos.y,
      };
    },
    [editPos],
  );

  const handleTouchStartEdit = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchState.current = {
        x: touch.clientX,
        y: touch.clientY,
        posX: editPos.x,
        posY: editPos.y,
      };
    },
    [editPos],
  );

  const handleTouchMoveEdit = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;
    e.preventDefault();
    const ts = touchState.current;
    const touch = e.touches[0];
    setEditPos((prev) =>
      clampPosition({
        ...prev,
        x: ts.posX + (touch.clientX - ts.x) * (100 / FRAME_W),
        y: ts.posY + (touch.clientY - ts.y) * (100 / FRAME_H),
      }, FRAME_AR),
    );
  }, []);

  const handleZoom = useCallback((dir: "in" | "out") => {
    setEditPos((prev) =>
      clampPosition({
        ...prev,
        scale: Math.max(
          1,
          Math.min(4, prev.scale + (dir === "in" ? 0.15 : -0.15)),
        ),
      }, FRAME_AR),
    );
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setPreview(url);
    const tmp = new Image();
    tmp.onload = () => {
      setEditPos({
        ...DEFAULT_POSITION,
        ar: tmp.naturalWidth / tmp.naturalHeight,
      });
    };
    tmp.src = url;
    e.target.value = "";
  }

  async function handleSave() {
    if (!pendingFile) return;
    setSaving(true);
    try {
      const posStr = positionToString(editPos);
      const data = await adminService.uploadSplashPhoto(pendingFile, posStr);
      setImage(data.image);
      setCurrentPosition(parsePosition(data.objectPosition ?? "{}"));
      setEnabled(data.enabled);
      setPreview(null);
      setPendingFile(null);
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePosition() {
    setSavingPos(true);
    try {
      const data = await adminService.updateSplashPhotoPosition(
        positionToString(currentPosition),
      );
      setCurrentPosition(parsePosition(data.objectPosition ?? "{}"));
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setSavingPos(false);
    }
  }

  function handleCancelPreview() {
    setPreview(null);
    setPendingFile(null);
    setEditPos(DEFAULT_POSITION);
  }

  async function handleDelete() {
    if (!window.confirm(c.confirmDelete)) return;
    setDeleting(true);
    try {
      const data = await adminService.deleteSplashPhoto();
      setImage(data.image);
      setCurrentPosition(DEFAULT_POSITION);
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorDelete, "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle(checked: boolean) {
    setToggling(true);
    try {
      const data = await adminService.updateSplashPhotoEnabled(checked);
      setEnabled(data.enabled);
      showToast(c.saved, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : c.errorSave, "error");
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="w-full max-w-3xl space-y-6 admin-fade-in">
      {/* Main layout: frame left, controls right on desktop */}
      {!preview && (
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* — Portrait frame — */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            {image ? (
              <>
                <div
                  className="relative overflow-hidden rounded-xl border border-border shadow-md select-none cursor-grab active:cursor-grabbing"
                  style={{ width: FRAME_W, height: FRAME_H }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startPos = {
                      x: e.clientX,
                      y: e.clientY,
                      posX: currentPosition.x,
                      posY: currentPosition.y,
                    };
                    dragState.current = startPos;
                    const onMove = (ev: MouseEvent) => {
                      const drag = dragState.current;
                      if (!drag) return;
                      setCurrentPosition((prev) =>
                        clampPosition({
                          ...prev,
                          x:
                            drag.posX + (ev.clientX - drag.x) * (100 / FRAME_W),
                          y:
                            drag.posY + (ev.clientY - drag.y) * (100 / FRAME_H),
                        }, FRAME_AR),
                      );
                    };
                    const onUp = () => {
                      dragState.current = null;
                      document.removeEventListener("mousemove", onMove);
                      document.removeEventListener("mouseup", onUp);
                    };
                    document.addEventListener("mousemove", onMove);
                    document.addEventListener("mouseup", onUp);
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    touchState.current = {
                      x: touch.clientX,
                      y: touch.clientY,
                      posX: currentPosition.x,
                      posY: currentPosition.y,
                    };
                  }}
                  onTouchMove={(e) => {
                    if (!touchState.current) return;
                    e.preventDefault();
                    const ts = touchState.current;
                    const touch = e.touches[0];
                    setCurrentPosition((prev) =>
                      clampPosition({
                        ...prev,
                        x: ts.posX + (touch.clientX - ts.x) * (100 / FRAME_W),
                        y: ts.posY + (touch.clientY - ts.y) * (100 / FRAME_H),
                      }, FRAME_AR),
                    );
                  }}
                  onTouchEnd={() => {
                    touchState.current = null;
                  }}
                >
                  <div style={getWrapperStyle(currentPosition, FRAME_AR)}>
                    <img
                      src={image}
                      alt="splash"
                      draggable={false}
                      style={imgStyle}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/70">
                  перетягуйте · прокручуйте для масштабу
                </p>
                <p className="text-[11px] text-muted-foreground/50">
                  9:16 · 1080×1920px
                </p>
              </>
            ) : (
              <>
                <div
                  className="overflow-hidden rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/30"
                  style={{ width: FRAME_W, height: FRAME_H }}
                >
                  <ImageOff size={32} />
                  <span className="text-xs text-center px-4">{s.noPhoto}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/50">
                  9:16 · 1080×1920px
                </p>
              </>
            )}
          </div>

          {/* — Right side controls — */}
          <div className="flex flex-col gap-5 flex-1 min-w-0">
            {/* Format warning */}
            <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{s.formatWarning}</p>
            </div>

            {/* Zoom slider (only if image exists) */}
            {image && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 tracking-wide uppercase">
                  {/* zoom */}Масштаб
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setCurrentPosition((p) =>
                        clampPosition({
                          ...p,
                          scale: Math.max(1, p.scale - 0.15),
                        }, FRAME_AR),
                      )
                    }
                    disabled={currentPosition.scale <= 1}
                    className="p-1.5"
                  >
                    <ZoomOut size={16} />
                  </Button>
                  <input
                    type="range"
                    min={100}
                    max={400}
                    step={1}
                    value={Math.round(currentPosition.scale * 100)}
                    onChange={(e) =>
                      setCurrentPosition((p) =>
                        clampPosition({
                          ...p,
                          scale: Number(e.target.value) / 100,
                        }, FRAME_AR),
                      )
                    }
                    className="flex-1 accent-foreground cursor-pointer"
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setCurrentPosition((p) =>
                        clampPosition({
                          ...p,
                          scale: Math.min(4, p.scale + 0.15),
                        }, FRAME_AR),
                      )
                    }
                    disabled={currentPosition.scale >= 4}
                    className="p-1.5"
                  >
                    <ZoomIn size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Upload / delete / save position */}
            <div className="flex flex-wrap gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="secondary"
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2"
              >
                <Upload size={14} />
                {s.chooseBtn}
              </Button>
              {image && (
                <>
                  <Button
                    onClick={handleSavePosition}
                    disabled={savingPos}
                    className="px-4 py-2"
                  >
                    <Save size={14} />
                    {savingPos ? c.saving : "Зберегти позицію"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2"
                  >
                    <Trash2 size={14} />
                    {deleting ? c.saving : s.deleteBtn}
                  </Button>
                </>
              )}
            </div>

            {/* Enabled toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none w-fit mt-1">
              <input
                type="checkbox"
                checked={enabled}
                disabled={toggling}
                onChange={(e) => handleToggle(e.target.checked)}
                className="w-4 h-4 accent-foreground cursor-pointer"
              />
              <span className="text-sm text-foreground">{s.enabledLabel}</span>
            </label>
          </div>
        </div>
      )}

      {/* Edit-position modal (shown while pending file selected) */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xs bg-background border border-border rounded-xl my-8">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-medium tracking-wide">
                Позиція фото
              </h2>
              <Button variant="ghost" onClick={handleCancelPreview}>
                <X size={18} />
              </Button>
            </div>

            <div className="px-5 pb-5 flex flex-col items-center gap-5">
              <p className="text-xs text-muted-foreground text-center">
                Перетягуйте фото · прокручуйте для масштабу
              </p>

              {/* 9:16 drag frame */}
              <div
                ref={frameRef}
                className="overflow-hidden rounded-xl bg-muted border-2 border-border cursor-grab active:cursor-grabbing select-none relative"
                style={{ width: FRAME_W, height: FRAME_H }}
                onMouseDown={handleMouseDownEdit}
                onTouchStart={handleTouchStartEdit}
                onTouchMove={handleTouchMoveEdit}
                onTouchEnd={() => {
                  touchState.current = null;
                }}
              >
                <div style={getWrapperStyle(editPos, FRAME_AR)}>
                  <img
                    src={preview}
                    alt="edit"
                    draggable={false}
                    style={imgStyle}
                  />
                </div>
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="ghost"
                  onClick={() => handleZoom("out")}
                  disabled={editPos.scale <= 1}
                  className="p-1.5"
                >
                  <ZoomOut size={16} />
                </Button>
                <input
                  type="range"
                  min={100}
                  max={400}
                  step={1}
                  value={Math.round(editPos.scale * 100)}
                  onChange={(e) =>
                    setEditPos((prev) =>
                      clampPosition({
                        ...prev,
                        scale: Number(e.target.value) / 100,
                      }, FRAME_AR),
                    )
                  }
                  className="flex-1 accent-foreground cursor-pointer"
                />
                <Button
                  variant="ghost"
                  onClick={() => handleZoom("in")}
                  disabled={editPos.scale >= 4}
                  className="p-1.5"
                >
                  <ZoomIn size={16} />
                </Button>
              </div>

              <div className="flex gap-3 w-full pt-1">
                <Button
                  variant="secondary"
                  onClick={handleCancelPreview}
                  className="flex-1 px-4 py-2"
                >
                  {c.cancel}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 justify-center"
                >
                  <Save size={12} />
                  {saving ? c.saving : c.save}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

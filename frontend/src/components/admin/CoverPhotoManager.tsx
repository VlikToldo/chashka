import { useState, useEffect, useRef, useCallback } from "react";
import { ImageIcon, Upload, Save, X, ZoomIn, ZoomOut } from "lucide-react";
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
import { getOptimizedUrl } from "../../utils/imageUrl";

const CIRCLE_SIZE = 288;

export default function CoverPhotoManager() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const a = t.admin.cover;
  const c = t.admin.common;

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] =
    useState<PhotoPosition>(DEFAULT_POSITION);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editPos, setEditPos] = useState<PhotoPosition>(DEFAULT_POSITION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
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
      .getCoverPhoto()
      .then((data) => {
        setCurrentImage(data.image);
        setCurrentPosition(parsePosition(data.objectPosition || "{}"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!preview) return;

    const onMove = (e: MouseEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const toPercent = 100 / CIRCLE_SIZE;
      setEditPos((prev) =>
        clampPosition({
          ...prev,
          x: drag.posX + dx * toPercent,
          y: drag.posY + dy * toPercent,
        }),
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

  useEffect(() => {
    if (!preview || !circleRef.current) return;
    const el = circleRef.current;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setEditPos((prev) =>
        clampPosition({
          ...prev,
          scale: Math.max(1, Math.min(4, prev.scale + delta)),
        }),
      );
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [preview]);

  const handleMouseDown = useCallback(
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

  const handleTouchStart = useCallback(
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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;
    e.preventDefault();
    const ts = touchState.current;
    if (!ts) return;
    const touch = e.touches[0];
    const dx = touch.clientX - ts.x;
    const dy = touch.clientY - ts.y;
    const toPercent = 100 / CIRCLE_SIZE;
    setEditPos((prev) =>
      clampPosition({
        ...prev,
        x: ts.posX + dx * toPercent,
        y: ts.posY + dy * toPercent,
      }),
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
      }),
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setPreview(url);
    // Read natural dimensions to store aspect ratio
    const tempImg = new Image();
    tempImg.onload = () => {
      setEditPos({
        ...DEFAULT_POSITION,
        ar: tempImg.naturalWidth / tempImg.naturalHeight,
      });
    };
    tempImg.src = url;
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    setSaving(true);
    setError(null);
    try {
      const posStr = positionToString(editPos);
      const { image, objectPosition } = await adminService.uploadCoverPhoto(
        pendingFile,
        posStr,
      );
      setCurrentImage(image);
      setCurrentPosition(parsePosition(objectPosition as string));
      setPreview(null);
      setPendingFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      showToast(c.saved, "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorSave);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPendingFile(null);
    setPreview(null);
    setEditPos(DEFAULT_POSITION);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 max-w-2xl admin-fade-in">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-4">
        <h3 className="text-sm font-medium tracking-wide">{a.chooseBtn}</h3>
        <div className="flex items-center gap-8 flex-wrap md:flex-nowrap">
          <div
            className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer border border-border hover:border-foreground transition-colors flex-shrink-0 relative"
            onClick={() => fileRef.current?.click()}
          >
            {currentImage ? (
              <div style={getWrapperStyle(currentPosition)}>
                <img
                  src={getOptimizedUrl(currentImage)}
                  alt="cover"
                  style={imgStyle}
                />
              </div>
            ) : (
              <ImageIcon size={32} className="text-muted-foreground" />
            )}
          </div>

          <div className="space-y-3 flex-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs tracking-wide uppercase border-b border-border pb-0.5 hover:border-foreground transition-colors"
            >
              <Upload size={12} />
              {a.chooseBtn}
            </button>
            <p className="text-xs text-muted-foreground">{a.hint}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {pendingFile && preview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xs bg-background border border-border rounded-xl my-8">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-medium tracking-wide">
                Позиція фото
              </h2>
              <Button variant="ghost" onClick={handleCancel}>
                <X size={18} />
              </Button>
            </div>

            <div className="px-5 pb-5 flex flex-col items-center gap-5">
              <p className="text-xs text-muted-foreground text-center">
                Перетягуйте фото · прокручуйте для масштабу
              </p>

              <div
                ref={circleRef}
                className="rounded-full overflow-hidden bg-muted border-2 border-border cursor-grab active:cursor-grabbing select-none relative"
                style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => {
                  touchState.current = null;
                }}
              >
                <div style={getWrapperStyle(editPos)}>
                  <img
                    src={preview}
                    alt="edit"
                    draggable={false}
                    style={imgStyle}
                  />
                </div>
              </div>

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
                      }),
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
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2"
                >
                  Скасувати
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 justify-center"
                >
                  <Save size={12} />
                  {saving ? "..." : saved ? "✓" : "Зберегти"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

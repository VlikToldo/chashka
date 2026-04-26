import { useState, useEffect } from "react";
import { splashService } from "../services/menuService";
import {
  parsePosition,
  getWrapperStyle,
  imgStyle,
} from "../utils/photoPosition";

const SESSION_KEY = "splash_dismissed";

export default function SplashScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [position, setPosition] = useState(parsePosition("{}"));
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    splashService
      .getPhoto()
      .then((data) => {
        if (!data.enabled || !data.image) return;
        setImage(data.image);
        setPosition(parsePosition(data.objectPosition ?? "{}"));
        setVisible(true);
      })
      .catch(() => {});
  }, []);

  // Запускаємо fade-in тільки після того, як браузер намалював opacity:0
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setOpacity(1), 50);
    return () => clearTimeout(timer);
  }, [visible]);

  function dismiss() {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 400);
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer"
      style={{
        opacity: fading ? 0 : opacity,
        transition: fading ? "opacity 0.4s ease" : "opacity 0.5s ease",
        backdropFilter: "blur(16px) brightness(0.5)",
        WebkitBackdropFilter: "blur(16px) brightness(0.5)",
        backgroundColor: "rgba(0,0,0,0.35)",
      }}
      aria-label="Закрити превю"
      role="button"
    >
      {/* Portrait photo — 9:16.
          Mobile: fits within the viewport with 24px vertical padding so edges of blurred bg stay visible.
          Desktop: capped at 480px wide so it never dominates large screens. */}
      <div
        className="relative select-none rounded-2xl overflow-hidden shadow-2xl"
        style={{
          height: "calc(100vh - 48px)",
          aspectRatio: "9 / 16",
          maxHeight: "calc(100vw * 16 / 9 - 48px)",
          maxWidth: "min(calc((100vh - 48px) * 9 / 16), 480px)",
        }}
      >
        <div style={getWrapperStyle(position, 9 / 16)}>
          <img src={image!} alt="" draggable={false} style={imgStyle} />
        </div>
        {/* Subtle tap hint */}
        <div
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          style={{
            opacity: fading ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <span className="text-white/70 text-xs tracking-widest uppercase animate-pulse">
            tap to continue
          </span>
        </div>
      </div>
    </div>
  );
}

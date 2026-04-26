import { useRef, useState, useCallback } from "react";
import { useDragControls } from "framer-motion";

export function useLongPressDrag(delay = 500) {
  const controls = useDragControls();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

  // Immediate drag start — for grip handle (touch-action:none required on the element)
  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      controls.start(e.nativeEvent);
    },
    [controls],
  );

  // Long-press drag — for the whole row on desktop
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const nativeEvent = e.nativeEvent;
      setPressing(true);

      const cancel = () => {
        setPressing(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };

      window.addEventListener("pointerup", cancel, { once: true });
      window.addEventListener("pointercancel", cancel, { once: true });

      timerRef.current = setTimeout(() => {
        window.removeEventListener("pointercancel", cancel);
        controls.start(nativeEvent);
      }, delay);
    },
    [controls, delay],
  );

  return { controls, onPointerDown, pressing, startDrag };
}

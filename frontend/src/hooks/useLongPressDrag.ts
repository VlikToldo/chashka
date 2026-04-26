import { useRef, useState, useCallback } from "react";
import { useDragControls } from "framer-motion";

export function useLongPressDrag(delay = 500) {
  const controls = useDragControls();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

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

      timerRef.current = setTimeout(() => {
        setPressing(false);
        controls.start(nativeEvent);
      }, delay);
    },
    [controls, delay],
  );

  return { controls, onPointerDown, pressing };
}

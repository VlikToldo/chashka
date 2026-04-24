import { useRef, useCallback } from "react";

const EDGE_SIZE = 80; // px from viewport edge to trigger scroll
const MAX_SPEED = 15; // max px per animation frame

export function useAutoScroll() {
  const rafRef = useRef<number | null>(null);
  const pointerY = useRef(0);
  const active = useRef(false);

  const loop = useCallback(() => {
    if (!active.current) return;
    const viewportH = window.innerHeight;
    const y = pointerY.current;

    let speed = 0;
    if (y < EDGE_SIZE) {
      speed = -MAX_SPEED * (1 - y / EDGE_SIZE);
    } else if (y > viewportH - EDGE_SIZE) {
      speed = MAX_SPEED * (1 - (viewportH - y) / EDGE_SIZE);
    }

    if (speed !== 0) window.scrollBy(0, speed);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    pointerY.current = e.clientY;
  }, []);

  const startAutoScroll = useCallback(() => {
    active.current = true;
    window.addEventListener("pointermove", onPointerMove);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, onPointerMove]);

  const stopAutoScroll = useCallback(() => {
    active.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [onPointerMove]);

  return { startAutoScroll, stopAutoScroll };
}

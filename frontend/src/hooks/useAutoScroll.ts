import { useRef, useCallback } from "react";

const EDGE_SIZE = 80;
const MAX_SPEED = 15;

export function useAutoScroll() {
  const rafRef = useRef<number | null>(null);
  const pointerY = useRef(0);
  const active = useRef(false);

  const stop = useCallback(() => {
    active.current = false;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", stop);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onMove = useCallback((e: PointerEvent) => {
    pointerY.current = e.clientY;
  }, []);

  const loop = useCallback(() => {
    if (!active.current) return;
    const viewportH = window.innerHeight;
    const y = pointerY.current;
    let speed = 0;
    if (y < EDGE_SIZE) speed = -MAX_SPEED * (1 - y / EDGE_SIZE);
    else if (y > viewportH - EDGE_SIZE) speed = MAX_SPEED * (1 - (viewportH - y) / EDGE_SIZE);
    if (speed !== 0) window.scrollBy(0, speed);
    rafRef.current = requestAnimationFrame(loop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startAutoScroll = useCallback(() => {
    if (active.current) return;
    active.current = true;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop, { once: true });
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, onMove, stop]);

  return { startAutoScroll };
}

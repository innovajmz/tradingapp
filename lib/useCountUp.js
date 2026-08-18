"use client";
import { useEffect, useRef, useState } from "react";

export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);
  const frameRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = Number(target) || 0;
    if (from === to) return;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

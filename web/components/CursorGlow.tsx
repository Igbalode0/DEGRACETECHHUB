"use client";

import { useEffect, useRef } from "react";

const SIZE = 640;

// Subtle blue glow that trails the cursor on desktop. Pointer-fine devices
// only; disabled for prefers-reduced-motion. Purely decorative.
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let targetX = -SIZE;
    let targetY = -SIZE;
    let x = targetX;
    let y = targetY;

    const tick = () => {
      x += (targetX - x) * 0.1;
      y += (targetY - y) * 0.1;
      el.style.transform = `translate(${(x - SIZE / 2).toFixed(1)}px, ${(y - SIZE / 2).toFixed(1)}px)`;
      raf = Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      el.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 3,
        opacity: 0,
        transition: "opacity 0.6s ease",
      }}
    />
  );
}

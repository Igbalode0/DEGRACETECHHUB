"use client";

import { useRef, type ReactNode } from "react";

// Magnetic hover: the wrapped element leans toward the cursor and springs
// back on leave. Mouse-only; sits out prefers-reduced-motion.
export default function Magnetic({ children, strength = 0.22 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * strength;
    const y = (e.clientY - r.top - r.height / 2) * strength;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{ display: "inline-flex", transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

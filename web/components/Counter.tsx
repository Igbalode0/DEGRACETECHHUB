"use client";

import { useEffect, useRef, useState } from "react";

export default function Counter({ target, suffix = "", className }: { target: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          const duration = 1500;
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setValue(Math.floor(target * (1 - Math.pow(1 - t, 3))));
            if (t < 1) requestAnimationFrame(step);
            else setValue(target);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <div ref={ref} className={className}>
      {value.toLocaleString()}
      {suffix}
    </div>
  );
}

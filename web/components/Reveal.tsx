"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delayMs?: number;
} & Record<string, unknown>;

export default function Reveal({ children, as: Tag = "div", className, style, delayMs = 0, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    const fallback = setTimeout(() => setVisible(true), 3000);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal
      data-visible={visible ? "true" : undefined}
      className={className}
      style={delayMs ? { transitionDelay: `${delayMs}ms`, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

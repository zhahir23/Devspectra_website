"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** HTML tag to render. Default: div */
  as?: ElementType;
  /** Animation variant */
  variant?: "up" | "fade" | "scale";
  /** Delay in ms before the animation starts once visible */
  delay?: number;
  className?: string;
};

export default function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  delay = 0,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const base =
    variant === "fade" ? "reveal reveal-fade" : variant === "scale" ? "reveal reveal-scale" : "reveal";

  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? "is-visible" : ""} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

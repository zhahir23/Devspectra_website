"use client";

import { useEffect, useState } from "react";

const ChevronUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function ScrollButtons() {
  const [scrollY, setScrollY] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollY(y);
      setPageHeight(h);
      setVisible(h > 200); // sembunyikan kalau konten tidak cukup panjang
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!visible) return null;

  const atTop    = scrollY < 80;
  const atBottom = scrollY >= pageHeight - 80;

  const scrollTo = (target: "top" | "bottom") => {
    window.scrollTo({
      top: target === "top" ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 md:bottom-8 md:right-6">
      {/* Scroll ke atas */}
      <button
        type="button"
        aria-label="Scroll ke atas"
        onClick={() => scrollTo("top")}
        disabled={atTop}
        className={`
          flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-md
          transition-all duration-300
          border-zinc-200 dark:border-zinc-700
          bg-white/80 dark:bg-zinc-900/80
          text-zinc-600 dark:text-zinc-300
          hover:border-zinc-400 dark:hover:border-zinc-500
          hover:bg-white dark:hover:bg-zinc-800
          hover:text-zinc-900 dark:hover:text-zinc-100
          hover:-translate-y-0.5 hover:shadow-xl
          active:scale-95
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0
        `}
      >
        <ChevronUp />
      </button>

      {/* Scroll ke bawah */}
      <button
        type="button"
        aria-label="Scroll ke bawah"
        onClick={() => scrollTo("bottom")}
        disabled={atBottom}
        className={`
          flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-md
          transition-all duration-300
          border-zinc-200 dark:border-zinc-700
          bg-white/80 dark:bg-zinc-900/80
          text-zinc-600 dark:text-zinc-300
          hover:border-zinc-400 dark:hover:border-zinc-500
          hover:bg-white dark:hover:bg-zinc-800
          hover:text-zinc-900 dark:hover:text-zinc-100
          hover:translate-y-0.5 hover:shadow-xl
          active:scale-95
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0
        `}
      >
        <ChevronDown />
      </button>
    </div>
  );
}

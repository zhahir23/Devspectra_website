"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const SunIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={`h-8 w-8 ${className ?? ""}`} />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300
        ${isDark
          ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
          : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
        } ${className ?? ""}`}
    >
      {isDark
        ? <SunIcon className="h-4 w-4" />
        : <MoonIcon className="h-4 w-4" />
      }
    </button>
  );
}

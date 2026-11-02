"use client";

import { useEffect, useState } from "react";

const ClockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
  </svg>
);

export default function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Avoid hydration mismatch: render a stable placeholder until mounted.
  const time = now
    ? now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      })
    : "--:--:--";

  return (
    <span
      className={`inline-flex items-center gap-2 tabular-nums ${className ?? ""}`}
      aria-label="Waktu saat ini (WIB)"
      suppressHydrationWarning
    >
      <ClockIcon className="h-4 w-4 text-zinc-400" />
      {time} WIB
    </span>
  );
}

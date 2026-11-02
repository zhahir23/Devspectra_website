"use client";

import { useRef, useState } from "react";

export type Testimonial = {
  name: string;
  role: string;
  message: string;
  rating: number;
  avatar: string;
};

// ── Icons ────────────────────────────────────────────────
const ChevronLeft = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
  </svg>
);
const ChevronRight = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
    className={`h-4 w-4 ${filled ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"
    />
  </svg>
);

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────
// Isinya hanya testimoni berstatus Tampil di dashboard (Konten website > Testimoni), sama untuk
// semua pengunjung. Penilaian dari halaman Contact masuk ke dashboard dulu, tidak disimpan di browser.
export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const all = testimonials;

  // Tombol geser manual
  const scrollByCards = (dir: "left" | "right") => {
    trackRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-8">
      {/* Prev button */}
      <button
        type="button"
        aria-label="Geser ke kiri"
        onClick={() => scrollByCards("left")}
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 p-2 text-zinc-600 dark:text-zinc-300 shadow-lg backdrop-blur transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next button */}
      <button
        type="button"
        aria-label="Geser ke kanan"
        onClick={() => scrollByCards("right")}
        className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 p-2 text-zinc-600 dark:text-zinc-300 shadow-lg backdrop-blur transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Scrollable + auto-scroll track */}
      <div
        ref={trackRef}
        className="w-full overflow-x-auto px-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex w-max gap-5 animate-marquee"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {[...all, ...all].map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="flex w-72 flex-shrink-0 flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
            >
              <Stars rating={t.rating} />

              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 line-clamp-4">
                &ldquo;{t.message}&rdquo;
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";

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

export type Client = {
  name: string;
  image: string;
};

export default function ClientsCarousel({ clients }: { clients: Client[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const scrollByCards = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <div className="relative mt-8">
      {/* Prev */}
      <button
        type="button"
        aria-label="Geser ke kiri"
        onClick={() => scrollByCards("left")}
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 p-2 text-zinc-600 dark:text-zinc-300 shadow-lg backdrop-blur transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:-translate-y-[calc(50%+2px)] hover:shadow-xl"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next */}
      <button
        type="button"
        aria-label="Geser ke kanan"
        onClick={() => scrollByCards("right")}
        className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 p-2 text-zinc-600 dark:text-zinc-300 shadow-lg backdrop-blur transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:-translate-y-[calc(50%+2px)] hover:shadow-xl"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="w-full overflow-x-auto px-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex w-max gap-4 animate-marquee"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {[...clients, ...clients].map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              title={client.name}
              className="group flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
            >
              <div className="relative h-full w-full">
                <Image
                  src={client.image}
                  alt={client.name}
                  fill
                  sizes="144px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

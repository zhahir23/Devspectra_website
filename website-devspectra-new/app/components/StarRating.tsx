"use client";

import { useState } from "react";

const LABELS = ["Buruk", "Kurang", "Cukup", "Bagus", "Sangat Bagus"];

const StarIcon = ({ filled, hovered, className }: { filled: boolean; hovered: boolean; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled || hovered ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"
    />
  </svg>
);

type StarRatingProps = {
  value: number;
  onChange: (rating: number) => void;
};

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1" role="group" aria-label="Berikan penilaian">
        {Array.from({ length: 5 }).map((_, i) => {
          const star = i + 1;
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} bintang`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <StarIcon
                filled={star <= value}
                hovered={star <= hovered && star > value}
                className={`h-8 w-8 transition-colors ${
                  star <= (hovered || value)
                    ? "text-amber-400"
                    : "text-zinc-300 dark:text-zinc-600"
                }`}
              />
            </button>
          );
        })}
        {(hovered || value) > 0 && (
          <span className="ml-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {LABELS[(hovered || value) - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

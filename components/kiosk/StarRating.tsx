"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange: (v: number) => void;
  questionId: string;
}

const LABELS = ["ደካማ", "መካከለኛ", "ጥሩ", "በጣም ጥሩ", "እጅግ ጥሩ"];

export function StarRating({ value, onChange, questionId }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 sm:gap-1.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = display !== null && star <= display;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star — ${LABELS[star - 1]}`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(star)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(star)}
              style={{ minWidth: 44, minHeight: 44 }}
              className="flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#E8A020] rounded-lg touch-manipulation transition-transform hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor"
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 transition-all duration-100",
                  filled ? "text-[#E8A020] drop-shadow-[0_0_6px_rgba(232,160,32,0.4)]" : "text-[#E2E2DC]"
                )}>
                <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.8l7.1-.7L12 2.5z"/>
              </svg>
            </button>
          );
        })}
        {value !== null && (
          <span className="font-mono text-[11px] text-[#888] ml-1">
            {value}/5 · {LABELS[value - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

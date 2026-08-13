"use client";
import { cn } from "@/lib/utils";

interface StarDisplayProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarDisplay({ value, max = 5, size = "md", className }: StarDisplayProps) {
  const sizeClass = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" }[size];
  return (
    <span className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn(sizeClass, i < value ? "text-gold" : "text-line-strong")}
        >
          <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.8l7.1-.7L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}

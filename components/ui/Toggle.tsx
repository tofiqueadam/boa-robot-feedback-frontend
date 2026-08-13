"use client";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-[42px] h-6 rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-positive flex-shrink-0",
        checked ? "bg-positive" : "bg-line-strong",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-150",
        checked ? "translate-x-[18px]" : "translate-x-0"
      )} />
    </button>
  );
}

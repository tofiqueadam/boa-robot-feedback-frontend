"use client";
import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/types";

interface MultipleChoiceProps {
  options: QuestionOption[];
  value: string | null;
  onChange: (optionId: string) => void;
}

export function MultipleChoice({ options, value, onChange }: MultipleChoiceProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-100 touch-manipulation",
            value === opt.id
              ? "border-ink bg-ink text-white"
              : "border-line bg-paper hover:border-ink-soft hover:bg-paper-2"
          )}
        >
          <span className={cn(
            "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors",
            value === opt.id ? "border-white bg-white" : "border-ink-soft"
          )} />
          <span className="text-sm font-medium">{opt.option_text}</span>
        </button>
      ))}
    </div>
  );
}

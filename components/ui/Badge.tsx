import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "rating" | "paragraph" | "short_text" | "multiple_choice" | "attention" | "positive" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    rating:          "bg-gold-soft text-[#8A5C00]",
    paragraph:       "bg-positive-soft text-positive",
    short_text:      "bg-blue-50 text-blue-700",
    multiple_choice: "bg-purple-50 text-purple-700",
    attention:       "bg-attention-soft text-attention",
    positive:        "bg-positive-soft text-positive",
    default:         "bg-line text-ink-soft",
  };
  return (
    <span className={cn(
      "font-mono text-[10.5px] tracking-wide px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

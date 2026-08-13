import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <div className="w-8 h-8 border-2 border-line-strong border-t-gold rounded-full animate-spin" />
    </div>
  );
}

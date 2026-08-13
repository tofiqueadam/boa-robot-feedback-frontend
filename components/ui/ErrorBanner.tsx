"use client";
interface ErrorBannerProps { message: string; onRetry?: () => void; }
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 bg-attention-soft border border-attention/20 rounded-card px-4 py-3">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-attention flex-shrink-0">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <p className="text-sm text-attention font-medium flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-attention underline whitespace-nowrap">
          Retry
        </button>
      )}
    </div>
  );
}

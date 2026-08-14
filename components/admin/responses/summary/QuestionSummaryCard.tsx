import type { QuestionSummary } from "@/types";
import { StarDisplay } from "@/components/ui/StarDisplay";

interface Props { summary: QuestionSummary }

export function QuestionSummaryCard({ summary }: Props) {
  const maxCount = Math.max(...summary.distribution.map((d) => d.count), 1);

  return (
    <div className={`bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] border ${
      summary.needs_attention ? "border-red-100" : "border-transparent"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[14.5px] md:text-[17px] text-[#0D0D0D] leading-snug">
            {summary.question_text}
          </p>
          <p className="font-mono text-[11px] md:text-[13px] text-[#888] mt-1.5">
            {summary.response_count.toLocaleString()} responses
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-mono font-bold text-[28px] md:text-[36px] leading-none tracking-tight ${
            summary.needs_attention ? "text-red-500" : "text-[#1A6B3C]"
          }`}>
            {summary.average !== null ? summary.average.toFixed(2) : "—"}
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-widest text-[#888] mt-0.5">avg / 5</div>
          {summary.needs_attention && (
            <div className="mt-2 inline-flex items-center gap-1 bg-red-50 text-red-500 font-mono text-[9.5px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
              <span>⚠</span> Needs attention
            </div>
          )}
        </div>
      </div>

      {/* Stars */}
      {summary.average !== null && (
        <div className="mb-4">
          <StarDisplay value={Math.round(summary.average)} size="sm" />
        </div>
      )}

      {/* Distribution chart */}
      <div className="flex items-end gap-2.5 h-[90px] border-b border-[#F0F0ED] pb-0">
        {summary.distribution.map((bucket) => {
          const barH = maxCount > 0 ? Math.max(Math.round((bucket.count / maxCount) * 72), 3) : 3;
          const isTop = bucket.count === maxCount && bucket.count > 0;
          return (
            <div key={bucket.star} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="font-mono text-[9.5px] text-[#999] mb-1.5 whitespace-nowrap">
                {bucket.count > 0 ? `${bucket.percent.toFixed(0)}%` : ""}
              </div>
              <div className="w-full flex items-end" style={{ height: 72 }}>
                <div
                  className={`w-full rounded-t-[4px] transition-all duration-500 ${
                    isTop ? "bg-[#E8A020]" : "bg-[#E8A020]/30"
                  }`}
                  style={{ height: barH }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2.5 mt-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex-1 text-center font-mono text-[11px] text-[#999] font-medium">{n}</div>
        ))}
      </div>
    </div>
  );
}

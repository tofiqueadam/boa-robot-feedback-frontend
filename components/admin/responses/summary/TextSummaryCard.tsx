"use client";
import { useState } from "react";
import type { QuestionSummary } from "@/types";

const PAGE_SIZE = 10;

interface Props { summary: QuestionSummary }

export function TextSummaryCard({ summary }: Props) {
  const [page, setPage] = useState(1);
  const total     = summary.text_samples.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start     = (page - 1) * PAGE_SIZE;
  const visible   = summary.text_samples.slice(start, start + PAGE_SIZE);

  return (
    <div className="bg-white rounded-[14px] border border-[#E6E5E0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline gap-3 px-6 py-4 border-b border-[#F0F0ED]">
        <p className="font-semibold text-[14.5px] text-[#0D0D0D]">
          {summary.question_text}
        </p>
        <span className="font-mono text-[11px] text-[#BBB] flex-shrink-0">
          {summary.response_count.toLocaleString()} response{summary.response_count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Comments */}
      <div className="px-6 py-3">
        {total === 0 ? (
          <p className="text-[13px] text-[#CCC] italic py-3">No comments yet.</p>
        ) : (
          <>
            <div className="divide-y divide-[#F5F5F3]">
              {visible.map((text, i) => (
                <div key={start + i} className="py-3 flex items-start gap-3">
                  {/* Index */}
                  <span className="font-mono text-[10px] text-[#CCC] mt-0.5 flex-shrink-0 w-5">
                    {start + i + 1}.
                  </span>
                  {/* Quote */}
                  <p className="text-[13.5px] text-[#444] italic leading-relaxed flex-1">
                    "{text}"
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 pb-1 border-t border-[#F5F5F3] mt-2">
                <span className="font-mono text-[11px] text-[#BBB]">
                  {start + 1}–{Math.min(start + PAGE_SIZE, total)} of {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-[7px] border border-[#E6E5E0] text-[#888] hover:bg-[#F8F7F4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="w-7 text-center text-[#BBB] text-[12px]">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`w-7 h-7 flex items-center justify-center rounded-[7px] text-[12px] font-semibold transition-colors ${
                            page === p
                              ? "bg-[#0D0D0D] text-white"
                              : "text-[#888] hover:bg-[#F8F7F4] border border-[#E6E5E0]"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-[7px] border border-[#E6E5E0] text-[#888] hover:bg-[#F8F7F4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

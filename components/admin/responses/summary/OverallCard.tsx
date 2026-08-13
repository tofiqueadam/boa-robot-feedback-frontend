import type { StarBucket } from "@/types";

interface Props {
  average: number | null;
  total: number;
  distribution: StarBucket[];
}

export function OverallCard({ average, total, distribution }: Props) {
  return (
    <div className="bg-[#0D0D0D] rounded-[16px] p-7 flex items-center gap-12 flex-wrap mb-6">
      {/* Score */}
      <div className="text-center flex-shrink-0">
        <div className="font-mono text-[48px] font-bold text-[#E8A020] leading-none tracking-tight">
          {average !== null ? average.toFixed(1) : "—"}
        </div>
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/30 mt-2">
          Overall Score / 5
        </div>
        <div className="font-mono text-[13px] text-white/50 mt-1.5">
          {total.toLocaleString()} responses
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-16 bg-white/10 hidden sm:block flex-shrink-0" />

      {/* Distribution bars */}
      <div className="flex-1 min-w-[200px] flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const bucket = distribution.find((d) => d.star === star);
          const pct = bucket?.percent ?? 0;
          const count = bucket?.count ?? 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-white/35 w-6 flex-shrink-0">{star}★</span>
              <div className="flex-1 h-[6px] bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E8A020] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-white/30 w-8 text-right flex-shrink-0">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import type { IndividualResponse } from "@/types";
import { StarDisplay } from "@/components/ui/StarDisplay";
import { formatDate } from "@/lib/utils";

interface Props { response: IndividualResponse }

const isComment = (type: string) => type === "paragraph" || type === "short_text";

export function ResponseReceipt({ response }: Props) {
  // Ratings and multiple choice first, comments (paragraph/short_text) last
  const sorted = [...response.answers].sort((a, b) => {
    if (isComment(a.question_type) && !isComment(b.question_type)) return 1;
    if (!isComment(a.question_type) && isComment(b.question_type)) return -1;
    return 0;
  });

  return (
    <div className="max-w-[560px]">
      {/* Header bar */}
      <div className="bg-[#0D0D0D] rounded-t-[14px] px-6 py-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/30 tracking-[0.16em] uppercase">Response Receipt</span>
        <span className="w-2 h-2 rounded-full bg-[#E8A020]" />
      </div>

      <div className="bg-white border border-[#E6E5E0] border-t-0 rounded-b-[14px] shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">
        {/* Meta */}
        <div className="px-6 py-5 border-b border-dashed border-[#E6E5E0]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-[#999] uppercase tracking-[0.14em] mb-1">
                Response #{response.id.slice(-6).toUpperCase()}
              </div>
              <div className="font-semibold text-[16px] text-[#0D0D0D]">
                {formatDate(response.submitted_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 bg-[#E8A020]/10 text-[#B87C10] font-mono text-[9.5px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                ✓ Recorded
              </div>
            </div>
          </div>
          <div className="flex gap-6 mt-3">
            {[
              { label: "Location", value: response.location_name },
              { label: "Robot",    value: response.robot_name },
              { label: "Version",  value: response.robot_version },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="font-mono text-[9.5px] uppercase tracking-wide text-[#999] mb-0.5">{label}</div>
                <div className="font-semibold text-[12.5px] text-[#0D0D0D]">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Answers — ratings first, comments at the bottom */}
        <div className="px-6 py-2 divide-y divide-dashed divide-[#EBEBEA]">
          {sorted.map((answer, i) => (
            <div key={answer.id} className="py-4">
              <div className="text-[13px] font-medium text-[#0D0D0D] mb-2.5 leading-snug">
                {i + 1}. {answer.question_text}
              </div>

              {answer.question_type === "rating" && answer.rating_value !== null && (
                <div className="flex items-center gap-3">
                  <StarDisplay value={answer.rating_value} size="sm" />
                  <span className="font-mono text-[12px] text-[#888]">{answer.rating_value}/5</span>
                </div>
              )}

              {isComment(answer.question_type) && (
                <div className="text-[13px] text-[#555] italic leading-relaxed bg-[#F8F8F6] rounded-lg px-3 py-2.5">
                  {answer.text_value
                    ? `"${answer.text_value}"`
                    : <span className="text-[#BBB] not-italic">No comment left.</span>
                  }
                </div>
              )}

              {answer.question_type === "multiple_choice" && (
                <div className="text-[13px] text-[#555]">
                  {answer.selected_option_text ?? "No selection."}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

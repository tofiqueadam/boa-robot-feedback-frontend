"use client";
import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { OverallCard } from "./OverallCard";
import { QuestionSummaryCard } from "./QuestionSummaryCard";
import { TextSummaryCard } from "./TextSummaryCard";
import { SummaryFilters } from "./SummaryFilters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { OverallSummary, Robot, Location } from "@/types";

interface Props {
  robots: Robot[];
  locations: Location[];
  onTotalLoad: (n: number) => void;
}

export function SummaryTab({ robots, locations, onTotalLoad }: Props) {
  const [summary, setSummary] = useState<OverallSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (f: Record<string, string | undefined>) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getSummary(f);
      setSummary(data);
      onTotalLoad(data.total_responses);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onTotalLoad]);

  useEffect(() => {
    load({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SummaryFilters robots={robots} locations={locations} onFilter={load} />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={() => load({})} /></div>}
      {loading && <LoadingSpinner />}

      {!loading && summary && (
        <>
          {summary.total_responses === 0 ? (
            <EmptyState title="No responses yet" description="Responses will appear here after customers submit feedback." />
          ) : (
            <>
              <OverallCard
                average={summary.overall_average}
                total={summary.total_responses}
                distribution={summary.overall_distribution}
              />
              <div className="mt-4 space-y-3.5">
                {/* Rating questions first */}
                {summary.question_summaries
                  .filter((qs) => qs.question_type === "rating")
                  .map((qs) => (
                    <QuestionSummaryCard key={qs.question_id} summary={qs} />
                  ))}
                {/* Text/comment questions always at the bottom */}
                {summary.question_summaries
                  .filter((qs) => qs.question_type !== "rating")
                  .map((qs) => (
                    <TextSummaryCard key={qs.question_id} summary={qs} />
                  ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

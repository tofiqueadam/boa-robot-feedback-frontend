"use client";
import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { ResponseReceipt } from "./ResponseReceipt";
import { IndividualFilters } from "./IndividualFilters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { IndividualResponse, Robot, Location } from "@/types";

interface Props { robots: Robot[]; locations: Location[] }

export function IndividualTab({ robots, locations }: Props) {
  const [responses, setResponses] = useState<IndividualResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  const load = useCallback(async (p: number, f: Record<string, string | undefined>) => {
    setLoading(true); setError("");
    try {
      const data = await api.getIndividualResponses({
        page: String(p), page_size: String(pageSize), ...f,
      });
      setTotal(data.total);
      setResponses(data.items);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [pageSize]);

  useEffect(() => { load(1, {}); }, [load]);

  const handleFilter = (f: Record<string, string | undefined>) => {
    setFilters(f); setPage(1); load(1, f);
  };

  const goToPage = (p: number) => { setPage(p); load(p, filters); };

  const current = responses[0] ?? null;

  return (
    <div>
      <IndividualFilters robots={robots} locations={locations} onFilter={handleFilter} />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={() => load(page, filters)} /></div>}

      {/* Pager */}
      {total > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 font-mono text-[13px] text-ink-soft">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="bg-paper-2 border border-line rounded-lg w-8 h-8 flex items-center justify-center hover:bg-paper disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-ink"
            >‹</button>
            <span>{page} of {total.toLocaleString()}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= total || loading}
              className="bg-paper-2 border border-line rounded-lg w-8 h-8 flex items-center justify-center hover:bg-paper disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-ink"
            >›</button>
          </div>
          <span className="font-mono text-[12px] text-ink-soft">Response {page} of {total.toLocaleString()}</span>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {!loading && total === 0 && <EmptyState title="No responses found" description="Try adjusting your filters." />}
      {!loading && current && <ResponseReceipt response={current} />}
    </div>
  );
}

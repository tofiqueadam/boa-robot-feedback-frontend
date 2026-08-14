"use client";
import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { usePermissions } from "@/lib/PermissionsContext";
import { ResponseReceipt } from "./ResponseReceipt";
import { IndividualFilters } from "./IndividualFilters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { IndividualResponse, Robot, Location } from "@/types";

interface Props { robots: Robot[]; locations: Location[] }

export function IndividualTab({ robots, locations }: Props) {
  const perms = usePermissions();
  const [responses, setResponses]   = useState<IndividualResponse[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [pageSize]                  = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [filters, setFilters]       = useState<Record<string, string | undefined>>({});
  const [deleting, setDeleting]     = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleDelete = async () => {
    const current = responses[0];
    if (!current) return;
    setDeleting(true);
    try {
      await api.deleteResponse(current.id);
      setConfirmOpen(false);
      // Stay on the same page index — if last on page, go back one
      const newTotal = total - 1;
      const newPage = page > newTotal ? Math.max(1, page - 1) : page;
      setPage(newPage);
      await load(newPage, filters);
    } catch (e: any) {
      setError(e.message);
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const current = responses[0] ?? null;

  return (
    <div>
      <IndividualFilters robots={robots} locations={locations} onFilter={handleFilter} />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={() => load(page, filters)} /></div>}

      {/* Pager + delete button */}
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

          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] text-ink-soft">Response {page} of {total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {!loading && total === 0 && <EmptyState title="No responses found" description="Try adjusting your filters." />}
      {!loading && current && (
        <ResponseReceipt
          response={current}
          onDelete={perms.canDeleteResponses ? () => setConfirmOpen(true) : undefined}
        />
      )}

      {/* Confirm delete dialog */}
      {confirmOpen && current && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setConfirmOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-[16px] shadow-[0_16px_48px_rgba(0,0,0,0.18)] w-full max-w-[380px] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F0F0ED]">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth={2} className="w-4 h-4">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[15px] text-[#0D0D0D]">Delete this response?</h3>
                </div>
                <p className="text-[13px] text-[#666] leading-relaxed mt-2">
                  Response <span className="font-mono font-semibold">#{current.id.slice(-6).toUpperCase()}</span> will be permanently deleted.
                  This will also update the summary and analytics immediately.
                </p>
                <p className="text-[12px] text-red-500 font-medium mt-2">This cannot be undone.</p>
              </div>
              <div className="px-6 py-4 flex gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={deleting}
                  className="flex-1 bg-[#F8F7F4] border border-[#E6E5E0] rounded-[10px] py-2.5 text-[13px] font-semibold hover:bg-[#F0F0ED] transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white rounded-[10px] py-2.5 text-[13px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {deleting && <span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />}
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

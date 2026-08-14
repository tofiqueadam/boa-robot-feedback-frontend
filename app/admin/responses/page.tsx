"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SummaryTab } from "@/components/admin/responses/summary/SummaryTab";
import { IndividualTab } from "@/components/admin/responses/individual/IndividualTab";
import type { Robot, Location } from "@/types";

type Tab = "summary" | "individual";

export default function ResponsesPage() {
  const [tab, setTab]                   = useState<Tab>("summary");
  const [totalResponses, setTotal]       = useState<number | null>(null);
  const [robots, setRobots]             = useState<Robot[]>([]);
  const [locations, setLocations]       = useState<Location[]>([]);

  useEffect(() => {
    Promise.all([api.getRobots(), api.getLocations()]).then(([r, l]) => {
      setRobots(r); setLocations(l);
    });
    api.getSummary({}).then((s) => setTotal(s.total_responses));
  }, []);

  const handleExport = (fmt: "csv" | "xlsx") => {
    window.open(api.getExportUrl(fmt, {}), "_blank");
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif font-semibold text-[22px] md:text-[28px] text-ink">Responses</h1>
          {totalResponses !== null && (
            <p className="font-mono text-[13px] md:text-[15px] text-ink-soft mt-0.5">
              {totalResponses.toLocaleString()} total responses
            </p>
          )}
        </div>
        {/* Export dropdown */}
        <div className="relative group">
          <button className="bg-paper-2 text-ink border border-line rounded-[10px] px-4 py-2.5 font-semibold text-sm hover:bg-paper transition-colors shadow-card flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-ink-soft">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div className="absolute right-0 top-full mt-1.5 bg-paper-2 border border-line rounded-xl shadow-card w-36 z-20 hidden group-hover:block overflow-hidden">
            <button onClick={() => handleExport("csv")}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-paper transition-colors">
              Export CSV
            </button>
            <button onClick={() => handleExport("xlsx")}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-paper transition-colors border-t border-line">
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-line mb-6">
        {(["summary", "individual"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2.5 mr-7 font-semibold text-sm capitalize relative transition-colors border-b-[2.5px] -mb-px ${
              tab === t
                ? "text-ink border-gold"
                : "text-ink-soft border-transparent hover:text-ink"
            }`}>
            {t === "individual" ? "Individual Responses" : "Summary"}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <SummaryTab robots={robots} locations={locations} onTotalLoad={setTotal} />
      )}
      {tab === "individual" && (
        <IndividualTab robots={robots} locations={locations} />
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import type { Robot, Location } from "@/types";

interface Props {
  robots: Robot[];
  locations: Location[];
  onFilter: (f: Record<string, string | undefined>) => void;
}

export function SummaryFilters({ robots, locations, onFilter }: Props) {
  const [robotId, setRobotId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const apply = () => {
    onFilter({
      robot_id: robotId || undefined,
      location_id: locationId || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  const reset = () => {
    setRobotId(""); setLocationId(""); setDateFrom(""); setDateTo("");
    onFilter({});
  };

  const hasFilters = robotId || locationId || dateFrom || dateTo;

  return (
    <div className="bg-paper-2 border border-line rounded-card p-4 mb-5 shadow-card">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Robot</label>
          <select value={robotId} onChange={(e) => setRobotId(e.target.value)}
            className="border border-line rounded-lg bg-paper px-3 py-2 text-sm focus:outline-2 focus:outline-positive">
            <option value="">All robots</option>
            {robots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Location</label>
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)}
            className="border border-line rounded-lg bg-paper px-3 py-2 text-sm focus:outline-2 focus:outline-positive">
            <option value="">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="border border-line rounded-lg bg-paper px-3 py-2 text-sm focus:outline-2 focus:outline-positive" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="border border-line rounded-lg bg-paper px-3 py-2 text-sm focus:outline-2 focus:outline-positive" />
        </div>
        <div className="flex gap-2 pb-[1px]">
          <button onClick={apply}
            className="bg-ink text-white rounded-[9px] px-4 py-2 text-sm font-semibold hover:brightness-125 transition-all">
            Apply
          </button>
          {hasFilters && (
            <button onClick={reset}
              className="bg-paper border border-line rounded-[9px] px-4 py-2 text-sm font-semibold hover:bg-paper-2 transition-colors">
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

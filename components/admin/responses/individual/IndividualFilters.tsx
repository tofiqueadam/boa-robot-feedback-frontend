"use client";
import { useState } from "react";
import type { Robot, Location } from "@/types";

interface Props {
  robots: Robot[];
  locations: Location[];
  onFilter: (f: Record<string, string | undefined>) => void;
}

export function IndividualFilters({ robots, locations, onFilter }: Props) {
  const [robotId, setRobotId]       = useState("");
  const [locationId, setLocationId] = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");

  const apply = () => {
    onFilter({
      robot_id:    robotId    || undefined,
      location_id: locationId || undefined,
      date_from:   dateFrom   || undefined,
      date_to:     dateTo     || undefined,
    });
  };

  const reset = () => {
    setRobotId(""); setLocationId(""); setDateFrom(""); setDateTo("");
    onFilter({});
  };

  const hasFilters = robotId || locationId || dateFrom || dateTo;

  return (
    <div className="bg-white border border-[#E6E5E0] rounded-[14px] p-4 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap gap-3 items-end">

        {/* Robot */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#888] font-semibold">
            Robot
          </label>
          <select
            value={robotId}
            onChange={(e) => setRobotId(e.target.value)}
            className="border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2 text-[13px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#E8A020] focus:border-[#E8A020] transition-all"
          >
            <option value="">All robots</option>
            {robots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#888] font-semibold">
            Location
          </label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2 text-[13px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#E8A020] focus:border-[#E8A020] transition-all"
          >
            <option value="">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#888] font-semibold">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2 text-[13px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#E8A020] focus:border-[#E8A020] transition-all"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#888] font-semibold">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2 text-[13px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#E8A020] focus:border-[#E8A020] transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pb-[1px]">
          <button
            onClick={apply}
            className="bg-[#0D0D0D] text-white rounded-[9px] px-5 py-2 text-[13px] font-semibold hover:bg-black transition-colors"
          >
            Apply
          </button>
          {hasFilters && (
            <button
              onClick={reset}
              className="bg-[#F8F7F4] border border-[#E6E5E0] text-[#0D0D0D] rounded-[9px] px-5 py-2 text-[13px] font-semibold hover:bg-[#F0F0ED] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { X, Filter, RotateCcw } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";

export interface FlightFilterState {
  stops: number[]; // 0 = non-stop, 1 = 1 stop
  airlines: string[];
  timeBands: string[]; // "EARLY_MORNING", "MORNING", "AFTERNOON", "EVENING"
  maxPrice: number;
  refundableOnly: boolean;
  sortBy: "CHEAPEST" | "FASTEST" | "EARLIEST" | "BEST";
}

interface FlightFiltersRailProps {
  filters: FlightFilterState;
  onChange: (filters: FlightFilterState) => void;
  availableAirlines: { code: string; name: string }[];
  priceRange: { min: number; max: number };
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
}

export function FlightFiltersRail({
  filters,
  onChange,
  availableAirlines,
  priceRange,
  isMobileOpen = false,
  onMobileClose,
  className = "",
}: FlightFiltersRailProps) {
  const timeSlots = [
    { id: "EARLY_MORNING", label: "Early Morning", desc: "Before 06:00" },
    { id: "MORNING", label: "Morning", desc: "06:00 - 12:00" },
    { id: "AFTERNOON", label: "Afternoon", desc: "12:00 - 18:00" },
    { id: "EVENING", label: "Evening", desc: "After 18:00" },
  ];

  function toggleStop(stop: number) {
    const next = filters.stops.includes(stop)
      ? filters.stops.filter((s) => s !== stop)
      : [...filters.stops, stop];
    onChange({ ...filters, stops: next });
  }

  function toggleAirline(code: string) {
    const next = filters.airlines.includes(code)
      ? filters.airlines.filter((c) => c !== code)
      : [...filters.airlines, code];
    onChange({ ...filters, airlines: next });
  }

  function toggleTimeBand(slot: string) {
    const next = filters.timeBands.includes(slot)
      ? filters.timeBands.filter((t) => t !== slot)
      : [...filters.timeBands, slot];
    onChange({ ...filters, timeBands: next });
  }

  function resetFilters() {
    onChange({
      stops: [],
      airlines: [],
      timeBands: [],
      maxPrice: priceRange.max,
      refundableOnly: false,
      sortBy: "CHEAPEST",
    });
  }

  const content = (
    <div className="flex flex-col gap-5 text-xs text-[var(--ink)]">
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-1.5 font-bold text-sm">
          <Filter size={15} className="text-[var(--brand)]" />
          <span>Filters & Sort</span>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1 text-[var(--brand)] hover:underline font-medium text-[11px] cursor-pointer"
        >
          <RotateCcw size={11} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="mb-2 block font-mono font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Sort Results By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({
              ...filters,
              sortBy: e.target.value as FlightFilterState["sortBy"],
            })
          }
          className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-mono font-medium text-[var(--ink)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none shadow-xs"
        >
          <option value="CHEAPEST">Cheapest First</option>
          <option value="FASTEST">Fastest (Duration)</option>
          <option value="EARLIEST">Earliest Departure</option>
          <option value="BEST">Best Value (Smart Score)</option>
        </select>
      </div>

      {/* Stops */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="mb-2 block font-mono font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Stops
        </label>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={filters.stops.includes(0)}
              onChange={() => toggleStop(0)}
              className="rounded border-[var(--line)] text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            <span>Non-stop only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={filters.stops.includes(1)}
              onChange={() => toggleStop(1)}
              className="rounded border-[var(--line)] text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            <span>1 Stop</span>
          </label>
        </div>
      </div>

      {/* Departure Time Slots */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="mb-2 block font-mono font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Departure Time
        </label>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => {
            const isChecked = filters.timeBands.includes(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleTimeBand(slot.id)}
                className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all cursor-pointer ${
                  isChecked
                    ? "border-[var(--brand)] bg-orange-50/50 text-[var(--brand)] font-bold shadow-xs"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)]"
                }`}
              >
                <span className="font-semibold text-[11px]">{slot.label}</span>
                <span className="text-[9px] font-mono opacity-80 mt-0.5">{slot.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Airlines */}
      {availableAirlines.length > 0 && (
        <div className="border-t border-[var(--line)] pt-3">
          <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
            Airlines
          </label>
          <div className="flex max-h-40 flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
            {availableAirlines.map((al) => (
              <label key={al.code} className="flex cursor-pointer items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.airlines.includes(al.code)}
                    onChange={() => toggleAirline(al.code)}
                    className="rounded border-[var(--line)] text-[var(--accent)]"
                  />
                  <span>{al.name}</span>
                </div>
                <span className="font-mono text-[10px] text-[var(--ink-muted)]">{al.code}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Max Price Slider */}
      <div className="border-t border-[var(--line)] pt-3">
        <div className="mb-2 flex items-center justify-between">
          <label className="font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
            Max Price
          </label>
          <span className="font-mono font-bold text-[var(--ink)]">
            {formatINR(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          step={200}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[var(--brand)]"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--ink-muted)]">
          <span>{formatINR(priceRange.min)}</span>
          <span>{formatINR(priceRange.max)}</span>
        </div>
      </div>

      {/* Refundable Only */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.refundableOnly}
            onChange={(e) => onChange({ ...filters, refundableOnly: e.target.checked })}
            className="rounded border-[var(--line)] text-[var(--accent)]"
          />
          <span className="font-medium">Refundable Fares Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sticky rail */}
      <aside className={`sticky top-20 hidden md:block w-64 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm shrink-0 self-start ${className}`}>
        {content}
      </aside>

      {/* Mobile drawer bottom-sheet */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 md:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl bg-[var(--surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
              <span className="font-bold text-sm">Filter Flights</span>
              <button
                type="button"
                onClick={onMobileClose}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                <X size={18} />
              </button>
            </div>
            {content}
            <button
              type="button"
              onClick={onMobileClose}
              className="mt-6 w-full rounded-md bg-[var(--brand)] py-2.5 text-xs font-semibold text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}

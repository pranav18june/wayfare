"use client";

import { useState } from "react";
import { BusSeat, BusResult } from "@/server/providers/types";
import { formatINR } from "@/lib/utils/formatters";
import { Check, ArrowRight, User, ShieldCheck } from "lucide-react";

interface SeatLayoutPickerProps {
  bus: BusResult;
  seats: BusSeat[];
  onProceed: (selectedSeatIds: string[], boardingPoint: string, droppingPoint: string) => void;
  className?: string;
}

export function SeatLayoutPicker({
  bus,
  seats,
  onProceed,
  className = "",
}: SeatLayoutPickerProps) {
  const [activeDeck, setActiveDeck] = useState<"LOWER" | "UPPER">("LOWER");
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedBoarding, setSelectedBoarding] = useState<string>(
    bus.boardingPoints[0]?.name || ""
  );
  const [selectedDropping, setSelectedDropping] = useState<string>(
    bus.droppingPoints[0]?.name || ""
  );

  const lowerSeats = seats.filter((s) => s.deck === "LOWER");
  const upperSeats = seats.filter((s) => s.deck === "UPPER");

  function toggleSeat(seat: BusSeat) {
    if (seat.isBooked) return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 6) {
        alert("Maximum 6 seats per booking");
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  }

  // Calculate live total
  const selectedSeatObjects = seats.filter((s) => selectedSeatIds.includes(s.id));
  const liveTotal = selectedSeatObjects.reduce((acc, s) => acc + s.price, 0);

  return (
    <div className={`rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--ink)]">Select Seats</h3>
          <p className="text-xs text-[var(--ink-muted)]">
            Click seats to pick. Max 6 seats per transaction.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--ink-muted)]">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded border border-[var(--line)] bg-[var(--surface)]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-[var(--brand)] text-white flex items-center justify-center text-[10px]">
              ✓
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-[#ECE8DF] border border-[var(--line)]" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded border border-[#FED7AA] bg-[#FFF4ED]" />
            <span>Ladies</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Seat Map Deck Selector & Grid */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Deck Switcher */}
          <div className="mb-4 flex rounded border border-[var(--line)] bg-[var(--canvas)] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveDeck("LOWER")}
              className={`rounded px-4 py-1 font-semibold transition-colors ${
                activeDeck === "LOWER"
                  ? "bg-white text-[var(--ink)] shadow-2xs"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Lower Deck ({lowerSeats.length} Berths)
            </button>
            <button
              type="button"
              onClick={() => setActiveDeck("UPPER")}
              className={`rounded px-4 py-1 font-semibold transition-colors ${
                activeDeck === "UPPER"
                  ? "bg-white text-[var(--ink)] shadow-2xs"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Upper Deck ({upperSeats.length} Berths)
            </button>
          </div>

          {/* Bus Interior Box */}
          <div className="relative w-full max-w-sm rounded-lg border-2 border-[var(--line)] bg-[var(--canvas)] p-4">
            <div className="mb-3 flex justify-between text-[10px] font-mono font-bold text-[var(--ink-muted)] uppercase tracking-widest border-b border-[var(--line)] pb-1">
              <span>Front / Driver</span>
              <span>{activeDeck} DECK</span>
            </div>

            {/* Grid of seats */}
            <div className="grid grid-cols-2 gap-3 py-2">
              {(activeDeck === "LOWER" ? lowerSeats : upperSeats).map((s) => {
                const isSelected = selectedSeatIds.includes(s.id);
                const accessibleLabel = `Seat ${s.id}, ${s.deck.toLowerCase()} deck, ${
                  s.ladiesOnly ? "ladies only, " : ""
                }₹${s.price}, ${s.isBooked ? "already booked" : isSelected ? "selected" : "available"}`;

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={s.isBooked}
                    aria-label={accessibleLabel}
                    onClick={() => toggleSeat(s)}
                    className={`flex h-12 items-center justify-between rounded-md border p-2 text-xs font-mono font-bold transition-all ${
                      s.isBooked
                        ? "cursor-not-allowed border-[#DAD4C8] bg-[#ECE8DF] text-[var(--ink-muted)] opacity-60"
                        : isSelected
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm ring-2 ring-[var(--brand)]"
                        : s.ladiesOnly
                        ? "border-[#FED7AA] bg-[#FFF4ED] text-[var(--brand)] hover:border-[var(--brand)]"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <span>{s.id}</span>
                    <span className="text-[10px] font-normal">
                      {s.isBooked ? "Booked" : formatINR(s.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Boarding / Dropping & Checkout Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--line)] pt-4 lg:pt-0 lg:pl-6 text-xs">
          <div className="flex flex-col gap-4">
            {/* Boarding Point */}
            <div>
              <label className="block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px] mb-1">
                Boarding Point
              </label>
              <select
                value={selectedBoarding}
                onChange={(e) => setSelectedBoarding(e.target.value)}
                className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              >
                {bus.boardingPoints.map((bp) => (
                  <option key={bp.name} value={bp.name}>
                    {bp.time} — {bp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropping Point */}
            <div>
              <label className="block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px] mb-1">
                Dropping Point
              </label>
              <select
                value={selectedDropping}
                onChange={(e) => setSelectedDropping(e.target.value)}
                className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              >
                {bus.droppingPoints.map((dp) => (
                  <option key={dp.name} value={dp.name}>
                    {dp.time} — {dp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Seats summary */}
            <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[var(--ink-muted)]">Selected Seats:</span>
                <span className="font-mono font-bold text-[var(--ink)]">
                  {selectedSeatIds.length > 0 ? selectedSeatIds.join(", ") : "None"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--ink-muted)]">Seat Count:</span>
                <span className="font-mono font-bold text-[var(--ink)]">
                  {selectedSeatIds.length}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Total & Continue Button */}
          <div className="mt-6 border-t border-[var(--line)] pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--ink-muted)]">Total Amount</span>
              <span className="font-mono text-lg font-bold text-[var(--brand)]">
                {formatINR(liveTotal)}
              </span>
            </div>

            <button
              type="button"
              disabled={selectedSeatIds.length === 0}
              onClick={() => onProceed(selectedSeatIds, selectedBoarding, selectedDropping)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--brand)] text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-ink)] disabled:opacity-40 shadow-sm"
            >
              <span>Continue to Traveller Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

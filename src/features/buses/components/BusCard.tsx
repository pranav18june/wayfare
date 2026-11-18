"use client";

import { useState } from "react";
import { BusResult, BusSeat } from "@/server/providers/types";
import { SeatLayoutPicker } from "./SeatLayoutPicker";
import { formatINR, formatDuration } from "@/lib/utils/formatters";
import { Bus, Star, ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react";

interface BusCardProps {
  bus: BusResult;
  date: string;
  onProceedCheckout: (
    bus: BusResult,
    seatIds: string[],
    boarding: string,
    dropping: string
  ) => void;
}

export function BusCard({ bus, date, onProceedCheckout }: BusCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [seats, setSeats] = useState<BusSeat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  async function handleToggleSeats() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    if (seats.length === 0) {
      setLoadingSeats(true);
      try {
        const res = await fetch(`/api/buses/${bus.id}/seats?date=${date}`);
        if (res.ok) {
          const data = await res.json();
          setSeats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSeats(false);
      }
    }
  }

  // Calculate duration from depart and arrive time
  const [dh, dm] = bus.departTime.split(":").map(Number);
  const [ah, am] = bus.arriveTime.split(":").map(Number);
  let durMins = (ah * 60 + am) - (dh * 60 + dm);
  if (durMins < 0) durMins += 1440;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card hover:shadow-card-hover transition-all">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
        {/* Operator Monogram & Details */}
        <div className="flex items-center gap-3 sm:col-span-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--canvas)] border border-[var(--line)] font-mono text-xs font-bold text-[var(--ink)] shrink-0 shadow-2xs">
            {bus.operatorCode}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--ink)]">{bus.operatorName}</h3>
              <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                <Star size={10} fill="currentColor" />
                <span>{bus.rating}</span>
              </span>
            </div>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5 font-mono">{bus.busType}</p>
          </div>
        </div>

        {/* Departure -> Duration -> Arrival */}
        <div className="flex items-center justify-between sm:col-span-5 px-1 sm:px-4">
          <div className="text-left">
            <div className="font-mono text-lg font-bold text-[var(--ink)]">
              {bus.departTime}
            </div>
            <div className="text-xs font-mono font-medium text-[var(--ink-muted)] truncate max-w-[110px]">
              {bus.fromCity}
            </div>
          </div>

          <div className="flex flex-col items-center px-2 w-28 sm:w-32">
            <span className="font-mono text-[10px] text-[var(--ink-muted)] font-medium">
              {formatDuration(durMins)}
            </span>
            <div className="relative my-1.5 flex items-center justify-center w-full">
              <div className="h-[1.5px] w-full bg-[var(--line)]" />
              <div className="absolute h-2 w-2 rounded-full border-2 border-white bg-[var(--brand)]" />
            </div>
            <span className="text-[10px] font-mono text-[var(--ink-muted)]">Intercity</span>
          </div>

          <div className="text-right">
            <div className="font-mono text-lg font-bold text-[var(--ink)]">
              {bus.arriveTime}
            </div>
            <div className="text-xs font-mono font-medium text-[var(--ink-muted)] truncate max-w-[110px]">
              {bus.toCity}
            </div>
          </div>
        </div>

        {/* Price & Select Seats CTA */}
        <div className="flex items-center justify-between sm:col-span-3 sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 border-[var(--line)] pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <div className="font-mono text-xl font-bold text-[var(--ink)]">
              {formatINR(bus.baseFare)}
            </div>
            <div className="text-[10px] text-[var(--ink-muted)] mt-0.5 font-mono">
              <span className="text-emerald-700 font-bold">{bus.seatsLeft} seats</span> available
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleSeats}
            className={`mt-2 flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-xs ${
              expanded
                ? "bg-[var(--ink)] text-white hover:bg-black"
                : "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]"
            }`}
          >
            <span>{expanded ? "Hide Deck Map" : "Select Seats"}</span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded Interactive Seat Map */}
      {expanded && (
        <div className="mt-5 border-t border-[var(--line)] pt-5">
          {loadingSeats ? (
            <div className="py-8 text-center text-xs text-[var(--ink-muted)] font-mono animate-pulse">
              Generating interactive bus seating diagram...
            </div>
          ) : (
            <SeatLayoutPicker
              bus={bus}
              seats={seats}
              onProceed={(seatIds, boarding, dropping) =>
                onProceedCheckout(bus, seatIds, boarding, dropping)
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

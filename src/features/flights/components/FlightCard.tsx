"use client";

import { FlightResult } from "@/server/providers/types";
import { formatINR, formatDuration } from "@/lib/utils/formatters";
import { Luggage, Check, ArrowRight, ShieldCheck, Plane } from "lucide-react";
import { allInPrice } from "@/lib/domain/pricing";
import { GroupBookingButton } from "@/components/features/GroupBookingButton";

interface FlightCardProps {
  flight: FlightResult;
  onSelect: (flight: FlightResult) => void;
  isSelected?: boolean;
  selectButtonLabel?: string;
  allIn?: boolean;
}

export function FlightCard({
  flight,
  onSelect,
  isSelected = false,
  selectButtonLabel = "Book",
  allIn = false,
}: FlightCardProps) {
  const displayFare = allIn
    ? allInPrice(flight.calculatedFare, "FLIGHT")
    : flight.calculatedFare;
  return (
    <div
      className={`rounded-xl border bg-[var(--surface)] p-5 transition-all shadow-card hover:shadow-card-hover ${
        isSelected
          ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/20 bg-orange-50/20"
          : "border-[var(--line)] hover:border-[var(--brand)]/50"
      }`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
        {/* Carrier Monogram & Flight Info */}
        <div className="flex items-center gap-3 sm:col-span-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--canvas)] border border-[var(--line)] font-mono text-xs font-bold text-[var(--ink)] shrink-0 shadow-2xs">
            {flight.airlineCode}
          </div>
          <div className="overflow-hidden">
            <div className="truncate text-xs font-bold text-[var(--ink)]">
              {flight.airlineName}
            </div>
            <div className="font-mono text-[11px] text-[var(--ink-muted)] flex items-center gap-1.5 mt-0.5">
              <span>{flight.flightNumber}</span>
              {flight.aircraft && (
                <>
                  <span>·</span>
                  <span>{flight.aircraft}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Departure -> Duration/Stops -> Arrival */}
        <div className="flex items-center justify-between sm:col-span-5 px-1 sm:px-4">
          {/* Depart */}
          <div className="text-left">
            <div className="font-mono text-lg font-bold text-[var(--ink)]">
              {flight.departTime}
            </div>
            <div className="font-mono text-xs font-bold text-[var(--ink-muted)]">
              {flight.fromCode}
            </div>
          </div>

          {/* Duration & Stops graphic */}
          <div className="flex flex-col items-center px-4 w-28 sm:w-32">
            <span className="font-mono text-[10px] text-[var(--ink-muted)] font-medium">
              {formatDuration(flight.durationMin)}
            </span>
            <div className="relative my-1.5 flex items-center justify-center w-full">
              <div className="h-[1.5px] w-full bg-[var(--line)]" />
              <div
                className={`absolute h-2 w-2 rounded-full border-2 border-white ${
                  flight.stops === 0 ? "bg-emerald-600" : "bg-amber-600"
                }`}
              />
            </div>
            <span className={`text-[10px] font-mono font-medium ${flight.stops === 0 ? "text-emerald-700" : "text-amber-700"}`}>
              {flight.stops === 0 ? "Non-stop" : `${flight.stops} Stop`}
            </span>
          </div>

          {/* Arrive */}
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-[var(--ink)]">
              {flight.arriveTime}
            </div>
            <div className="font-mono text-xs font-bold text-[var(--ink-muted)]">
              {flight.toCode}
            </div>
          </div>
        </div>

        {/* Baggage & Refundability tags */}
        <div className="flex flex-wrap sm:flex-col items-start gap-1.5 sm:col-span-2 text-[11px]">
          <div className="flex items-center gap-1 text-[var(--ink-muted)] font-mono text-[10px]">
            <Luggage size={12} />
            <span className="truncate">{flight.baggage.split(",")[0]}</span>
          </div>
          {flight.refundable ? (
            <span className="text-emerald-800 font-medium text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Refundable
            </span>
          ) : (
            <span className="text-[10px] text-[var(--ink-muted)] bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--line)]">
              Non-refundable
            </span>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between sm:col-span-2 sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 border-[var(--line)] pt-3 sm:pt-0 gap-2">
          <div className="text-left sm:text-right">
            <div className="font-mono text-xl font-bold text-[var(--ink)]">
              {formatINR(displayFare)}
            </div>
            <div className="text-[10px] text-[var(--ink-muted)] mt-0.5">
              {allIn ? (
                <span className="text-emerald-700 font-semibold font-mono">All-in taxes & fees</span>
              ) : flight.seatsLeft <= 5 ? (
                <span className="text-rose-600 font-bold font-mono">Only {flight.seatsLeft} seats left</span>
              ) : (
                <span>base fare excl. taxes</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:flex-col sm:w-full sm:items-end">
            <button
              type="button"
              onClick={() => onSelect(flight)}
              className={`w-full flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-xs ${
                isSelected
                  ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]"
                  : "bg-[var(--ink)] text-white hover:bg-black"
              }`}
            >
              {isSelected ? (
                <>
                  <Check size={14} />
                  <span>Selected</span>
                </>
              ) : (
                <>
                  <span>{selectButtonLabel}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>

            <GroupBookingButton
              mode="FLIGHT"
              selectedItem={flight}
              pricePerHead={displayFare}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

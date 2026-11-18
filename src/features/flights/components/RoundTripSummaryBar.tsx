"use client";

import { FlightResult } from "@/server/providers/types";
import { formatINR } from "@/lib/utils/formatters";
import { ArrowRight, PlaneTakeoff, PlaneLanding } from "lucide-react";

interface RoundTripSummaryBarProps {
  outboundFlight: FlightResult | null;
  returnFlight: FlightResult | null;
  passengersCount: number;
  onProceed: () => void;
}

export function RoundTripSummaryBar({
  outboundFlight,
  returnFlight,
  passengersCount,
  onProceed,
}: RoundTripSummaryBarProps) {
  if (!outboundFlight && !returnFlight) return null;

  const outTotal = (outboundFlight?.calculatedFare || 0) * passengersCount;
  const retTotal = (returnFlight?.calculatedFare || 0) * passengersCount;
  const combinedTotal = outTotal + retTotal;
  const canProceed = Boolean(outboundFlight && returnFlight);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] bg-[var(--surface)] p-3 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4">
        {/* Outbound & Return snippets */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {outboundFlight ? (
            <div className="flex items-center gap-2 border-r border-[var(--line)] pr-4">
              <PlaneTakeoff size={14} className="text-[var(--brand)]" />
              <div>
                <span className="font-semibold text-[var(--ink)]">
                  {outboundFlight.fromCode} → {outboundFlight.toCode}
                </span>
                <span className="ml-1 text-[11px] text-[var(--ink-muted)]">
                  ({outboundFlight.departTime})
                </span>
                <span className="ml-2 font-mono font-bold text-[var(--ink)]">
                  {formatINR(outboundFlight.calculatedFare)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[var(--warn)] font-medium">
              <span className="h-2 w-2 rounded-full bg-[var(--warn)]" />
              <span>Select departure flight</span>
            </div>
          )}

          {returnFlight ? (
            <div className="flex items-center gap-2">
              <PlaneLanding size={14} className="text-[var(--accent)]" />
              <div>
                <span className="font-semibold text-[var(--ink)]">
                  {returnFlight.fromCode} → {returnFlight.toCode}
                </span>
                <span className="ml-1 text-[11px] text-[var(--ink-muted)]">
                  ({returnFlight.departTime})
                </span>
                <span className="ml-2 font-mono font-bold text-[var(--ink)]">
                  {formatINR(returnFlight.calculatedFare)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[var(--warn)] font-medium">
              <span className="h-2 w-2 rounded-full bg-[var(--warn)]" />
              <span>Select return flight</span>
            </div>
          )}
        </div>

        {/* Total & Proceed CTA */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-[10px] text-[var(--ink-muted)]">Combined Total</div>
            <div className="font-mono text-lg font-bold text-[var(--brand)]">
              {formatINR(combinedTotal)}
            </div>
          </div>

          <button
            type="button"
            disabled={!canProceed}
            onClick={onProceed}
            className="flex items-center gap-2 rounded-md bg-[var(--brand)] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-ink)] disabled:opacity-40"
          >
            <span>Continue</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

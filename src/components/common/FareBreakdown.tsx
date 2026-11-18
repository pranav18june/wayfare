import { FareBreakdown as FareBreakdownType } from "@/lib/domain/types";
import { formatINR } from "@/lib/utils/formatters";
import { Tag } from "lucide-react";

interface FareBreakdownProps {
  breakdown: FareBreakdownType;
  passengerCount?: number;
  className?: string;
}

export function FareBreakdown({ breakdown, passengerCount = 1, className = "" }: FareBreakdownProps) {
  return (
    <div className={`rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 ${className}`}>
      <div className="border-b border-[var(--line)] pb-2.5">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Fare Summary</h3>
        <p className="text-xs text-[var(--ink-muted)]">
          {passengerCount} {passengerCount === 1 ? "Traveller" : "Travellers"}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between text-[var(--ink)]">
          <span>Base Fare</span>
          <span className="font-mono">{formatINR(breakdown.baseFare)}</span>
        </div>

        <div className="flex items-center justify-between text-[var(--ink-muted)]">
          <span>Taxes & Carrier Surcharges</span>
          <span className="font-mono">{formatINR(breakdown.taxes)}</span>
        </div>

        <div className="flex items-center justify-between text-[var(--ink-muted)]">
          <span>Convenience Fee</span>
          <span className="font-mono">{formatINR(breakdown.convenienceFee)}</span>
        </div>

        {breakdown.discount > 0 && (
          <div className="flex items-center justify-between text-[var(--ok)] font-medium">
            <span className="flex items-center gap-1">
              <Tag size={12} />
              <span>Promo Discount ({breakdown.promoCode})</span>
            </span>
            <span className="font-mono">-{formatINR(breakdown.discount)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-[var(--line)] pt-3 flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--ink)]">Total Due</span>
        <span className="font-mono text-base font-bold text-[var(--brand)]">
          {formatINR(breakdown.total)}
        </span>
      </div>
    </div>
  );
}

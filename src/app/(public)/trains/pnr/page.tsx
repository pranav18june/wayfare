"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PNRStatusResult } from "@/server/providers/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FileSearch, CheckCircle2, AlertCircle, Train, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

function PNRContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPnr = searchParams.get("pnr") || "";

  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [result, setResult] = useState<PNRStatusResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPnr && initialPnr.length === 10) {
      handleLookup(initialPnr);
    }
  }, [initialPnr]);

  async function handleLookup(pnrToSearch: string) {
    const clean = pnrToSearch.replace(/\D/g, "");
    if (clean.length !== 10) {
      setError("Please enter a valid 10-digit PNR number.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/trains/pnr?pnr=${clean}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "PNR could not be found.");
        setResult(null);
      }
    } catch {
      setError("Network error while verifying PNR status.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLookup(pnrInput);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--ink)]">Check IRCTC PNR Status</h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Live confirmation status, coach allocation, berth preference, and charting updates.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm mb-6">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              maxLength={10}
              value={pnrInput}
              onChange={(e) => {
                setPnrInput(e.target.value.replace(/\D/g, ""));
                if (error) setError("");
              }}
              placeholder="Enter 10-digit PNR (e.g. 2489102934)"
              className={`h-11 w-full rounded-md border bg-[var(--surface)] px-3 text-sm font-mono text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:outline-none ${
                error ? "border-[var(--danger)]" : "border-[var(--line)]"
              }`}
            />
            {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-6 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            <FileSearch size={15} />
            <span>{loading ? "Checking..." : "Check Status"}</span>
          </button>
        </form>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
          <span>Demo PNR:</span>
          <button
            type="button"
            onClick={() => {
              setPnrInput("2489102934");
              handleLookup("2489102934");
            }}
            className="font-mono text-[var(--accent)] hover:underline"
          >
            2489102934 (Seeded Confirmed)
          </button>
        </div>
      </div>

      {/* PNR Details Result View */}
      {result && (
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[var(--ink-muted)]">PNR:</span>
                <span className="font-mono text-base font-bold text-[var(--brand)]">
                  {result.pnr}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                <Train size={16} className="text-[var(--accent)]" />
                <span>
                  {result.trainNumber} • {result.trainName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-[#E6F4EA] px-2.5 py-1 text-xs font-mono font-bold text-[var(--ok)] border border-[#CEEAD6]">
                <CheckCircle2 size={13} />
                <span>{result.chartPrepared ? "Chart Prepared" : "Chart Not Prepared"}</span>
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 rounded border border-[var(--line)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Journey Meta Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-md bg-[var(--canvas)] p-3 mb-6 text-xs border border-[var(--line)]">
            <div>
              <span className="text-[11px] text-[var(--ink-muted)]">Journey Date</span>
              <div className="font-mono font-bold text-[var(--ink)]">
                {formatDate(result.date, "EEE, d MMM yyyy")}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[var(--ink-muted)]">Route</span>
              <div className="font-mono font-bold text-[var(--ink)]">
                {result.fromStation} → {result.toStation}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[var(--ink-muted)]">Boarding Station</span>
              <div className="font-mono font-bold text-[var(--ink)]">
                {result.boardingStation}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[var(--ink-muted)]">Class</span>
              <div className="font-mono font-bold text-[var(--ink)]">
                {result.reservationClass}
              </div>
            </div>
          </div>

          {/* Passengers Table */}
          <div>
            <h2 className="text-xs font-bold text-[var(--ink)] mb-2 uppercase tracking-wider">
              Passenger Status
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--ink-muted)]">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Passenger</th>
                    <th className="pb-2 font-medium">Booking Status</th>
                    <th className="pb-2 font-medium">Current Status</th>
                    <th className="pb-2 font-medium">Coach</th>
                    <th className="pb-2 font-medium">Berth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] font-mono">
                  {result.passengers.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[var(--canvas)]">
                      <td className="py-2.5 text-[var(--ink-muted)]">{idx + 1}</td>
                      <td className="py-2.5 font-sans font-medium text-[var(--ink)]">{p.name}</td>
                      <td className="py-2.5 text-[var(--ink-muted)]">{p.bookingStatus}</td>
                      <td className="py-2.5">
                        <StatusBadge status={p.currentStatus} />
                      </td>
                      <td className="py-2.5 font-bold text-[var(--ink)]">{p.coach || "—"}</td>
                      <td className="py-2.5 font-bold text-[var(--ink)]">
                        {p.berth ? `${p.berth} (${p.berthType || "Berth"})` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PNRPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading PNR lookup...</div>}>
      <PNRContent />
    </Suspense>
  );
}

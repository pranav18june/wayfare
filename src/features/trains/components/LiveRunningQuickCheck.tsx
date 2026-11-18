"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

export function LiveRunningQuickCheck() {
  const router = useRouter();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [trainNumber, setTrainNumber] = useState("");
  const [date, setDate] = useState(todayStr);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = trainNumber.trim();
    if (!clean) {
      setError("Enter a train number or name");
      return;
    }
    setError("");
    router.push(`/trains/running-status?train=${encodeURIComponent(clean)}&date=${date}`);
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Activity size={16} />
          </div>
          <h3 className="text-sm font-bold text-[var(--ink)]">Live Running Status</h3>
        </div>
        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          GPS TRACKED
        </span>
      </div>

      <p className="text-xs text-[var(--ink-muted)] mb-4">
        Simulate station-by-station timeline with halts, distances, and delays.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={trainNumber}
            onChange={(e) => {
              setTrainNumber(e.target.value);
              if (error) setError("");
            }}
            placeholder="Train Number (e.g. 12952)"
            className={`h-11 w-full rounded-lg border bg-[var(--canvas)]/40 px-3.5 text-sm font-mono tracking-wider font-semibold text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none transition-all ${
              error ? "border-rose-400 bg-rose-50/20" : "border-[var(--line)] hover:border-[var(--ink-muted)]"
            }`}
          />
          {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          className="h-11 rounded-lg bg-[var(--brand)] px-5 text-xs font-semibold text-white hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all shrink-0 inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Track Train</span>
          <ArrowRight size={14} />
        </button>
      </form>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
        <Sparkles size={12} className="text-[var(--brand)]" />
        <span>Try Demo Train:</span>
        <button
          type="button"
          onClick={() => {
            setTrainNumber("12952");
            setError("");
          }}
          className="font-mono font-bold text-[var(--brand)] underline hover:text-[var(--brand-ink)] cursor-pointer"
        >
          12952 (Mumbai Rajdhani)
        </button>
      </div>
    </div>
  );
}

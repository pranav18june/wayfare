"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, ArrowRight, Sparkles } from "lucide-react";

export function PNRQuickCheck() {
  const router = useRouter();
  const [pnr, setPnr] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = pnr.replace(/\D/g, "");
    if (clean.length !== 10) {
      setError("Please enter a valid 10-digit PNR number");
      return;
    }
    setError("");
    router.push(`/trains/pnr?pnr=${clean}`);
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-light)] text-[var(--brand)] flex items-center justify-center">
            <FileSearch size={16} />
          </div>
          <h3 className="text-sm font-bold text-[var(--ink)]">PNR Status Checker</h3>
        </div>
        <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          LIVE NTES
        </span>
      </div>

      <p className="text-xs text-[var(--ink-muted)] mb-4">
        Get instant chart status, coach allocation, and seat/berth details.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            maxLength={10}
            value={pnr}
            onChange={(e) => {
              setPnr(e.target.value.replace(/\D/g, ""));
              if (error) setError("");
            }}
            placeholder="10-digit PNR (e.g. 9823410291)"
            className={`h-11 w-full rounded-lg border bg-[var(--canvas)]/40 px-3.5 text-sm font-mono tracking-wider font-semibold text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none transition-all ${
              error ? "border-rose-400 bg-rose-50/20" : "border-[var(--line)] hover:border-[var(--ink-muted)]"
            }`}
          />
          {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          className="h-11 rounded-lg bg-[var(--ink)] px-5 text-xs font-semibold text-white hover:bg-black active:scale-[0.98] transition-all shrink-0 inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Verify PNR</span>
          <ArrowRight size={14} />
        </button>
      </form>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
        <Sparkles size={12} className="text-[var(--brand)]" />
        <span>Try Demo PNR:</span>
        <button
          type="button"
          onClick={() => {
            setPnr("9823410291");
            setError("");
          }}
          className="font-mono font-bold text-[var(--brand)] underline hover:text-[var(--brand-ink)] cursor-pointer"
        >
          9823410291
        </button>
      </div>
    </div>
  );
}

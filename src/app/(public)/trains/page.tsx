import { TrainSearchForm } from "@/features/trains/components/TrainSearchForm";
import { PNRQuickCheck } from "@/features/trains/components/PNRQuickCheck";
import { LiveRunningQuickCheck } from "@/features/trains/components/LiveRunningQuickCheck";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";

export default function TrainsPage() {
  const topCorridors = [
    { from: "NDLS", to: "BCT", fromName: "New Delhi", toName: "Mumbai Central", fare: 1650, trains: "12 trains" },
    { from: "NDLS", to: "HWH", fromName: "New Delhi", toName: "Howrah (Kolkata)", fare: 1580, trains: "10 trains" },
    { from: "MAS", to: "SBC", fromName: "Chennai Central", toName: "Bengaluru City", fare: 450, trains: "8 trains" },
    { from: "CSMT", to: "PUNE", fromName: "Mumbai CSMT", toName: "Pune Junction", fare: 180, trains: "14 trains" },
    { from: "NDLS", to: "LKO", fromName: "New Delhi", toName: "Lucknow Charbagh", fare: 520, trains: "9 trains" },
    { from: "CSMT", to: "MAO", fromName: "Mumbai CSMT", toName: "Madgaon (Goa)", fare: 890, trains: "6 trains" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--ink)]">IRCTC Train Booking & Utilities</h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Search trains, inspect class-wise live availability with 7-day projection, check PNR status, and track running status.
        </p>
      </div>

      <div className="mb-8">
        <TrainSearchForm />
      </div>

      {/* Train Utilities Grid */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <PNRQuickCheck />
        <LiveRunningQuickCheck />
      </section>

      {/* Popular Corridors */}
      <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Major Indian Railway Corridors</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Daily Rajdhani, Shatabdi, and Superfast express trains.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--ok)] font-medium">● RAC / AVL Live</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topCorridors.map((c) => (
            <Link
              key={`${c.from}-${c.to}`}
              href={`/trains/results?from=${c.from}&to=${c.to}&date=2026-11-24`}
              className="group flex items-center justify-between rounded border border-[var(--line)] bg-[var(--canvas)] p-3 hover:border-[var(--accent)] transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                  <span>{c.fromName}</span>
                  <ArrowRight size={13} className="text-[var(--ink-muted)]" />
                  <span>{c.toName}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--ink-muted)]">
                  {c.from} → {c.to} • {c.trains}
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm font-bold text-[var(--ink)]">
                  {formatINR(c.fare)}
                </div>
                <div className="text-[10px] text-[var(--ink-muted)]">starting from</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

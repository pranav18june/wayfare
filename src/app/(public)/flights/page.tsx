import { FlightSearchForm } from "@/features/flights/components/FlightSearchForm";
import Link from "next/link";
import { formatINR } from "@/lib/utils/formatters";
import { ArrowRight, Plane } from "lucide-react";

export default function FlightsPage() {
  const topCorridors = [
    { from: "DEL", to: "BOM", fromName: "New Delhi", toName: "Mumbai", fare: 3450, time: "2h 15m" },
    { from: "BLR", to: "DEL", fromName: "Bengaluru", toName: "New Delhi", fare: 4200, time: "2h 45m" },
    { from: "BOM", to: "GOI", fromName: "Mumbai", toName: "Goa", fare: 2600, time: "1h 15m" },
    { from: "DEL", to: "CCU", fromName: "New Delhi", toName: "Kolkata", fare: 3800, time: "2h 20m" },
    { from: "HYD", to: "BLR", fromName: "Hyderabad", toName: "Bengaluru", fare: 2850, time: "1h 10m" },
    { from: "MAA", to: "DEL", fromName: "Chennai", toName: "New Delhi", fare: 4100, time: "2h 50m" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--ink)]">Search & Book Domestic Flights</h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Compare 12 scheduled airlines across 40 Indian airports. Real-time availability and dynamic fares.
        </p>
      </div>

      <div className="mb-8">
        <FlightSearchForm />
      </div>

      {/* Top Corridors Grid */}
      <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Popular Domestic Flight Sectors</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              High-frequency sectors with instant e-ticket issuance.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--ok)] font-medium">● Instant Booking</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topCorridors.map((c) => (
            <Link
              key={`${c.from}-${c.to}`}
              href={`/flights/results?from=${c.from}&to=${c.to}&date=2026-11-22`}
              className="group flex items-center justify-between rounded border border-[var(--line)] bg-[var(--canvas)] p-3 hover:border-[var(--brand)] transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                  <span>{c.fromName}</span>
                  <ArrowRight size={13} className="text-[var(--ink-muted)]" />
                  <span>{c.toName}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--ink-muted)]">
                  {c.from} → {c.to} • {c.time}
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm font-bold text-[var(--brand)]">
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

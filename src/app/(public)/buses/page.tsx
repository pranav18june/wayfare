import { BusSearchForm } from "@/features/buses/components/BusSearchForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";

export default function BusesPage() {
  const topBusRoutes = [
    { from: "New Delhi", to: "Jaipur", fare: 650, time: "5h 30m" },
    { from: "New Delhi", to: "Chandigarh", fare: 550, time: "4h 45m" },
    { from: "Mumbai", to: "Pune", fare: 350, time: "3h 30m" },
    { from: "Bengaluru", to: "Chennai", fare: 750, time: "6h 15m" },
    { from: "Bengaluru", to: "Goa", fare: 1100, time: "11h 00m" },
    { from: "Mumbai", to: "Goa", fare: 1250, time: "12h 00m" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--ink)]">Intercity Bus Booking</h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Compare Volvo, AC Sleepers, and BharatBenz coaches with interactive multi-deck seat layouts.
        </p>
      </div>

      <div className="mb-8">
        <BusSearchForm />
      </div>

      <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Popular Bus Routes</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Daily overnight and day services from top verified operators.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--ok)] font-medium">● Live Seat Layouts</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topBusRoutes.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/buses/results?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}&date=2026-11-20`}
              className="group flex items-center justify-between rounded border border-[var(--line)] bg-[var(--canvas)] p-3 hover:border-[var(--brand)] transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                  <span>{r.from}</span>
                  <ArrowRight size={13} className="text-[var(--ink-muted)]" />
                  <span>{r.to}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--ink-muted)]">
                  Approx. {r.time}
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm font-bold text-[var(--ink)]">
                  {formatINR(r.fare)}
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

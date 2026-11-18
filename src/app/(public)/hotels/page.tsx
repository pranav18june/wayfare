import { HotelSearchForm } from "@/features/hotels/components/HotelSearchForm";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function HotelsPage() {
  const topDestinations = [
    { city: "Goa", properties: "28 Verified Hotels", minPrice: 2200 },
    { city: "Mumbai", properties: "34 Verified Hotels", minPrice: 2800 },
    { city: "New Delhi", properties: "40 Verified Hotels", minPrice: 2100 },
    { city: "Bengaluru", properties: "30 Verified Hotels", minPrice: 2400 },
    { city: "Jaipur", properties: "25 Verified Hotels", minPrice: 1800 },
    { city: "Kochi", properties: "20 Verified Hotels", minPrice: 1950 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--ink)]">Hotel & Resort Booking</h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Curated properties with verified guest reviews, transparent policies, and free cancellation options.
        </p>
      </div>

      <div className="mb-8">
        <HotelSearchForm />
      </div>

      <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Top Domestic Travel Destinations</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Curated leisure and business hotels with instant confirmation.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--ok)] font-medium">● Free Cancellation</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topDestinations.map((d) => (
            <Link
              key={d.city}
              href={`/hotels/results?city=${encodeURIComponent(d.city)}&checkIn=2026-11-20&checkOut=2026-11-22`}
              className="group flex items-center justify-between rounded border border-[var(--line)] bg-[var(--canvas)] p-3 hover:border-[var(--brand)] transition-colors"
            >
              <div>
                <h3 className="text-xs font-bold text-[var(--ink)]">{d.city}</h3>
                <p className="text-[11px] text-[var(--ink-muted)]">{d.properties}</p>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm font-bold text-[var(--brand)]">
                  ₹{d.minPrice}
                </div>
                <div className="text-[10px] text-[var(--ink-muted)]">starts from</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

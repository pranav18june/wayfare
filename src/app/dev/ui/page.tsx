"use client";

import { useState } from "react";
import { SearchField } from "@/components/common/SearchField";
import { DatePicker } from "@/components/common/DatePicker";
import { PassengerSelector, PassengerCount } from "@/components/common/PassengerSelector";
import { PriceTag } from "@/components/common/PriceTag";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FareBreakdown } from "@/components/common/FareBreakdown";
import { EmptyState } from "@/components/common/EmptyState";
import { ResultsSkeleton } from "@/components/common/Skeletons";
import { formatINR } from "@/lib/utils/formatters";
import { Plane, AlertCircle } from "lucide-react";

export default function DevUIShowroomPage() {
  const [airport, setAirport] = useState("DEL");
  const [station, setStation] = useState("NDLS");
  const [city, setCity] = useState("Mumbai");
  const [date, setDate] = useState("2026-11-25");
  const [passengers, setPassengers] = useState<PassengerCount>({
    adults: 2,
    children: 1,
    infants: 0,
    cabin: "ECONOMY",
  });

  const sampleBreakdown = {
    baseFare: 8400,
    taxes: 1008,
    convenienceFee: 250,
    discount: 500,
    total: 9158,
    promoCode: "FLYSAFE",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 border-b border-[var(--line)] pb-4">
        <span className="font-mono text-xs font-bold text-[var(--brand)]">
          INTERNAL VERIFICATION / DEV ONLY
        </span>
        <h1 className="mt-1 text-2xl font-bold text-[var(--ink)]">
          Wayfare Design System & Shared Components (/dev/ui)
        </h1>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          Strict transit authority design language: zero gradients, no emoji icons, IBM Plex fonts, tabular numbers.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Section 1: Color Tokens */}
        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--ink)] mb-3">1. Color Palette Tokens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 text-xs">
            <div className="rounded border border-[var(--line)] p-3">
              <div className="h-8 rounded bg-[#E8590C] mb-2" />
              <div className="font-mono font-bold">--brand</div>
              <div className="text-[11px] text-[var(--ink-muted)]">#E8590C (Burnt Orange)</div>
            </div>

            <div className="rounded border border-[var(--line)] p-3">
              <div className="h-8 rounded bg-[#0B5D63] mb-2" />
              <div className="font-mono font-bold">--accent</div>
              <div className="text-[11px] text-[var(--ink-muted)]">#0B5D63 (Deep Teal)</div>
            </div>

            <div className="rounded border border-[var(--line)] p-3">
              <div className="h-8 rounded bg-[#14181F] mb-2" />
              <div className="font-mono font-bold">--ink</div>
              <div className="text-[11px] text-[var(--ink-muted)]">#14181F (Primary text)</div>
            </div>

            <div className="rounded border border-[var(--line)] p-3">
              <div className="h-8 rounded bg-[#F5F3EE] mb-2 border border-[var(--line)]" />
              <div className="font-mono font-bold">--canvas</div>
              <div className="text-[11px] text-[var(--ink-muted)]">#F5F3EE (Page Warm)</div>
            </div>

            <div className="rounded border border-[var(--line)] p-3">
              <div className="h-8 rounded bg-[#1E7B4B] mb-2" />
              <div className="font-mono font-bold">--ok</div>
              <div className="text-[11px] text-[var(--ink-muted)]">#1E7B4B (Status Green)</div>
            </div>

            <div className="rounded border border-[var(--line)] p-3">
              <div className="h-8 rounded bg-[#B42318] mb-2" />
              <div className="font-mono font-bold">--danger</div>
              <div className="text-[11px] text-[var(--ink-muted)]">#B42318 (Waitlist/Cancel)</div>
            </div>
          </div>
        </section>

        {/* Section 2: Autocomplete Inputs */}
        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--ink)] mb-3">2. Autocomplete SearchFields</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SearchField
              label="Airports Autocomplete"
              value={airport}
              onChange={(val) => setAirport(val)}
              apiEndpoint="/api/autocomplete/airports"
              placeholder="Search DEL, BOM, BLR..."
            />

            <SearchField
              label="Stations Autocomplete"
              value={station}
              onChange={(val) => setStation(val)}
              apiEndpoint="/api/autocomplete/stations"
              placeholder="Search NDLS, BCT, CSMT..."
            />

            <SearchField
              label="Cities Autocomplete"
              value={city}
              onChange={(val) => setCity(val)}
              apiEndpoint="/api/autocomplete/cities"
              placeholder="Search Delhi, Mumbai, Jaipur..."
            />
          </div>
        </section>

        {/* Section 3: DatePicker & PassengerSelector */}
        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--ink)] mb-3">3. Date & Passenger Selectors</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DatePicker
              label="Departure Date (with fare hint)"
              value={date}
              onChange={(val) => setDate(val)}
              fareHint="Fares from ₹3,450"
            />

            <PassengerSelector
              value={passengers}
              onChange={(val) => setPassengers(val)}
            />
          </div>
        </section>

        {/* Section 4: Status Badges & Price Tags */}
        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--ink)] mb-3">4. Status Badges & Tabular Numerals</h2>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-semibold text-[var(--ink-muted)] mb-2">
                Indian Railways Availability Badges (Color + Text enforced)
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status="AVL" count={42} />
                <StatusBadge status="RAC" count={6} />
                <StatusBadge status="WL" count={14} />
                <StatusBadge status="REGRET" />
                <StatusBadge status="CONFIRMED" />
                <StatusBadge status="PENDING" />
                <StatusBadge status="CANCELLED" />
              </div>
            </div>

            <div className="border-t border-[var(--line)] pt-3">
              <div className="text-xs font-semibold text-[var(--ink-muted)] mb-2">
                Price Tag Scale (Tabular Numerals & INR Grouping)
              </div>
              <div className="flex flex-wrap items-baseline gap-6">
                <PriceTag amount={450} size="sm" label="Small:" />
                <PriceTag amount={3450} size="md" label="Medium:" />
                <PriceTag amount={14200} size="lg" label="Large:" />
                <PriceTag amount={1245000} size="xl" label="Extra Large:" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Fare Breakdown & Empty State */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)] mb-3">5. Server-Verified Fare Breakdown</h2>
            <FareBreakdown breakdown={sampleBreakdown} passengerCount={2} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[var(--ink)] mb-3">6. Empty State with Clear Action</h2>
            <EmptyState
              title="No direct flights found"
              description="We could not find non-stop flights on this date. Try ±1 day or check connecting flights."
              icon={Plane}
              actionLabel="Search Next Day"
              onAction={() => alert("Action triggered")}
            />
          </div>
        </section>

        {/* Section 6: Skeletons */}
        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--ink)] mb-3">7. Results Skeleton Loader</h2>
          <ResultsSkeleton count={2} />
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BusResult } from "@/server/providers/types";
import { BusCard } from "@/features/buses/components/BusCard";
import { ResultsSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { ArrowLeft, Filter, Bus, X } from "lucide-react";
import Link from "next/link";
import { AllInPriceToggle } from "@/components/features/AllInPriceToggle";

function BusResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "New Delhi";
  const to = searchParams.get("to") || "Jaipur";
  const date = searchParams.get("date") || "2026-11-20";
  const allIn = searchParams.get("allin") === "1";

  const [buses, setBuses] = useState<BusResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"PRICE" | "DEPARTURE" | "RATING">("PRICE");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchBuses() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/buses/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`
        );
        if (res.ok) {
          const data = await res.json();
          setBuses(data);
        }
      } catch (err) {
        console.error("Bus search error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBuses();
  }, [from, to, date]);

  // Unique operators & types
  const availableOperators = useMemo(() => {
    const map = new Map<string, string>();
    buses.forEach((b) => map.set(b.operatorCode, b.operatorName));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [buses]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    buses.forEach((b) => set.add(b.busType));
    return Array.from(set);
  }, [buses]);

  // Filtered & sorted
  const filteredBuses = useMemo(() => {
    let result = [...buses];

    if (selectedOperators.length > 0) {
      result = result.filter((b) => selectedOperators.includes(b.operatorCode));
    }
    if (selectedTypes.length > 0) {
      result = result.filter((b) => selectedTypes.includes(b.busType));
    }
    if (minRating > 0) {
      result = result.filter((b) => b.rating >= minRating);
    }

    result.sort((a, b) => {
      if (sortBy === "PRICE") return a.baseFare - b.baseFare;
      if (sortBy === "DEPARTURE") return a.departTime.localeCompare(b.departTime);
      if (sortBy === "RATING") return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [buses, selectedOperators, selectedTypes, minRating, sortBy]);

  async function handleProceedCheckout(
    bus: BusResult,
    seatIds: string[],
    boarding: string,
    dropping: string
  ) {
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "BUS",
          busId: bus.id,
          operatorName: bus.operatorName,
          fromCity: bus.fromCity,
          toCity: bus.toCity,
          departTime: bus.departTime,
          date,
          seats: seatIds,
          passengerCount: seatIds.length,
          totalFare: bus.baseFare * seatIds.length,
          boardingPoint: boarding,
          droppingPoint: dropping,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/checkout/${data.sessionId}`);
      } else if (res.status === 401) {
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      } else {
        alert("Failed to initiate seat lock. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filterContent = (
    <div className="flex flex-col gap-5 text-xs text-[var(--ink)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
        <span className="font-bold text-sm">Filters & Sort</span>
        <button
          type="button"
          onClick={() => {
            setSelectedOperators([]);
            setSelectedTypes([]);
            setMinRating(0);
            setSortBy("PRICE");
          }}
          className="text-[11px] font-medium text-[var(--brand)] hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="PRICE">Cheapest First</option>
          <option value="DEPARTURE">Departure Time</option>
          <option value="RATING">Highest Customer Rating</option>
        </select>
      </div>

      {/* Bus Types */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Bus Type
        </label>
        <div className="flex flex-col gap-2">
          {availableTypes.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => {
                  setSelectedTypes((prev) =>
                    prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                  );
                }}
                className="rounded border-[var(--line)] text-[var(--accent)]"
              />
              <span className="truncate">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Operators */}
      {availableOperators.length > 0 && (
        <div className="border-t border-[var(--line)] pt-3">
          <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
            Bus Operators
          </label>
          <div className="flex max-h-40 flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
            {availableOperators.map((op) => (
              <label key={op.code} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedOperators.includes(op.code)}
                  onChange={() => {
                    setSelectedOperators((prev) =>
                      prev.includes(op.code)
                        ? prev.filter((c) => c !== op.code)
                        : [...prev, op.code]
                    );
                  }}
                  className="rounded border-[var(--line)] text-[var(--accent)]"
                />
                <span className="truncate">{op.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Customer Rating
        </label>
        <div className="flex gap-2">
          {[0, 4.0, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setMinRating(r)}
              className={`flex-1 rounded border py-1.5 text-center font-mono text-xs font-semibold ${
                minRating === r
                  ? "border-[var(--brand)] bg-[var(--canvas)] text-[var(--brand)]"
                  : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--line)]"
              }`}
            >
              {r === 0 ? "All" : `${r}+ ★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/buses"
            className="flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-[var(--ink)]">
              {from} <span className="text-[var(--ink-muted)]">→</span> {to}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] font-mono">
              <span>{formatDate(date, "EEE, d MMM yyyy")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AllInPriceToggle />
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] md:hidden"
          >
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="sticky top-20 hidden md:block w-60 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm shrink-0 self-start">
          {filterContent}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50 md:hidden">
            <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl bg-[var(--surface)] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
                <span className="font-bold text-sm">Filter Buses</span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  <X size={18} />
                </button>
              </div>
              {filterContent}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="mt-6 w-full rounded-md bg-[var(--brand)] py-2.5 text-xs font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <ResultsSkeleton count={4} />
          ) : filteredBuses.length === 0 ? (
            <EmptyState
              title="No buses available on this sector"
              description={`No scheduled intercity buses found from ${from} to ${to} on ${formatDate(
                date,
                "d MMM"
              )}.`}
              actionLabel="Change Sector"
              actionHref="/buses"
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] px-1">
                <span>
                  Showing <strong>{filteredBuses.length}</strong> intercity buses
                </span>
                <span className="font-mono text-[11px]">Direct operator pricing</span>
              </div>

              {filteredBuses.map((bus) => (
                <BusCard
                  key={bus.id}
                  bus={bus}
                  date={date}
                  onProceedCheckout={handleProceedCheckout}
                  allIn={allIn}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading bus results...</div>}>
      <BusResultsContent />
    </Suspense>
  );
}

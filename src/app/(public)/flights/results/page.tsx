"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FlightResult, DayFare } from "@/server/providers/types";
import { FlightCard } from "@/features/flights/components/FlightCard";
import {
  FlightFiltersRail,
  FlightFilterState,
} from "@/features/flights/components/FlightFiltersRail";
import { FareCalendarStrip } from "@/features/flights/components/FareCalendarStrip";
import { PriceTrendChart } from "@/features/flights/components/PriceTrendChart";
import { RoundTripSummaryBar } from "@/features/flights/components/RoundTripSummaryBar";
import { ResultsSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { Filter, ArrowLeft, Plane, PlaneTakeoff, PlaneLanding } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/formatters";

function FlightsResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = (searchParams.get("from") || "DEL").toUpperCase();
  const to = (searchParams.get("to") || "BOM").toUpperCase();
  const date = searchParams.get("date") || "2026-11-22";
  const returnDate = searchParams.get("return") || "";
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const infants = parseInt(searchParams.get("infants") || "0", 10);
  const cabin = searchParams.get("cabin") || "ECONOMY";

  const totalPassengers = adults + children + infants;
  const isRoundTrip = Boolean(returnDate);

  // Active view for round trip: "OUTBOUND" or "RETURN"
  const [activeLeg, setActiveLeg] = useState<"OUTBOUND" | "RETURN">("OUTBOUND");
  const [selectedOutbound, setSelectedOutbound] = useState<FlightResult | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<FlightResult | null>(null);

  const [outboundFlights, setOutboundFlights] = useState<FlightResult[]>([]);
  const [returnFlights, setReturnFlights] = useState<FlightResult[]>([]);
  const [calendarDays, setCalendarDays] = useState<DayFare[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FlightFilterState>({
    stops: [],
    airlines: [],
    timeBands: [],
    maxPrice: 15000,
    refundableOnly: false,
    sortBy: "CHEAPEST",
  });

  // Fetch flights on param changes
  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        // Fetch outbound flights
        const outRes = await fetch(
          `/api/flights/search?from=${from}&to=${to}&date=${date}&adults=${adults}&children=${children}&infants=${infants}&cabin=${cabin}`
        );
        if (outRes.ok) {
          const data: FlightResult[] = await outRes.json();
          setOutboundFlights(data);
          if (data.length > 0) {
            const maxF = Math.max(...data.map((f) => f.calculatedFare));
            setFilters((prev) => ({ ...prev, maxPrice: Math.max(prev.maxPrice, maxF) }));
          }
        }

        // Fetch return flights if round-trip
        if (isRoundTrip && returnDate) {
          const retRes = await fetch(
            `/api/flights/search?from=${to}&to=${from}&date=${returnDate}&adults=${adults}&children=${children}&infants=${infants}&cabin=${cabin}`
          );
          if (retRes.ok) {
            const retData = await retRes.json();
            setReturnFlights(retData);
          }
        }

        // Fetch calendar strip
        const activeDate = activeLeg === "RETURN" ? returnDate : date;
        const activeFrom = activeLeg === "RETURN" ? to : from;
        const activeTo = activeLeg === "RETURN" ? from : to;
        const calRes = await fetch(
          `/api/flights/calendar?from=${activeFrom}&to=${activeTo}&date=${activeDate}`
        );
        if (calRes.ok) {
          const calData = await calRes.json();
          setCalendarDays(calData);
        }
      } catch (err) {
        console.error("Error fetching flight results:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [from, to, date, returnDate, adults, children, infants, cabin, isRoundTrip, activeLeg]);

  // Available airlines list
  const currentList = activeLeg === "RETURN" ? returnFlights : outboundFlights;
  const availableAirlines = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of currentList) {
      map.set(f.airlineCode, f.airlineName);
    }
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [currentList]);

  // Price range min/max
  const priceRange = useMemo(() => {
    if (currentList.length === 0) return { min: 2000, max: 15000 };
    const prices = currentList.map((f) => f.calculatedFare);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [currentList]);

  // Apply filters and sorting
  const filteredFlights = useMemo(() => {
    let result = [...currentList];

    // Stops filter
    if (filters.stops.length > 0) {
      result = result.filter((f) => filters.stops.includes(f.stops));
    }

    // Airlines filter
    if (filters.airlines.length > 0) {
      result = result.filter((f) => filters.airlines.includes(f.airlineCode));
    }

    // Refundable filter
    if (filters.refundableOnly) {
      result = result.filter((f) => f.refundable);
    }

    // Max price filter
    result = result.filter((f) => f.calculatedFare <= filters.maxPrice);

    // Time band filter
    if (filters.timeBands.length > 0) {
      result = result.filter((f) => {
        const hour = parseInt(f.departTime.split(":")[0], 10);
        if (filters.timeBands.includes("EARLY_MORNING") && hour < 6) return true;
        if (filters.timeBands.includes("MORNING") && hour >= 6 && hour < 12) return true;
        if (filters.timeBands.includes("AFTERNOON") && hour >= 12 && hour < 18) return true;
        if (filters.timeBands.includes("EVENING") && hour >= 18) return true;
        return false;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === "CHEAPEST") {
        return a.calculatedFare - b.calculatedFare;
      }
      if (filters.sortBy === "FASTEST") {
        return a.durationMin - b.durationMin;
      }
      if (filters.sortBy === "EARLIEST") {
        return a.departTime.localeCompare(b.departTime);
      }
      if (filters.sortBy === "BEST") {
        // Weighted composite: price normalized + duration normalized + stops penalty
        const scoreA = a.calculatedFare * 0.5 + a.durationMin * 10 + a.stops * 2000;
        const scoreB = b.calculatedFare * 0.5 + b.durationMin * 10 + b.stops * 2000;
        return scoreA - scoreB;
      }
      return 0;
    });

    return result;
  }, [currentList, filters]);

  // Handle calendar day select
  function handleSelectCalendarDate(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeLeg === "RETURN") {
      params.set("return", newDate);
    } else {
      params.set("date", newDate);
    }
    router.push(`/flights/results?${params.toString()}`);
  }

  // Handle flight selection
  async function handleFlightSelect(flight: FlightResult) {
    if (isRoundTrip) {
      if (activeLeg === "OUTBOUND") {
        setSelectedOutbound(flight);
        setActiveLeg("RETURN");
      } else {
        setSelectedReturn(flight);
      }
      return;
    }

    // One-way direct booking: create checkout session
    await initiateCheckout([flight]);
  }

  // Proceed with round trip booking
  async function handleProceedRoundTrip() {
    if (!selectedOutbound || !selectedReturn) return;
    await initiateCheckout([selectedOutbound, selectedReturn]);
  }

  // Create checkout session on server
  async function initiateCheckout(flights: FlightResult[]) {
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "FLIGHT",
          flights,
          passengerCount: totalPassengers,
          cabin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/checkout/${data.sessionId}`);
      } else if (res.status === 401) {
        // Section 7 Quality: Playwright e2e (1) guest searches flights and is prompted to sign in at checkout
        router.push(
          `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`
        );
      } else {
        alert("Unable to lock seats. Please refresh and try again.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Breadcrumb & Route Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/flights"
            className="flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
            title="Modify Search"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-[var(--ink)]">
              {from} <span className="text-[var(--ink-muted)]">→</span> {to}
              {isRoundTrip && (
                <span className="text-xs text-[var(--ink-muted)] font-normal ml-2">
                  (Round Trip)
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] font-mono">
              <span>{formatDate(date, "EEE, d MMM")}</span>
              {returnDate && (
                <>
                  <span>•</span>
                  <span>Return: {formatDate(returnDate, "EEE, d MMM")}</span>
                </>
              )}
              <span>•</span>
              <span>
                {totalPassengers} {totalPassengers === 1 ? "Traveller" : "Travellers"}
              </span>
              <span>•</span>
              <span>{cabin}</span>
            </div>
          </div>
        </div>

        {/* Mobile filter trigger */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] md:hidden self-start"
        >
          <Filter size={14} />
          <span>Filters & Sort</span>
        </button>
      </div>

      {/* Round-trip leg switcher tab */}
      {isRoundTrip && (
        <div className="mb-4 flex border-b border-[var(--line)] bg-[var(--surface)] rounded-md">
          <button
            type="button"
            onClick={() => setActiveLeg("OUTBOUND")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeLeg === "OUTBOUND"
                ? "border-[var(--brand)] text-[var(--brand)] font-bold bg-[var(--canvas)]"
                : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            <PlaneTakeoff size={15} />
            <span>
              1. Outbound: {from} → {to} ({formatDate(date, "d MMM")})
            </span>
            {selectedOutbound && (
              <span className="rounded bg-[var(--ok)] text-white px-1.5 py-0.2 text-[10px] font-mono">
                Selected
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveLeg("RETURN")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeLeg === "RETURN"
                ? "border-[var(--brand)] text-[var(--brand)] font-bold bg-[var(--canvas)]"
                : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            <PlaneLanding size={15} />
            <span>
              2. Return: {to} → {from} ({formatDate(returnDate, "d MMM")})
            </span>
            {selectedReturn && (
              <span className="rounded bg-[var(--ok)] text-white px-1.5 py-0.2 text-[10px] font-mono">
                Selected
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Content: Two-column layout (Section 3.3) */}
      <div className="flex items-start gap-6">
        {/* Left sticky filter rail */}
        <FlightFiltersRail
          filters={filters}
          onChange={(f) => setFilters(f)}
          availableAirlines={availableAirlines}
          priceRange={priceRange}
          isMobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
        />

        {/* Right: Results stream */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Fare Calendar Strip */}
          <FareCalendarStrip
            days={calendarDays}
            currentDate={activeLeg === "RETURN" ? returnDate : date}
            onSelectDate={handleSelectCalendarDate}
          />

          {/* Price Trend Chart (Recharts) */}
          <PriceTrendChart
            from={activeLeg === "RETURN" ? to : from}
            to={activeLeg === "RETURN" ? from : to}
          />

          {/* Results List */}
          {loading ? (
            <ResultsSkeleton count={4} />
          ) : filteredFlights.length === 0 ? (
            <EmptyState
              title="No flights match your filters"
              description="Try adjusting your stop preferences, price range, or clearing filters."
              actionLabel="Reset Filters"
              onAction={() =>
                setFilters({
                  stops: [],
                  airlines: [],
                  timeBands: [],
                  maxPrice: priceRange.max,
                  refundableOnly: false,
                  sortBy: "CHEAPEST",
                })
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] px-1">
                <span>
                  Showing <strong>{filteredFlights.length}</strong> available flights
                </span>
                <span className="font-mono text-[11px]">All fares include taxes</span>
              </div>

              {filteredFlights.map((f) => {
                const isSelected =
                  activeLeg === "OUTBOUND"
                    ? selectedOutbound?.id === f.id
                    : selectedReturn?.id === f.id;

                return (
                  <FlightCard
                    key={f.id}
                    flight={f}
                    isSelected={isSelected}
                    selectButtonLabel={isRoundTrip ? "Select Leg" : "Book"}
                    onSelect={handleFlightSelect}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Summary Bar for Round-trip */}
      {isRoundTrip && (
        <RoundTripSummaryBar
          outboundFlight={selectedOutbound}
          returnFlight={selectedReturn}
          passengersCount={totalPassengers}
          onProceed={handleProceedRoundTrip}
        />
      )}
    </div>
  );
}

export default function FlightsResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading flight search...</div>}>
      <FlightsResultsContent />
    </Suspense>
  );
}

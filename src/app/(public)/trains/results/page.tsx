"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TrainResult, TrainClassAvailability } from "@/server/providers/types";
import { TrainCard } from "@/features/trains/components/TrainCard";
import { ResultsSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { ArrowLeft, Filter, Train as TrainIcon, X } from "lucide-react";
import Link from "next/link";

function TrainResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = (searchParams.get("from") || "NDLS").toUpperCase();
  const to = (searchParams.get("to") || "BCT").toUpperCase();
  const date = searchParams.get("date") || "2026-11-24";
  const classFilter = searchParams.get("class") || "ALL";
  const quota = searchParams.get("quota") || "GN";

  const [trains, setTrains] = useState<TrainResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    classFilter !== "ALL" ? [classFilter] : []
  );
  const [sortBy, setSortBy] = useState<"DEPARTURE" | "DURATION" | "FARE">("DEPARTURE");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchTrains() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/trains/search?from=${from}&to=${to}&date=${date}&class=${classFilter}&quota=${quota}`
        );
        if (res.ok) {
          const data = await res.json();
          setTrains(data);
        }
      } catch (err) {
        console.error("Error searching trains:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrains();
  }, [from, to, date, classFilter, quota]);

  // Train types available in search results
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    trains.forEach((t) => set.add(t.trainType));
    return Array.from(set);
  }, [trains]);

  // Filtered trains
  const filteredTrains = useMemo(() => {
    let result = [...trains];

    if (selectedTypes.length > 0) {
      result = result.filter((t) => selectedTypes.includes(t.trainType));
    }

    if (selectedClasses.length > 0) {
      result = result.filter((t) =>
        t.classes.some((c) => selectedClasses.includes(c.classCode))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "DEPARTURE") {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (sortBy === "DURATION") {
        return a.durationMin - b.durationMin;
      }
      if (sortBy === "FARE") {
        const minFareA = Math.min(...a.classes.map((c) => c.fare));
        const minFareB = Math.min(...b.classes.map((c) => c.fare));
        return minFareA - minFareB;
      }
      return 0;
    });

    return result;
  }, [trains, selectedTypes, selectedClasses, sortBy]);

  async function handleBookClass(train: TrainResult, classItem: TrainClassAvailability) {
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "TRAIN",
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          fromStation: train.fromStation,
          toStation: train.toStation,
          date,
          classCode: classItem.classCode,
          quota,
          fare: classItem.fare,
          passengerCount: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/checkout/${data.sessionId}`);
      } else if (res.status === 401) {
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      } else {
        alert("Failed to lock train seats. Please try again.");
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
            setSelectedTypes([]);
            setSelectedClasses([]);
            setSortBy("DEPARTURE");
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
          <option value="DEPARTURE">Departure Time</option>
          <option value="DURATION">Travel Duration</option>
          <option value="FARE">Lowest Fare First</option>
        </select>
      </div>

      {/* Train Type */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Train Type
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
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Class filter */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Travel Class
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["1A", "2A", "3A", "CC", "SL", "2S"].map((cls) => (
            <label key={cls} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedClasses.includes(cls)}
                onChange={() => {
                  setSelectedClasses((prev) =>
                    prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
                  );
                }}
                className="rounded border-[var(--line)] text-[var(--accent)]"
              />
              <span className="font-mono">{cls}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Route Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/trains"
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
              <span>•</span>
              <span>Quota: {quota}</span>
              <span>•</span>
              <span>Class: {classFilter}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] md:hidden self-start"
        >
          <Filter size={14} />
          <span>Filters</span>
        </button>
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
                <span className="font-bold text-sm">Filter Trains</span>
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
          ) : filteredTrains.length === 0 ? (
            <EmptyState
              title="No trains found on this route and date"
              description={`No direct trains scheduled between ${from} and ${to} on ${formatDate(
                date,
                "d MMM"
              )}. Try an adjacent date or check alternate hub stations.`}
              actionLabel="Search Trains"
              actionHref="/trains"
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] px-1">
                <span>
                  Showing <strong>{filteredTrains.length}</strong> trains on this corridor
                </span>
                <span className="font-mono text-[11px]">Seat availability is live</span>
              </div>

              {filteredTrains.map((t) => (
                <TrainCard
                  key={t.trainNumber}
                  train={t}
                  searchDate={date}
                  quota={quota}
                  onBookClass={handleBookClass}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrainResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading train search...</div>}>
      <TrainResultsContent />
    </Suspense>
  );
}

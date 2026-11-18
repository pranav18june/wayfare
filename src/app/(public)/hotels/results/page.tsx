"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HotelResult } from "@/server/providers/types";
import { HotelCard } from "@/features/hotels/components/HotelCard";
import { ResultsSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { differenceInDays, parseISO } from "date-fns";
import { ArrowLeft, Filter, Building2, X } from "lucide-react";
import Link from "next/link";

function HotelResultsContent() {
  const searchParams = useSearchParams();

  const city = searchParams.get("city") || "Mumbai";
  const checkIn = searchParams.get("checkIn") || "2026-11-20";
  const checkOut = searchParams.get("checkOut") || "2026-11-22";
  const guests = parseInt(searchParams.get("guests") || "2", 10);
  const rooms = parseInt(searchParams.get("rooms") || "1", 10);

  // Nights count calculation
  const nights = useMemo(() => {
    try {
      const d1 = parseISO(checkIn);
      const d2 = parseISO(checkOut);
      return Math.max(1, differenceInDays(d2, d1));
    } catch {
      return 1;
    }
  }, [checkIn, checkOut]);

  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [starFilters, setStarFilters] = useState<number[]>([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState<"PRICE" | "RATING" | "POPULAR">("PRICE");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/hotels/search?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}`
        );
        if (res.ok) {
          const data: HotelResult[] = await res.json();
          setHotels(data);
          if (data.length > 0) {
            const max = Math.max(...data.map((h) => h.startingPrice));
            setMaxPrice(Math.max(10000, max));
          }
        }
      } catch (err) {
        console.error("Hotel search error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, [city, checkIn, checkOut, guests, rooms]);

  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    if (starFilters.length > 0) {
      result = result.filter((h) => starFilters.includes(h.stars));
    }
    if (freeCancelOnly) {
      result = result.filter((h) => h.freeCancellation);
    }
    result = result.filter((h) => h.startingPrice <= maxPrice);

    result.sort((a, b) => {
      if (sortBy === "PRICE") return a.startingPrice - b.startingPrice;
      if (sortBy === "RATING") return b.rating - a.rating;
      if (sortBy === "POPULAR") return b.stars - a.stars;
      return 0;
    });

    return result;
  }, [hotels, starFilters, freeCancelOnly, maxPrice, sortBy]);

  const filterContent = (
    <div className="flex flex-col gap-5 text-xs text-[var(--ink)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
        <span className="font-bold text-sm">Filters & Sort</span>
        <button
          type="button"
          onClick={() => {
            setStarFilters([]);
            setFreeCancelOnly(false);
            setMaxPrice(15000);
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
          <option value="PRICE">Price (Lowest first)</option>
          <option value="RATING">Guest Rating (Highest first)</option>
          <option value="POPULAR">Hotel Star Category</option>
        </select>
      </div>

      {/* Star Category */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="mb-2 block font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
          Star Category
        </label>
        <div className="flex flex-col gap-2">
          {[5, 4, 3].map((star) => (
            <label key={star} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={starFilters.includes(star)}
                onChange={() =>
                  setStarFilters((prev) =>
                    prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
                  )
                }
                className="rounded border-[var(--line)] text-[var(--accent)]"
              />
              <span>{star} Star Properties</span>
            </label>
          ))}
        </div>
      </div>

      {/* Free Cancellation Toggle */}
      <div className="border-t border-[var(--line)] pt-3">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={freeCancelOnly}
            onChange={(e) => setFreeCancelOnly(e.target.checked)}
            className="rounded border-[var(--line)] text-[var(--accent)]"
          />
          <span className="font-medium text-[var(--ok)]">Free Cancellation Only</span>
        </label>
      </div>

      {/* Price Slider */}
      <div className="border-t border-[var(--line)] pt-3">
        <div className="mb-2 flex items-center justify-between">
          <label className="font-bold text-[var(--ink-muted)] uppercase tracking-wider text-[10px]">
            Max Price / Night
          </label>
          <span className="font-mono font-bold text-[var(--ink)]">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min={1500}
          max={15000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--brand)]"
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/hotels"
            className="flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-[var(--ink)]">Hotels in {city}</h1>
            <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] font-mono">
              <span>{formatDate(checkIn, "d MMM")} → {formatDate(checkOut, "d MMM yyyy")}</span>
              <span>•</span>
              <span>{nights} {nights === 1 ? "Night" : "Nights"}</span>
              <span>•</span>
              <span>{guests} {guests === 1 ? "Guest" : "Guests"}</span>
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
        <aside className="sticky top-20 hidden md:block w-60 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm shrink-0 self-start">
          {filterContent}
        </aside>

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50 md:hidden">
            <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl bg-[var(--surface)] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
                <span className="font-bold text-sm">Filter Hotels</span>
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

        <div className="flex-1 min-w-0">
          {loading ? (
            <ResultsSkeleton count={4} />
          ) : filteredHotels.length === 0 ? (
            <EmptyState
              title="No hotels match your filters"
              description={`No properties available in ${city} matching the selected star or price criteria.`}
              actionLabel="Reset Filters"
              onAction={() => {
                setStarFilters([]);
                setFreeCancelOnly(false);
                setMaxPrice(15000);
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] px-1">
                <span>
                  Showing <strong>{filteredHotels.length}</strong> properties in {city}
                </span>
                <span className="font-mono text-[11px]">Instant voucher confirmation</span>
              </div>

              {filteredHotels.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  nights={nights}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HotelResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading hotels...</div>}>
      <HotelResultsContent />
    </Suspense>
  );
}

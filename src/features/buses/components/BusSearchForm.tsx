"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search, ShieldCheck } from "lucide-react";
import { SearchField } from "@/components/common/SearchField";
import { DatePicker } from "@/components/common/DatePicker";
import { format, addDays } from "date-fns";

interface BusSearchFormProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  className?: string;
}

export function BusSearchForm({
  initialFrom = "New Delhi",
  initialTo = "Jaipur",
  initialDate,
  className = "",
}: BusSearchFormProps) {
  const router = useRouter();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultDate = initialDate || format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [date, setDate] = useState(defaultDate);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSwap() {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fromCity) newErrors.from = "Select departure city";
    if (!toCity) newErrors.to = "Select destination city";
    if (fromCity && toCity && fromCity.toLowerCase() === toCity.toLowerCase()) {
      newErrors.to = "Origin and destination cannot be identical";
    }
    if (!date) newErrors.date = "Select travel date";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const params = new URLSearchParams({
      from: fromCity,
      to: toCity,
      date,
    });

    router.push(`/buses/results?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card hover:shadow-card-hover transition-all ${className}`}
    >
      {/* Top Header Controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[var(--brand)] bg-[var(--brand-light)] px-2.5 py-1 rounded-md border border-[var(--brand)]/20">
            INTERCITY BUS AGGREGATOR
          </span>
          <span className="text-xs text-[var(--ink-muted)] hidden sm:inline">
            Interactive multi-deck sleeper & seater layouts
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Ladies-Only Seat Protection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start relative">
        {/* From City */}
        <div className="md:col-span-4">
          <SearchField
            label="Departure City"
            placeholder="e.g. New Delhi"
            value={fromCity}
            onChange={(val) => {
              setFromCity(val);
              if (errors.from) setErrors((prev) => ({ ...prev, from: "" }));
            }}
            apiEndpoint="/api/autocomplete/cities"
            error={errors.from}
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center md:col-span-1 md:pt-6">
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] active:rotate-180 transition-all duration-200 shadow-xs cursor-pointer"
            title="Swap Origin and Destination"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight size={15} />
          </button>
        </div>

        {/* To City */}
        <div className="md:col-span-4">
          <SearchField
            label="Destination City"
            placeholder="e.g. Jaipur"
            value={toCity}
            onChange={(val) => {
              setToCity(val);
              if (errors.to) setErrors((prev) => ({ ...prev, to: "" }));
            }}
            apiEndpoint="/api/autocomplete/cities"
            error={errors.to}
          />
        </div>

        {/* Travel Date */}
        <div className="md:col-span-3">
          <DatePicker
            label="Journey Date"
            value={date}
            minDate={todayStr}
            onChange={(val) => {
              setDate(val);
              if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
            }}
            error={errors.date}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)]/60 pt-4">
        <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 font-mono">
          <span>Live deck seat selection</span>
          <span>·</span>
          <span>Verified private fleet operators</span>
        </div>

        <button
          type="submit"
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-8 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-hover)] active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <Search size={16} />
          <span>Search Buses</span>
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search, PlaneTakeoff, ShieldCheck } from "lucide-react";
import { SearchField } from "@/components/common/SearchField";
import { DatePicker } from "@/components/common/DatePicker";
import { PassengerSelector, PassengerCount } from "@/components/common/PassengerSelector";
import { format, addDays } from "date-fns";

interface FlightSearchFormProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialReturn?: string;
  className?: string;
}

export function FlightSearchForm({
  initialFrom = "DEL",
  initialTo = "BOM",
  initialDate,
  initialReturn = "",
  className = "",
}: FlightSearchFormProps) {
  const router = useRouter();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultDepart = initialDate || format(addDays(new Date(), 2), "yyyy-MM-dd");

  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP">(
    initialReturn ? "ROUND_TRIP" : "ONE_WAY"
  );
  const [fromCode, setFromCode] = useState(initialFrom);
  const [toCode, setToCode] = useState(initialTo);
  const [departDate, setDepartDate] = useState(defaultDepart);
  const [returnDate, setReturnDate] = useState(
    initialReturn || format(addDays(new Date(), 5), "yyyy-MM-dd")
  );
  const [passengers, setPassengers] = useState<PassengerCount>({
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "ECONOMY",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSwap() {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fromCode) newErrors.from = "Select departure airport";
    if (!toCode) newErrors.to = "Select arrival airport";
    if (fromCode && toCode && fromCode.toUpperCase() === toCode.toUpperCase()) {
      newErrors.to = "Origin & destination cannot be the same";
    }
    if (!departDate) newErrors.departDate = "Select departure date";

    if (tripType === "ROUND_TRIP") {
      if (!returnDate) {
        newErrors.returnDate = "Select return date";
      } else if (returnDate < departDate) {
        newErrors.returnDate = "Return must be after departure";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const params = new URLSearchParams({
      from: fromCode.toUpperCase(),
      to: toCode.toUpperCase(),
      date: departDate,
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      infants: passengers.infants.toString(),
      cabin: passengers.cabin,
    });

    if (tripType === "ROUND_TRIP" && returnDate) {
      params.set("return", returnDate);
    }

    router.push(`/flights/results?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card hover:shadow-card-hover transition-all ${className}`}
    >
      {/* Top Controls: Trip Type Segmented Control */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-[var(--canvas)] p-1 border border-[var(--line)]">
          <button
            type="button"
            onClick={() => setTripType("ONE_WAY")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tripType === "ONE_WAY"
                ? "bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-xs"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => setTripType("ROUND_TRIP")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tripType === "ROUND_TRIP"
                ? "bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-xs"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            Round Trip (Save up to ₹1,200)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="hidden sm:inline">Price Lock Guaranteed</span>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start relative">
        {/* Origin */}
        <div className="md:col-span-3">
          <SearchField
            label="Origin Airport"
            placeholder="e.g. DEL (Delhi)"
            value={fromCode}
            onChange={(val) => {
              setFromCode(val);
              if (errors.from) setErrors((prev) => ({ ...prev, from: "" }));
            }}
            apiEndpoint="/api/autocomplete/airports"
            error={errors.from}
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center md:col-span-1 md:pt-6">
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] active:rotate-180 transition-all duration-200 shadow-xs"
            title="Swap Origin and Destination"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight size={15} />
          </button>
        </div>

        {/* Destination */}
        <div className="md:col-span-3">
          <SearchField
            label="Destination Airport"
            placeholder="e.g. BOM (Mumbai)"
            value={toCode}
            onChange={(val) => {
              setToCode(val);
              if (errors.to) setErrors((prev) => ({ ...prev, to: "" }));
            }}
            apiEndpoint="/api/autocomplete/airports"
            error={errors.to}
          />
        </div>

        {/* Departure Date */}
        <div className={tripType === "ROUND_TRIP" ? "md:col-span-2" : "md:col-span-3"}>
          <DatePicker
            label="Departure Date"
            value={departDate}
            minDate={todayStr}
            onChange={(val) => {
              setDepartDate(val);
              if (errors.departDate) setErrors((prev) => ({ ...prev, departDate: "" }));
            }}
            error={errors.departDate}
          />
        </div>

        {/* Return Date (if Round Trip) */}
        {tripType === "ROUND_TRIP" && (
          <div className="md:col-span-2">
            <DatePicker
              label="Return Date"
              value={returnDate}
              minDate={departDate || todayStr}
              onChange={(val) => {
                setReturnDate(val);
                if (errors.returnDate) setErrors((prev) => ({ ...prev, returnDate: "" }));
              }}
              error={errors.returnDate}
            />
          </div>
        )}

        {/* Passengers & Class */}
        <div className={tripType === "ROUND_TRIP" ? "md:col-span-12 lg:col-span-3" : "md:col-span-2"}>
          <PassengerSelector
            value={passengers}
            onChange={(val) => setPassengers(val)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)]/60 pt-4">
        <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 font-mono">
          <span>Direct carrier inventory</span>
          <span>·</span>
          <span>Zero hidden charges</span>
        </div>

        <button
          type="submit"
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-8 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-hover)] active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <Search size={16} />
          <span>Search Flights</span>
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search, Info, ShieldCheck } from "lucide-react";
import { SearchField } from "@/components/common/SearchField";
import { DatePicker } from "@/components/common/DatePicker";
import { format, addDays } from "date-fns";

interface TrainSearchFormProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialClass?: string;
  initialQuota?: string;
  className?: string;
}

export function TrainSearchForm({
  initialFrom = "NDLS",
  initialTo = "BCT",
  initialDate,
  initialClass = "ALL",
  initialQuota = "GN",
  className = "",
}: TrainSearchFormProps) {
  const router = useRouter();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultDate = initialDate || format(addDays(new Date(), 2), "yyyy-MM-dd");

  const [fromStation, setFromStation] = useState(initialFrom);
  const [toStation, setToStation] = useState(initialTo);
  const [date, setDate] = useState(defaultDate);
  const [classCode, setClassCode] = useState(initialClass);
  const [quota, setQuota] = useState(initialQuota);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSwap() {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fromStation) newErrors.from = "Select departure station";
    if (!toStation) newErrors.to = "Select arrival station";
    if (fromStation && toStation && fromStation.toUpperCase() === toStation.toUpperCase()) {
      newErrors.to = "Origin and destination cannot be identical";
    }
    if (!date) newErrors.date = "Select travel date";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const params = new URLSearchParams({
      from: fromStation.toUpperCase(),
      to: toStation.toUpperCase(),
      date,
      class: classCode,
      quota,
    });

    router.push(`/trains/results?${params.toString()}`);
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
            IRCTC AUTHORIZED PARTNER
          </span>
          <span className="text-xs text-[var(--ink-muted)] hidden sm:inline">
            Direct booking with live PNR generation
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>ConfirmTkt Heuristic Engine</span>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start relative">
        {/* From Station */}
        <div className="md:col-span-3">
          <SearchField
            label="From Station"
            placeholder="e.g. NDLS (New Delhi)"
            value={fromStation}
            onChange={(val) => {
              setFromStation(val);
              if (errors.from) setErrors((prev) => ({ ...prev, from: "" }));
            }}
            apiEndpoint="/api/autocomplete/stations"
            error={errors.from}
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center md:col-span-1 md:pt-6">
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] active:rotate-180 transition-all duration-200 shadow-xs"
            title="Swap Stations"
            aria-label="Swap departure and arrival stations"
          >
            <ArrowLeftRight size={15} />
          </button>
        </div>

        {/* To Station */}
        <div className="md:col-span-3">
          <SearchField
            label="To Station"
            placeholder="e.g. BCT (Mumbai Central)"
            value={toStation}
            onChange={(val) => {
              setToStation(val);
              if (errors.to) setErrors((prev) => ({ ...prev, to: "" }));
            }}
            apiEndpoint="/api/autocomplete/stations"
            error={errors.to}
          />
        </div>

        {/* Travel Date */}
        <div className="md:col-span-2">
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

        {/* Class Selector */}
        <div className="md:col-span-1.5 flex flex-col">
          <label htmlFor="train-class-select" className="mb-1 text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
            Class
          </label>
          <select
            id="train-class-select"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="h-11 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-mono font-medium text-[var(--ink)] hover:border-[var(--ink-muted)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none shadow-xs"
          >
            <option value="ALL">All Classes</option>
            <option value="1A">AC First (1A)</option>
            <option value="2A">AC 2-Tier (2A)</option>
            <option value="3A">AC 3-Tier (3A)</option>
            <option value="CC">AC Chair Car (CC)</option>
            <option value="SL">Sleeper (SL)</option>
            <option value="2S">Second Sitting (2S)</option>
          </select>
        </div>

        {/* Quota Selector */}
        <div className="md:col-span-1.5 flex flex-col">
          <label htmlFor="train-quota-select" className="mb-1 text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
            Quota
          </label>
          <select
            id="train-quota-select"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="h-11 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-mono font-medium text-[var(--ink)] hover:border-[var(--ink-muted)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none shadow-xs"
          >
            <option value="GN">General (GN)</option>
            <option value="TQ">Tatkal (TQ)</option>
            <option value="LD">Ladies (LD)</option>
          </select>
        </div>
      </div>

      {/* Tatkal Help Text if selected */}
      {quota === "TQ" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-700" />
          <span>
            <strong>Tatkal Booking Rules:</strong> Opens 1 day prior to train origin departure date: AC classes open at 10:00 AM IST, Non-AC classes open at 11:00 AM IST. Fares include dynamic premium charges.
          </span>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)]/60 pt-4">
        <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 font-mono">
          <span>7-Day seat availability preview</span>
          <span>·</span>
          <span>RAC/WL confirmation probability</span>
        </div>

        <button
          type="submit"
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-8 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-hover)] active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <Search size={16} />
          <span>Search Trains</span>
        </button>
      </div>
    </form>
  );
}

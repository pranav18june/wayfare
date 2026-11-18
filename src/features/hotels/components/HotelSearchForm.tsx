"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, ShieldCheck, Building2 } from "lucide-react";
import { SearchField } from "@/components/common/SearchField";
import { DatePicker } from "@/components/common/DatePicker";
import { format, addDays } from "date-fns";

interface HotelSearchFormProps {
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  className?: string;
}

export function HotelSearchForm({
  initialCity = "Mumbai",
  initialCheckIn,
  initialCheckOut,
  className = "",
}: HotelSearchFormProps) {
  const router = useRouter();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultIn = initialCheckIn || format(addDays(new Date(), 2), "yyyy-MM-dd");
  const defaultOut = initialCheckOut || format(addDays(new Date(), 4), "yyyy-MM-dd");

  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!city) newErrors.city = "Select destination city";
    if (!checkIn) newErrors.checkIn = "Select check-in date";
    if (!checkOut) {
      newErrors.checkOut = "Select check-out date";
    } else if (checkOut <= checkIn) {
      newErrors.checkOut = "Check-out date must be after check-in";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const params = new URLSearchParams({
      city,
      checkIn,
      checkOut,
      guests: guests.toString(),
      rooms: rooms.toString(),
    });

    router.push(`/hotels/results?${params.toString()}`);
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
            HOTEL & RESORT ENGINE
          </span>
          <span className="text-xs text-[var(--ink-muted)] hidden sm:inline">
            150 verified properties across metropolitan corridors
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Free Cancellation Prior to 24h</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start">
        {/* City */}
        <div className="md:col-span-4">
          <SearchField
            label="Destination City"
            placeholder="e.g. Mumbai, New Delhi, Goa"
            value={city}
            onChange={(val) => {
              setCity(val);
              if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
            }}
            apiEndpoint="/api/autocomplete/cities"
            error={errors.city}
          />
        </div>

        {/* Check-In */}
        <div className="md:col-span-3">
          <DatePicker
            label="Check-In"
            value={checkIn}
            minDate={todayStr}
            onChange={(val) => {
              setCheckIn(val);
              if (errors.checkIn) setErrors((prev) => ({ ...prev, checkIn: "" }));
            }}
            error={errors.checkIn}
          />
        </div>

        {/* Check-Out */}
        <div className="md:col-span-3">
          <DatePicker
            label="Check-Out"
            value={checkOut}
            minDate={checkIn || todayStr}
            onChange={(val) => {
              setCheckOut(val);
              if (errors.checkOut) setErrors((prev) => ({ ...prev, checkOut: "" }));
            }}
            error={errors.checkOut}
          />
        </div>

        {/* Guests & Rooms */}
        <div className="md:col-span-2 flex flex-col">
          <span className="mb-1 text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
            Guests & Rooms
          </span>
          <div className="flex items-center gap-2">
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              className="h-11 w-1/2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-mono font-medium text-[var(--ink)] hover:border-[var(--ink-muted)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none shadow-xs"
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  {g} {g === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
            <select
              value={rooms}
              onChange={(e) => setRooms(parseInt(e.target.value, 10))}
              className="h-11 w-1/2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-mono font-medium text-[var(--ink)] hover:border-[var(--ink-muted)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none shadow-xs"
            >
              {[1, 2, 3, 4].map((r) => (
                <option key={r} value={r}>
                  {r} {r === 1 ? "Room" : "Rooms"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)]/60 pt-4">
        <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 font-mono">
          <span>Date-based dynamic tariffs</span>
          <span>·</span>
          <span>Verified guest reviews</span>
        </div>

        <button
          type="submit"
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-8 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-hover)] active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <Search size={16} />
          <span>Search Hotels</span>
        </button>
      </div>
    </form>
  );
}

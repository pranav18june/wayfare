"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plane, Train, Bus, Hotel } from "lucide-react";

interface LiveBooking {
  id: string;
  mode: string;
  pnr: string | null;
  route: string;
  departDate: string;
  departTime: string;
  passengers: number;
  trainNumber?: string;
}

export function TravelDayBanner() {
  const [booking, setBooking] = useState<LiveBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/trips/live-check")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!mounted || !data) return;
        if (data.bookings && data.bookings.length > 0) {
          setBooking(data.bookings[0]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !booking) return null;

  const ModeIcon =
    booking.mode === "FLIGHT"
      ? Plane
      : booking.mode === "TRAIN"
      ? Train
      : booking.mode === "BUS"
      ? Bus
      : Hotel;

  return (
    <div className="w-full bg-[var(--ink)] text-white border-b border-[var(--line)] py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase bg-[var(--brand)] text-white tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Travel Day
          </span>
          <div className="flex items-center gap-2">
            <ModeIcon className="w-4 h-4 text-orange-300" />
            <span className="font-medium text-white">{booking.route}</span>
            <span className="text-white/60 text-xs hidden md:inline">
              Departure: {booking.departTime} ({booking.departDate})
            </span>
            {booking.pnr && (
              <span className="font-mono text-xs px-2 py-0.5 bg-white/10 rounded text-orange-200">
                PNR: {booking.pnr}
              </span>
            )}
          </div>
        </div>

        <Link
          href="/trips/live"
          className="inline-flex items-center gap-1 text-xs font-medium text-orange-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10"
        >
          Open Trip Mode
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

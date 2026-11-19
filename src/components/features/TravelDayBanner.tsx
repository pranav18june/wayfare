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
    <div className="w-full bg-gradient-to-r from-[var(--ink)] to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ModeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Live Travel Day Alert
              </span>
              <span className="font-bold text-white text-sm sm:text-base">
                {booking.route}
              </span>
              {booking.pnr && (
                <span className="font-mono text-xs px-2 py-0.5 bg-white/10 rounded text-orange-200">
                  PNR: {booking.pnr}
                </span>
              )}
            </div>
            <p className="text-xs text-white/70 mt-1 font-mono">
              Scheduled Departure: {booking.departTime} on {booking.departDate} · {booking.passengers} Traveler(s)
            </p>
          </div>
        </div>

        <Link
          href="/trips/live"
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[var(--brand)] hover:bg-[#d04f0a] px-4 py-2.5 rounded-xl transition-all shadow-xs self-stretch sm:self-auto justify-center"
        >
          <span>Open Trip Mode</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

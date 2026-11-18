"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  ArrowLeft,
  Plane,
  Train,
  Bus,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Download,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function GroupedTripTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        if (res.ok) {
          const json = await res.json();
          setTrip(json);
        } else {
          router.push("/trips");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [tripId, router]);

  if (loading || !trip) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-xs text-[var(--ink-muted)]">
        Compiling trip itinerary timeline...
      </div>
    );
  }

  const modeIcons: Record<string, any> = {
    FLIGHT: Plane,
    TRAIN: Train,
    BUS: Bus,
    HOTEL: Building2,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="mb-6 flex items-center gap-3 border-b border-[var(--line)] pb-4">
        <Link
          href="/trips"
          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="font-mono text-xs font-bold text-[var(--brand)]">
            GROUPED ITINERARY TIMELINE
          </span>
          <h1 className="text-xl font-bold text-[var(--ink)]">{trip.name}</h1>
          <p className="text-xs text-[var(--ink-muted)]">
            {trip.bookings.length} coordinated legs across transit & accommodation providers.
          </p>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="relative border-l-2 border-[var(--line)] ml-4 pl-6 flex flex-col gap-6">
        {trip.bookings.map((leg: any, idx: number) => {
          const Icon = modeIcons[leg.mode] || Plane;
          const meta = leg.meta || {};

          return (
            <div key={leg.id} className="relative rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
              {/* Timeline marker icon on line */}
              <div className="absolute -left-[35px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)] text-white text-xs font-mono font-bold">
                {idx + 1}
              </div>

              {/* Leg Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-[var(--accent)]" />
                  <span className="font-mono text-xs font-bold text-[var(--accent)]">
                    {leg.mode}
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--ink-muted)]">
                    • PNR: {leg.pnr || leg.id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={leg.status} />
                  <span className="font-mono text-xs font-bold text-[var(--ink)]">
                    {formatINR(leg.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Segment Details */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="text-sm font-bold text-[var(--ink)]">
                  {meta.origin || meta.fromStation || meta.from || meta.city || "Origin"} →{" "}
                  {meta.destination || meta.toStation || meta.to || meta.hotelName || "Destination"}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 font-mono text-[11px] text-[var(--ink-muted)] bg-[var(--canvas)] p-2.5 rounded border border-[var(--line)]">
                  <div>
                    <span className="font-medium text-[var(--ink)]">Scheduled Date:</span>
                    <div>{meta.date || meta.checkIn || formatDate(leg.createdAt, "yyyy-MM-dd")}</div>
                  </div>

                  <div>
                    <span className="font-medium text-[var(--ink)]">Service Info:</span>
                    <div>
                      {meta.flightNumber || meta.trainName || meta.operator || meta.roomType || "Standard"}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-[var(--ink)]">Passengers:</span>
                    <div>{leg.passengers?.length || 1} Traveller(s)</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[var(--line)]">
                  <a
                    href={`/api/booking/${leg.id}/pdf`}
                    download
                    className="flex items-center gap-1 rounded border border-[var(--line)] bg-[var(--canvas)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:border-[var(--accent)]"
                  >
                    <Download size={12} />
                    <span>PDF Ticket</span>
                  </a>
                  <Link
                    href={`/booking/${leg.id}`}
                    className="flex items-center gap-1 rounded bg-[var(--ink)] text-white px-3 py-1 text-xs font-semibold hover:bg-black"
                  >
                    <span>View Booking</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

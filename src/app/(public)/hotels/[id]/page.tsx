"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { HotelDetailResult, HotelRoomDetail } from "@/server/providers/types";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import { differenceInDays, parseISO } from "date-fns";
import {
  Star,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Users,
} from "lucide-react";
import Link from "next/link";

function HotelDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const hotelId = params.id as string;
  const checkIn = searchParams.get("checkIn") || "2026-11-20";
  const checkOut = searchParams.get("checkOut") || "2026-11-22";

  const nights = useMemo(() => {
    try {
      const d1 = parseISO(checkIn);
      const d2 = parseISO(checkOut);
      return Math.max(1, differenceInDays(d2, d1));
    } catch {
      return 1;
    }
  }, [checkIn, checkOut]);

  const [detail, setDetail] = useState<HotelDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/hotels/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}`
        );
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
        }
      } catch (err) {
        console.error("Error fetching hotel detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [hotelId, checkIn, checkOut]);

  async function handleBookRoom(room: HotelRoomDetail) {
    const totalRoomPrice = room.basePrice * nights;
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "HOTEL",
          hotelId: detail?.id,
          hotelName: detail?.name,
          city: detail?.city,
          roomType: room.type,
          checkIn,
          checkOut,
          nights,
          totalPrice: totalRoomPrice,
          passengerCount: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/checkout/${data.sessionId}`);
      } else if (res.status === 401) {
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      } else {
        alert("Failed to initialize hotel booking. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading || !detail) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center text-xs text-[var(--ink-muted)]">
        Loading property details...
      </div>
    );
  }

  const images = detail.images.length > 0 ? detail.images : ["/img/hotels/room-1.svg"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href={`/hotels/results?city=${encodeURIComponent(detail.city)}&checkIn=${checkIn}&checkOut=${checkOut}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={14} />
          <span>Back to Hotels in {detail.city}</span>
        </Link>
      </div>

      {/* Property Title & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--ink)]">{detail.name}</h1>
            <span className="flex items-center gap-0.5 rounded bg-[var(--ink)] text-white px-2 py-0.5 text-xs font-bold">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{detail.stars} Star</span>
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--ink-muted)]">
            <MapPin size={13} />
            <span>{detail.locality}, {detail.city}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="rounded bg-[#E6F4EA] px-2.5 py-1 text-xs font-bold text-[var(--ok)] border border-[#CEEAD6]">
              ★ {detail.rating} / 5.0
            </div>
            <span className="text-[10px] text-[var(--ink-muted)]">{detail.reviews.length} Verified Reviews</span>
          </div>
        </div>
      </div>

      {/* Local Imagery Gallery */}
      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="relative h-72 md:col-span-8 rounded-lg overflow-hidden bg-[var(--canvas)] border border-[var(--line)]">
          <img
            src={images[activeImage] || images[0]}
            alt={detail.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex md:flex-col gap-2 md:col-span-4 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(idx)}
              className={`relative h-22 w-28 md:w-full rounded overflow-hidden border transition-all ${
                activeImage === idx
                  ? "border-[var(--brand)] ring-2 ring-[var(--brand)]"
                  : "border-[var(--line)] opacity-75 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* About & Amenities Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--ink)] mb-2">About Property</h2>
          <p className="text-xs text-[var(--ink-muted)] leading-relaxed mb-4">
            {detail.description}
          </p>

          <h3 className="text-xs font-bold text-[var(--ink)] mb-2 uppercase tracking-wider">
            Featured Amenities
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--ink)]">
            {detail.amenities.map((am) => (
              <div key={am} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[var(--ok)]" />
                <span>{am}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Policies card */}
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 text-xs flex flex-col gap-3">
          <h2 className="text-sm font-bold text-[var(--ink)]">Hotel Policies</h2>

          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--ink-muted)]">Check-In</span>
            <span className="font-mono font-bold text-[var(--ink)]">{detail.policies.checkIn}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--ink-muted)]">Check-Out</span>
            <span className="font-mono font-bold text-[var(--ink)]">{detail.policies.checkOut}</span>
          </div>

          <div className="flex items-start gap-2 pt-1 text-[var(--ok)]">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <span>
              {detail.policies.freeCancellation
                ? `Free cancellation available up to ${detail.policies.cancellationHours} hours before check-in.`
                : "Standard non-refundable reservation."}
            </span>
          </div>
        </div>
      </div>

      {/* Available Rooms Section (Date-based pricing) */}
      <section className="mb-8 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">Select Room Type</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Pricing calculated for {nights} {nights === 1 ? "night" : "nights"} ({formatDate(checkIn, "d MMM")} → {formatDate(checkOut, "d MMM")})
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--ok)] font-medium">● Instant Confirmation</span>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {detail.rooms.map((room) => {
            const totalPrice = room.basePrice * nights;
            return (
              <div
                key={room.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)]">{room.type}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[var(--ink-muted)]">
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      <span>Fits {room.capacity} Guests</span>
                    </span>
                    <span>•</span>
                    <span>Free WiFi & Air Conditioning</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[var(--line)] pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-base font-bold text-[var(--ink)]">
                      {formatINR(room.basePrice)}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--ink-muted)]">
                      per night • {formatINR(totalPrice)} total
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookRoom(room)}
                    className="flex items-center gap-1.5 rounded-md bg-[var(--brand)] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-ink)] shadow-sm"
                  >
                    <span>Book Room</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guest Reviews List */}
      {detail.reviews.length > 0 && (
        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--ink)] mb-4">Guest Reviews & Ratings</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {detail.reviews.map((rev, idx) => (
              <div
                key={idx}
                className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[var(--ink)]">{rev.author}</span>
                  <span className="rounded bg-[#E6F4EA] px-1.5 py-0.2 font-mono font-bold text-[10px] text-[var(--ok)]">
                    ★ {rev.rating}
                  </span>
                </div>
                <p className="text-[var(--ink-muted)] leading-relaxed">{rev.text}</p>
                <span className="mt-2 block font-mono text-[10px] text-[var(--ink-muted)]">
                  {formatDate(rev.date, "d MMM yyyy")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HotelDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading property details...</div>}>
      <HotelDetailContent />
    </Suspense>
  );
}

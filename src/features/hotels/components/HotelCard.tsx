import { HotelResult } from "@/server/providers/types";
import { formatINR } from "@/lib/utils/formatters";
import { Star, MapPin, Check, Wifi, ArrowRight } from "lucide-react";
import Link from "next/link";
import { allInPrice } from "@/lib/domain/pricing";
import { GroupBookingButton } from "@/components/features/GroupBookingButton";

interface HotelCardProps {
  hotel: HotelResult;
  checkIn: string;
  checkOut: string;
  nights: number;
  allIn?: boolean;
}

export function HotelCard({ hotel, checkIn, checkOut, nights, allIn = false }: HotelCardProps) {
  const effectiveStarting = allIn
    ? allInPrice(hotel.startingPrice, "HOTEL")
    : hotel.startingPrice;
  const totalPrice = effectiveStarting * nights;
  const imageSrc = hotel.images[0] || "/img/hotels/room-1.svg";

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-card hover:shadow-card-hover transition-all">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-12 sm:items-center">
        {/* Local Thumbnail Gallery Image */}
        <div className="relative h-48 w-full sm:col-span-4 rounded-xl overflow-hidden bg-[var(--canvas)] border border-[var(--line)]">
          <img
            src={imageSrc}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-[var(--ink)]/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono font-bold text-white shadow-2xs">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span>{hotel.stars} Star Property</span>
          </div>
        </div>

        {/* Info & Amenities */}
        <div className="sm:col-span-5 flex flex-col gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink)]">{hotel.name}</h3>
            <div className="flex items-center gap-1 text-xs text-[var(--ink-muted)] mt-0.5">
              <MapPin size={13} className="shrink-0 text-[var(--brand)]" />
              <span className="truncate">{hotel.locality}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-800 border border-emerald-200">
              <Star size={11} fill="currentColor" />
              <span>{hotel.rating} / 5.0</span>
            </span>
            <span className="text-xs text-[var(--ink-muted)] font-mono">Verified Reviews</span>
          </div>

          {/* Amenities chips */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {hotel.amenities.slice(0, 3).map((am) => (
              <span
                key={am}
                className="rounded-md bg-[var(--canvas)] px-2.5 py-1 text-[10px] font-mono text-[var(--ink)] border border-[var(--line)]"
              >
                {am}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] font-mono text-[var(--ink-muted)] self-center">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>

          {hotel.freeCancellation && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 mt-1">
              <Check size={13} />
              <span>Free cancellation up to 24h prior</span>
            </div>
          )}
        </div>

        {/* Price & View Rooms CTA */}
        <div className="flex items-center justify-between sm:col-span-3 sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 border-[var(--line)] pt-3 sm:pt-0 gap-2">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[var(--ink-muted)] block font-mono">
              Starting from
            </span>
            <div className="font-mono text-xl font-bold text-[var(--ink)]">
              {formatINR(effectiveStarting)}
            </div>
            <span className="text-[10px] text-[var(--ink-muted)] block font-mono">
              {allIn ? "per night · taxes & fees incl." : "per night · excl. taxes"}
            </span>
            {nights > 1 && (
              <div className="text-[11px] font-mono font-semibold text-[var(--ink-muted)] mt-1">
                Total ({nights} nights): {formatINR(totalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:flex-col sm:w-full sm:items-end">
            <Link
              href={`/hotels/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}`}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[var(--brand-hover)] active:scale-[0.98] shadow-xs"
            >
              <span>View Rooms</span>
              <ArrowRight size={14} />
            </Link>

            <GroupBookingButton
              mode="HOTEL"
              selectedItem={hotel}
              pricePerHead={effectiveStarting}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

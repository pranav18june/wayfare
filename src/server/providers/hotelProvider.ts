import prisma from "@/lib/db/prisma";
import { HotelQuery, HotelResult, HotelDetailResult } from "./types";
import { differenceInDays, parseISO } from "date-fns";

export interface HotelProvider {
  search(q: HotelQuery): Promise<HotelResult[]>;
  getDetail(hotelId: string, checkIn?: string, checkOut?: string): Promise<HotelDetailResult | null>;
}

export class MockHotelProvider implements HotelProvider {
  async search(q: HotelQuery): Promise<HotelResult[]> {
    const { city } = q;

    const cityRecord = await prisma.city.findFirst({
      where: { name: { contains: city } },
    });

    if (!cityRecord) return [];

    const hotels = await prisma.hotel.findMany({
      where: { cityId: cityRecord.id },
      include: {
        rooms: {
          orderBy: { basePrice: "asc" },
        },
      },
    });

    return hotels.map((h) => {
      let amenities: string[] = [];
      let images: string[] = [];
      let policies: { freeCancellation?: boolean } = {};
      try {
        amenities = JSON.parse(h.amenities);
        images = JSON.parse(h.images);
        policies = JSON.parse(h.policies);
      } catch {
        // fallback
      }

      const startingPrice = h.rooms[0]?.basePrice || 2400;

      return {
        id: h.id,
        name: h.name,
        city: cityRecord.name,
        locality: h.locality,
        stars: h.stars,
        rating: h.rating,
        amenities,
        startingPrice,
        freeCancellation: Boolean(policies.freeCancellation),
        images,
      };
    });
  }

  async getDetail(
    hotelId: string,
    checkIn?: string,
    checkOut?: string
  ): Promise<HotelDetailResult | null> {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        city: true,
        rooms: true,
        reviews: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!hotel) return null;

    let amenities: string[] = [];
    let images: string[] = [];
    let policies = {
      checkIn: "14:00",
      checkOut: "11:00",
      cancellationHours: 24,
      freeCancellation: true,
    };

    try {
      amenities = JSON.parse(hotel.amenities);
      images = JSON.parse(hotel.images);
      policies = JSON.parse(hotel.policies);
    } catch {
      // fallback
    }

    // Dynamic price calculation if dates are provided
    let nightMultiplier = 1.0;
    if (checkIn && checkOut) {
      try {
        const d1 = parseISO(checkIn);
        const d2 = parseISO(checkOut);
        const nights = Math.max(1, differenceInDays(d2, d1));
        // Weekend multiplier
        const dow = d1.getDay();
        nightMultiplier = dow === 5 || dow === 6 ? 1.15 : 1.0;
      } catch {
        // fallback
      }
    }

    return {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city.name,
      locality: hotel.locality,
      stars: hotel.stars,
      rating: hotel.rating,
      amenities,
      description: hotel.description,
      images,
      policies,
      rooms: hotel.rooms.map((r) => ({
        id: r.id,
        type: r.type,
        capacity: r.capacity,
        basePrice: Math.round(r.basePrice * nightMultiplier),
        available: true,
      })),
      reviews: hotel.reviews.map((rev) => ({
        author: rev.author,
        rating: rev.rating,
        text: rev.text,
        date: rev.date.toISOString().slice(0, 10),
      })),
    };
  }
}

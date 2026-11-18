import prisma from "@/lib/db/prisma";
import { BusQuery, BusResult, BusSeat } from "./types";

export interface BusProvider {
  search(q: BusQuery): Promise<BusResult[]>;
  getSeatLayout(busId: string, date: string): Promise<BusSeat[]>;
}

export class MockBusProvider implements BusProvider {
  async search(q: BusQuery): Promise<BusResult[]> {
    const { fromCity, toCity, date } = q;

    // Resolve cities
    const fCity = await prisma.city.findFirst({
      where: { name: { contains: fromCity } },
    });
    const tCity = await prisma.city.findFirst({
      where: { name: { contains: toCity } },
    });

    if (!fCity || !tCity) return [];

    const buses = await prisma.bus.findMany({
      where: {
        fromCityId: fCity.id,
        toCityId: tCity.id,
      },
      include: {
        operator: true,
        busPoints: true,
        instances: {
          where: { date },
        },
      },
    });

    return buses.map((b) => {
      const bookedList: string[] = b.instances[0]
        ? JSON.parse(b.instances[0].bookedSeats)
        : [];
      const totalSeats = 20;
      const seatsLeft = Math.max(1, totalSeats - bookedList.length);

      const boardingPoints = b.busPoints
        .filter((p) => p.type === "BOARDING")
        .map((p) => ({ name: p.name, time: p.time }));
      const droppingPoints = b.busPoints
        .filter((p) => p.type === "DROPPING")
        .map((p) => ({ name: p.name, time: p.time }));

      return {
        id: b.id,
        operatorName: b.operator.name,
        operatorCode: b.operator.code,
        busType: b.type,
        fromCity: fCity.name,
        toCity: tCity.name,
        departTime: b.departTime,
        arriveTime: b.arriveTime,
        baseFare: b.baseFare,
        rating: b.rating,
        seatsLeft,
        boardingPoints,
        droppingPoints,
      };
    });
  }

  async getSeatLayout(busId: string, date: string): Promise<BusSeat[]> {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        instances: {
          where: { date },
        },
      },
    });

    if (!bus) return [];

    const bookedSeats: string[] = bus.instances[0]
      ? JSON.parse(bus.instances[0].bookedSeats)
      : [];

    let layout: {
      lower: Array<{ id: string; row: number; col: number; type: string; ladies: boolean }>;
      upper: Array<{ id: string; row: number; col: number; type: string; ladies: boolean }>;
    } = { lower: [], upper: [] };

    try {
      layout = JSON.parse(bus.layoutJson);
    } catch {
      // Default fallback
    }

    const seats: BusSeat[] = [];

    // Lower deck
    for (const s of layout.lower || []) {
      seats.push({
        id: s.id,
        deck: "LOWER",
        row: s.row,
        col: s.col,
        type: (s.type as "SLEEPER" | "SEATER") || "SLEEPER",
        ladiesOnly: Boolean(s.ladies),
        price: bus.baseFare,
        isBooked: bookedSeats.includes(s.id),
      });
    }

    // Upper deck (slightly cheaper or premium based on operator)
    for (const s of layout.upper || []) {
      seats.push({
        id: s.id,
        deck: "UPPER",
        row: s.row,
        col: s.col,
        type: (s.type as "SLEEPER" | "SEATER") || "SLEEPER",
        ladiesOnly: Boolean(s.ladies),
        price: Math.round(bus.baseFare * 1.05),
        isBooked: bookedSeats.includes(s.id),
      });
    }

    return seats;
  }
}

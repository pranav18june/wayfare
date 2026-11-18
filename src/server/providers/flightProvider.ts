import prisma from "@/lib/db/prisma";
import { FlightQuery, FlightResult, DayFare } from "./types";
import { addDays, subDays, format, parseISO } from "date-fns";

export interface FlightProvider {
  search(q: FlightQuery): Promise<FlightResult[]>;
  getFareCalendar(q: FlightQuery, rangeDays?: number): Promise<DayFare[]>;
}

export class MockFlightProvider implements FlightProvider {
  async search(q: FlightQuery): Promise<FlightResult[]> {
    const { from, to, date, cabin = "ECONOMY" } = q;

    const flights = await prisma.flight.findMany({
      where: {
        fromCode: from.toUpperCase(),
        toCode: to.toUpperCase(),
      },
      include: {
        airline: true,
        instances: {
          where: {
            date: date,
          },
        },
      },
    });

    const results: FlightResult[] = [];

    // Cabin class multiplier
    const cabinMultiplier =
      cabin === "BUSINESS" ? 2.5 : cabin === "PREMIUM_ECONOMY" ? 1.5 : 1.0;

    for (const f of flights) {
      const instance = f.instances[0];
      const seatsLeft = instance ? instance.seatsLeft : 24;
      const priceMultiplier = instance ? instance.priceMultiplier : 1.05;

      const calculatedFare = Math.round(
        f.baseFare * priceMultiplier * cabinMultiplier
      );

      results.push({
        id: f.id,
        flightNumber: f.number,
        airlineCode: f.airline.code,
        airlineName: f.airline.name,
        fromCode: f.fromCode,
        toCode: f.toCode,
        departTime: f.departTime,
        arriveTime: f.arriveTime,
        durationMin: f.durationMin,
        stops: f.stops,
        baseFare: f.baseFare,
        calculatedFare,
        baggage: f.baggage,
        refundable: f.refundable,
        aircraft: f.aircraft,
        seatsLeft,
      });
    }

    // Default sort: lowest price first
    return results.sort((a, b) => a.calculatedFare - b.calculatedFare);
  }

  async getFareCalendar(q: FlightQuery, rangeDays = 3): Promise<DayFare[]> {
    const { from, to, date } = q;
    const baseDate = parseISO(date);
    const result: DayFare[] = [];

    for (let offset = -rangeDays; offset <= rangeDays; offset++) {
      const targetDate = addDays(baseDate, offset);
      const dateStr = format(targetDate, "yyyy-MM-dd");

      const flights = await prisma.flight.findMany({
        where: {
          fromCode: from.toUpperCase(),
          toCode: to.toUpperCase(),
        },
        include: {
          instances: {
            where: { date: dateStr },
          },
        },
      });

      if (flights.length === 0) {
        result.push({
          date: dateStr,
          minFare: 0,
          available: false,
        });
        continue;
      }

      let minFare = Infinity;
      for (const f of flights) {
        const mult = f.instances[0]?.priceMultiplier || 1.0;
        const fare = Math.round(f.baseFare * mult);
        if (fare < minFare) minFare = fare;
      }

      result.push({
        date: dateStr,
        minFare: minFare === Infinity ? 0 : minFare,
        available: minFare !== Infinity,
      });
    }

    return result;
  }
}

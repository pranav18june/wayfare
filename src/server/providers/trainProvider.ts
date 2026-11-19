import prisma from "@/lib/db/prisma";
import {
  TrainQuery,
  TrainResult,
  PNRStatusResult,
  PNRPassengerStatus,
  LiveRunningStatusResult,
  TrainScheduleResult,
  TrainClassAvailability,
  StationLiveStatus,
} from "./types";
import { estimateTrainConfirmationProbability } from "@/lib/domain/availability";
import { format, parseISO } from "date-fns";
import { fetchLiveRailwayStatus } from "./liveTrainTracker";

export interface TrainProvider {
  search(q: TrainQuery): Promise<TrainResult[]>;
  getAvailabilityForDays(
    trainNumber: string,
    startDate: string,
    classCode: string,
    quota?: string,
    days?: number
  ): Promise<{ date: string; status: string; count: number; fare: number }[]>;
  getPNRStatus(pnr: string): Promise<PNRStatusResult | null>;
  getLiveRunningStatus(trainNumber: string, date?: string): Promise<LiveRunningStatusResult | null>;
  getTrainSchedule(trainNumber: string): Promise<TrainScheduleResult | null>;
}

export class MockTrainProvider implements TrainProvider {
  async search(q: TrainQuery): Promise<TrainResult[]> {
    const { fromStation, toStation, date, quota = "GN" } = q;
    const fromCode = fromStation.toUpperCase();
    const toCode = toStation.toUpperCase();

    // Find trains that have both stations where from.seq < to.seq
    const fromStops = await prisma.trainStop.findMany({
      where: { stationCode: fromCode },
      include: {
        train: {
          include: {
            stops: true,
            classFares: {
              where: {
                fromStation: fromCode,
                toStation: toCode,
              },
            },
            availability: {
              where: {
                date: date,
                quota: quota,
              },
            },
          },
        },
      },
    });

    const results: TrainResult[] = [];

    for (const fs of fromStops) {
      const train = fs.train;
      const ts = train.stops.find(
        (s) => s.stationCode === toCode && s.seq > fs.seq
      );

      if (!ts) continue; // Train does not travel from fromCode to toCode

      // Calculate travel duration in minutes
      const depTime = fs.departure || "06:00";
      const arrTime = ts.arrival || "12:00";
      const [dh, dm] = depTime.split(":").map(Number);
      const [ah, am] = arrTime.split(":").map(Number);
      let durMins = (ah * 60 + am) - (dh * 60 + dm);
      if (ts.dayOffset > fs.dayOffset) {
        durMins += (ts.dayOffset - fs.dayOffset) * 1440;
      } else if (durMins < 0) {
        durMins += 1440;
      }

      // Build class availability chips
      const classes: TrainClassAvailability[] = [];

      for (const cf of train.classFares) {
        // Find availability for this class
        const avail = train.availability.find(
          (a) => a.classCode === cf.classCode
        );

        const status = (avail?.status as "AVL" | "RAC" | "WL") || "AVL";
        const count = avail?.count || 42;

        const prob = estimateTrainConfirmationProbability(
          status,
          count,
          7,
          train.type
        );

        classes.push({
          classCode: cf.classCode,
          fare: cf.fare,
          status,
          count,
          probabilityPercent: prob.probabilityPercent,
          probabilityRating: prob.rating,
        });
      }

      results.push({
        trainNumber: train.number,
        trainName: train.name,
        trainType: train.type,
        fromStation: fromCode,
        toStation: toCode,
        departureTime: depTime,
        arrivalTime: arrTime,
        durationMin: durMins,
        runningDays: train.runsOnBitmask,
        classes,
      });
    }

    return results;
  }

  async getAvailabilityForDays(
    trainNumber: string,
    startDate: string,
    classCode: string,
    quota = "GN",
    days = 7
  ): Promise<{ date: string; status: string; count: number; fare: number }[]> {
    const start = parseISO(startDate);
    const dateList: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      dateList.push(format(d, "yyyy-MM-dd"));
    }

    const avails = await prisma.trainAvailability.findMany({
      where: {
        trainNumber,
        classCode,
        quota,
        date: { in: dateList },
      },
    });

    const fareRecord = await prisma.trainClassFare.findFirst({
      where: { trainNumber, classCode },
    });
    const baseFare = fareRecord?.fare || 650;

    return dateList.map((dt) => {
      const found = avails.find((a) => a.date === dt);
      return {
        date: dt,
        status: found?.status || "AVL",
        count: found?.count || 28,
        fare: baseFare,
      };
    });
  }

  async getPNRStatus(pnr: string): Promise<PNRStatusResult | null> {
    const cleanPnr = pnr.replace(/\D/g, "");
    if (cleanPnr.length !== 10) return null;

    // First check user bookings in DB for matching PNR
    const booking = await prisma.booking.findFirst({
      where: { pnr: cleanPnr, mode: "TRAIN" },
      include: {
        passengers: true,
      },
    });

    if (booking && booking.metadataJson) {
      try {
        const meta = JSON.parse(booking.metadataJson);
        const passengers: PNRPassengerStatus[] = booking.passengers.map((p, idx) => ({
          name: p.name,
          bookingStatus: p.ticketStatus === "CNF" ? `CNF / ${meta.coach || "B3"} / ${p.seat || 40 + idx}` : "WL 4",
          currentStatus: p.ticketStatus === "CNF" ? "CNF" : "RAC 2",
          coach: meta.coach || "B3",
          berth: p.seat || String(40 + idx),
          berthType: p.berth || "Lower",
        }));

        return {
          pnr: cleanPnr,
          trainNumber: meta.trainNumber || "12952",
          trainName: meta.trainName || "Mumbai Rajdhani Express",
          date: meta.date || "2026-11-24",
          fromStation: meta.fromStation || "NDLS",
          toStation: meta.toStation || "BCT",
          boardingStation: meta.fromStation || "NDLS",
          reservationClass: meta.classCode || "3A",
          chartPrepared: true,
          passengers,
        };
      } catch {
        // Fallback to synthetic resolution
      }
    }

    // Default seeded/synthetic resolution for any valid 10-digit PNR
    const trainNumber = "12952";
    const train = await prisma.train.findUnique({
      where: { number: trainNumber },
    });

    return {
      pnr: cleanPnr,
      trainNumber: trainNumber,
      trainName: train?.name || "Mumbai Rajdhani Express",
      date: "2026-11-24",
      fromStation: "NDLS",
      toStation: "BCT",
      boardingStation: "NDLS",
      reservationClass: "3A",
      chartPrepared: true,
      passengers: [
        {
          name: "Passenger 1",
          bookingStatus: "WL 14 / GN",
          currentStatus: "CNF",
          coach: "B2",
          berth: "34",
          berthType: "Lower",
        },
        {
          name: "Passenger 2",
          bookingStatus: "WL 15 / GN",
          currentStatus: "CNF",
          coach: "B2",
          berth: "35",
          berthType: "Middle",
        },
      ],
    };
  }

  async getLiveRunningStatus(
    trainNumber: string,
    date?: string
  ): Promise<LiveRunningStatusResult | null> {
    const cleanQuery = trainNumber.trim();

    // 1. Attempt real-time live railway status from NTES / RailRadar
    try {
      const realStatus = await fetchLiveRailwayStatus(cleanQuery, date);
      if (realStatus && realStatus.timeline && realStatus.timeline.length > 0) {
        return realStatus;
      }
    } catch (e) {
      console.warn("[TrainProvider] Live external tracking fallback triggered:", e);
    }

    // 2. Fallback to local DB / deterministic route
    let train = await prisma.train.findFirst({
      where: {
        OR: [
          { number: cleanQuery },
          { name: { contains: cleanQuery } },
        ],
      },
      include: {
        stops: {
          orderBy: { seq: "asc" },
        },
      },
    });

    // If train is not in the seeded DB, generate a realistic dynamic route for any 4-5 digit train
    if (!train || train.stops.length === 0) {
      const numOnly = cleanQuery.replace(/\D/g, "");
      if (numOnly.length >= 4) {
        const fallbackStations = [
          { code: "NDLS", name: "New Delhi", arr: null, dep: "06:15", dist: 0 },
          { code: "CNB", name: "Kanpur Central", arr: "11:20", dep: "11:30", dist: 440 },
          { code: "PRYJ", name: "Prayagraj Junction", arr: "14:05", dep: "14:15", dist: 635 },
          { code: "DDU", name: "Pt. Deen Dayal Upadhyaya", arr: "16:40", dep: "16:50", dist: 788 },
          { code: "PNBE", name: "Patna Junction", arr: "20:30", dep: null, dist: 998 },
        ];
        train = {
          number: numOnly,
          name: `Express Transit #${numOnly}`,
          type: "SUPERFAST",
          runsOnBitmask: 127,
          createdAt: new Date(),
          stops: fallbackStations.map((st, idx) => ({
            id: `fb_${numOnly}_${idx}`,
            trainNumber: numOnly,
            stationCode: st.code,
            seq: idx + 1,
            arrival: st.arr,
            departure: st.dep,
            dayOffset: 0,
            distanceKm: st.dist,
          })),
        } as any;
      } else {
        return null;
      }
    }

    if (!train) return null;

    // Fetch station names
    const stationCodes = train.stops.map((s) => s.stationCode);
    const stations = await prisma.station.findMany({
      where: { code: { in: stationCodes } },
    });
    const stationNameMap = new Map(stations.map((s) => [s.code, s.name]));

    // Deterministic delay simulation based on train number and station index
    const seedVal = parseInt(trainNumber.replace(/\D/g, ""), 10) || 12000;
    const baseDelay = (seedVal % 40) - 10; // -10 to +30 mins delay
    const totalStops = train.stops.length;
    const currentStopIdx = Math.min(
      totalStops - 1,
      Math.max(1, (seedVal % (totalStops - 1)) + 1)
    );

    const timeline: StationLiveStatus[] = [];

    for (let i = 0; i < totalStops; i++) {
      const stop = train.stops[i];
      const name = stationNameMap.get(stop.stationCode) || stop.stationCode;
      const accumDelay = Math.max(0, baseDelay + i * 4);

      let status: "DEPARTED" | "CURRENT" | "UPCOMING" = "UPCOMING";
      if (i < currentStopIdx) status = "DEPARTED";
      else if (i === currentStopIdx) status = "CURRENT";

      // Calculate expected times adding accumDelay
      let expectedArr = stop.arrival;
      if (stop.arrival) {
        const [ah, am] = stop.arrival.split(":").map(Number);
        const expMins = (ah * 60 + am + accumDelay) % 1440;
        const eh = Math.floor(expMins / 60);
        const em = expMins % 60;
        expectedArr = `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
      }

      let expectedDep = stop.departure;
      if (stop.departure) {
        const [dh, dm] = stop.departure.split(":").map(Number);
        const expMins = (dh * 60 + dm + accumDelay) % 1440;
        const eh = Math.floor(expMins / 60);
        const em = expMins % 60;
        expectedDep = `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
      }

      timeline.push({
        stationCode: stop.stationCode,
        stationName: name,
        scheduledArrival: stop.arrival,
        scheduledDeparture: stop.departure,
        expectedArrival: expectedArr,
        expectedDeparture: expectedDep,
        delayMins: accumDelay,
        dayOffset: stop.dayOffset,
        distanceKm: stop.distanceKm,
        haltMins: stop.arrival && stop.departure ? 5 : 0,
        status,
      });
    }

    const currentStation = timeline[currentStopIdx];

    return {
      trainNumber: train.number,
      trainName: train.name,
      runDate: date || format(new Date(), "yyyy-MM-dd"),
      lastUpdated: format(new Date(), "HH:mm 'IST'"),
      currentStationCode: currentStation.stationCode,
      currentStationName: currentStation.stationName,
      overallDelayMins: currentStation.delayMins,
      isDelayed: currentStation.delayMins > 5,
      timeline,
    };
  }

  async getTrainSchedule(trainNumber: string): Promise<TrainScheduleResult | null> {
    const train = await prisma.train.findUnique({
      where: { number: trainNumber },
      include: {
        stops: {
          orderBy: { seq: "asc" },
        },
      },
    });

    if (!train) return null;

    const stationCodes = train.stops.map((s) => s.stationCode);
    const stations = await prisma.station.findMany({
      where: { code: { in: stationCodes } },
    });
    const stationNameMap = new Map(stations.map((s) => [s.code, s.name]));

    return {
      trainNumber: train.number,
      trainName: train.name,
      trainType: train.type,
      runsOnBitmask: train.runsOnBitmask,
      stops: train.stops.map((s) => {
        let haltMins = 0;
        if (s.arrival && s.departure) {
          const [ah, am] = s.arrival.split(":").map(Number);
          const [dh, dm] = s.departure.split(":").map(Number);
          haltMins = (dh * 60 + dm) - (ah * 60 + am);
          if (haltMins < 0) haltMins += 1440;
        }
        return {
          seq: s.seq,
          stationCode: s.stationCode,
          stationName: stationNameMap.get(s.stationCode) || s.stationCode,
          arrival: s.arrival,
          departure: s.departure,
          haltMins,
          distanceKm: s.distanceKm,
          dayOffset: s.dayOffset,
        };
      }),
    };
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession, forbiddenResponse } from "@/server/auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return forbiddenResponse();
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "FLIGHT";
  const search = searchParams.get("search")?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));

  try {
    const [flightCount, trainCount, busCount, hotelCount] = await Promise.all([
      prisma.flight.count(),
      prisma.train.count(),
      prisma.bus.count(),
      prisma.hotel.count(),
    ]);

    let items: any[] = [];
    let total = 0;

    if (mode === "FLIGHT") {
      const where: any = {};
      if (search) {
        where.OR = [
          { number: { contains: search } },
          { fromCode: { contains: search } },
          { toCode: { contains: search } },
          { airline: { name: { contains: search } } },
        ];
      }
      [total, items] = await Promise.all([
        prisma.flight.count({ where }),
        prisma.flight.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            airline: { select: { name: true, code: true } },
          },
        }),
      ]);
    } else if (mode === "TRAIN") {
      const where: any = {};
      if (search) {
        where.OR = [
          { number: { contains: search } },
          { name: { contains: search } },
          { type: { contains: search } },
        ];
      }
      [total, items] = await Promise.all([
        prisma.train.count({ where }),
        prisma.train.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            stops: {
              take: 2,
              orderBy: { seq: "asc" },
            },
            classFares: true,
          },
        }),
      ]);
    } else if (mode === "BUS") {
      const where: any = {};
      if (search) {
        where.OR = [
          { type: { contains: search } },
          { operator: { name: { contains: search } } },
          { fromCity: { name: { contains: search } } },
          { toCity: { name: { contains: search } } },
        ];
      }
      [total, items] = await Promise.all([
        prisma.bus.count({ where }),
        prisma.bus.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            operator: { select: { name: true } },
            fromCity: { select: { name: true } },
            toCity: { select: { name: true } },
          },
        }),
      ]);
    } else if (mode === "HOTEL") {
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { locality: { contains: search } },
          { city: { name: { contains: search } } },
        ];
      }
      [total, items] = await Promise.all([
        prisma.hotel.count({ where }),
        prisma.hotel.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            city: { select: { name: true } },
            rooms: true,
          },
        }),
      ]);
    }

    return NextResponse.json({
      counts: {
        flights: flightCount,
        trains: trainCount,
        buses: busCount,
        hotels: hotelCount,
      },
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    console.error("Admin inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    const defaults = await prisma.station.findMany({
      where: {
        code: { in: ["NDLS", "BCT", "CSMT", "HWH", "SBC", "MAS", "PUNE", "LKO"] },
      },
      take: 8,
    });
    return NextResponse.json(defaults);
  }

  const stations = await prisma.station.findMany({
    where: {
      OR: [
        { code: { contains: q.toUpperCase() } },
        { name: { contains: q } },
        { city: { contains: q } },
      ],
    },
    take: 10,
  });

  return NextResponse.json(stations);
}

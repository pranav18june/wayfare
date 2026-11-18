import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    // Return major top airports by default
    const defaults = await prisma.airport.findMany({
      where: {
        code: { in: ["DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "GOI", "PNQ"] },
      },
      take: 8,
    });
    return NextResponse.json(defaults);
  }

  const airports = await prisma.airport.findMany({
    where: {
      OR: [
        { code: { contains: q.toUpperCase() } },
        { city: { contains: q } },
        { name: { contains: q } },
      ],
    },
    take: 10,
  });

  return NextResponse.json(airports);
}

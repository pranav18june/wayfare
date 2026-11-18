import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    const defaults = await prisma.city.findMany({
      where: {
        name: { in: ["New Delhi", "Mumbai", "Bengaluru", "Goa", "Jaipur", "Pune", "Chennai"] },
      },
      take: 8,
    });
    return NextResponse.json(defaults);
  }

  const cities = await prisma.city.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { state: { contains: q } },
      ],
    },
    take: 10,
  });

  return NextResponse.json(cities);
}

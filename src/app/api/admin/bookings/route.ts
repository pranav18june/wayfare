import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession, forbiddenResponse } from "@/server/auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return forbiddenResponse();
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";
  const mode = searchParams.get("mode")?.trim() || "";

  const whereClause: any = {};

  if (status) {
    whereClause.status = status;
  }
  if (mode) {
    whereClause.mode = mode;
  }
  if (search) {
    whereClause.OR = [
      { id: { contains: search } },
      { pnr: { contains: search } },
      { user: { email: { contains: search } } },
      { user: { name: { contains: search } } },
    ];
  }

  try {
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          passengers: {
            select: { id: true, name: true, seat: true, berth: true },
          },
          payments: {
            select: { id: true, status: true, amount: true, method: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    console.error("Admin bookings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

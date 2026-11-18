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
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20", 10)));
  const search = searchParams.get("search")?.trim() || "";
  const role = searchParams.get("role")?.trim() || "";

  const whereClause: any = {};
  if (role) {
    whereClause.role = role;
  }
  if (search) {
    whereClause.OR = [
      { email: { contains: search } },
      { name: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          walletBalance: true,
          createdAt: true,
          _count: {
            select: {
              bookings: true,
              savedTravellers: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

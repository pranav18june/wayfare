import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession, forbiddenResponse } from "@/server/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalUsers,
      allPayments,
      allBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.user.count(),
      prisma.payment.findMany({
        where: { status: "SUCCESS" },
        select: { amount: true, createdAt: true },
      }),
      prisma.booking.findMany({
        select: {
          id: true,
          mode: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          metadataJson: true,
        },
      }),
    ]);

    const totalRevenue = allPayments.reduce((acc, p) => acc + p.amount, 0);
    const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : "0.0";

    // Mode breakdown
    const modeStats: Record<string, { mode: string; revenue: number; bookings: number }> = {
      FLIGHT: { mode: "Flights", revenue: 0, bookings: 0 },
      TRAIN: { mode: "Trains", revenue: 0, bookings: 0 },
      BUS: { mode: "Buses", revenue: 0, bookings: 0 },
      HOTEL: { mode: "Hotels", revenue: 0, bookings: 0 },
    };

    allBookings.forEach((b) => {
      if (modeStats[b.mode]) {
        modeStats[b.mode].bookings += 1;
        if (b.status === "CONFIRMED" || b.status === "COMPLETED") {
          modeStats[b.mode].revenue += b.totalAmount;
        }
      }
    });

    // 14-day booking trend
    const now = new Date();
    const dayMap = new Map<string, { date: string; bookings: number; revenue: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const display = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
      dayMap.set(key, { date: display, bookings: 0, revenue: 0 });
    }

    allBookings.forEach((b) => {
      const bKey = new Date(b.createdAt).toISOString().split("T")[0];
      if (dayMap.has(bKey)) {
        const item = dayMap.get(bKey)!;
        item.bookings += 1;
        if (b.status === "CONFIRMED" || b.status === "COMPLETED") {
          item.revenue += b.totalAmount;
        }
      }
    });

    const dailyTrends = Array.from(dayMap.values());

    // Top routes
    const routeCounter = new Map<string, { route: string; mode: string; count: number }>();
    allBookings.forEach((b) => {
      let route = "";
      if (b.metadataJson) {
        try {
          const meta = JSON.parse(b.metadataJson);
          if (b.mode === "FLIGHT" && meta.origin && meta.destination) {
            route = `${meta.origin} → ${meta.destination}`;
          } else if (b.mode === "TRAIN" && meta.fromStation && meta.toStation) {
            route = `${meta.fromStation} → ${meta.toStation}`;
          } else if (b.mode === "BUS" && meta.from && meta.to) {
            route = `${meta.from} → ${meta.to}`;
          } else if (b.mode === "HOTEL" && meta.hotelName) {
            route = meta.hotelName;
          }
        } catch {
          // ignore parsing error
        }
      }

      if (!route) {
        route = `${b.mode} Standard Route`;
      }

      const existing = routeCounter.get(route);
      if (existing) {
        existing.count += 1;
      } else {
        routeCounter.set(route, { route, mode: b.mode, count: 1 });
      }
    });

    const topRoutes = Array.from(routeCounter.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        cancellationRate: parseFloat(cancellationRate),
        totalUsers,
      },
      modeBreakdown: Object.values(modeStats),
      dailyTrends,
      topRoutes,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allBookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        passengers: true,
        payments: true,
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const upcoming = allBookings.filter(
      (b) => b.status === "CONFIRMED" || b.status === "PENDING"
    );
    const completed = allBookings.filter((b) => b.status === "COMPLETED");
    const cancelled = allBookings.filter((b) => b.status === "CANCELLED");

    const groupedTrips = await prisma.trip.findMany({
      where: { userId: session.user.id },
      include: {
        bookings: {
          include: {
            passengers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      upcoming,
      completed,
      cancelled,
      groupedTrips,
      totalCount: allBookings.length,
    });
  } catch (err) {
    console.error("Trips fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, bookingIds } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Trip name is required" }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
      },
    });

    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds },
          userId: session.user.id,
        },
        data: {
          tripId: trip.id,
        },
      });
    }

    return NextResponse.json({ success: true, trip });
  } catch (err) {
    console.error("Trip creation error:", err);
    return NextResponse.json({ error: "Failed to create trip group" }, { status: 500 });
  }
}

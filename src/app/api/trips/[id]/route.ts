import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          include: {
            passengers: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Parse metadata and sort bookings chronologically
    const sortedBookings = trip.bookings.map((b) => {
      let meta: any = {};
      try {
        meta = b.metadataJson ? JSON.parse(b.metadataJson) : {};
      } catch {
        // fallback
      }
      return {
        ...b,
        meta,
        sortDate: meta.date || meta.checkIn || b.createdAt.toISOString().slice(0, 10),
      };
    }).sort((a, b) => a.sortDate.localeCompare(b.sortDate));

    return NextResponse.json({
      id: trip.id,
      name: trip.name,
      createdAt: trip.createdAt,
      bookings: sortedBookings,
    });
  } catch (err) {
    console.error("Trip detail fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch trip details" }, { status: 500 });
  }
}

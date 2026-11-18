import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newDate } = await req.json();

    if (!newDate) {
      return NextResponse.json({ error: "New travel date required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (booking.mode !== "FLIGHT" && booking.mode !== "BUS") {
      return NextResponse.json(
        { error: "Date modification is currently only supported on Flight and Bus bookings" },
        { status: 400 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot modify a cancelled booking" }, { status: 400 });
    }

    let meta: any = {};
    try {
      meta = booking.metadataJson ? JSON.parse(booking.metadataJson) : {};
    } catch {
      // fallback
    }

    const oldDate = meta.date || "original date";
    meta.date = newDate;
    meta.modifiedAt = new Date().toISOString();

    // Nominal rescheduling fee difference (e.g. ₹350)
    const fareDifference = 350;

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        metadataJson: JSON.stringify(meta),
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "BOOKING",
        title: `Journey Date Rescheduled: ${booking.pnr || booking.id}`,
        body: `Travel date successfully modified from ${oldDate} to ${newDate}. Rescheduling fee: ₹${fareDifference}.`,
      },
    });

    return NextResponse.json({
      success: true,
      oldDate,
      newDate,
      fareDifference,
    });
  } catch (err) {
    console.error("Modify booking error:", err);
    return NextResponse.json({ error: "Failed to modify booking" }, { status: 500 });
  }
}

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
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Resolve booking to CONFIRMED
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    });

    await prisma.payment.updateMany({
      where: { bookingId: booking.id, status: "PENDING" },
      data: { status: "SUCCESS" },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error("Resolve booking error:", err);
    return NextResponse.json({ error: "Failed to resolve booking" }, { status: 500 });
  }
}

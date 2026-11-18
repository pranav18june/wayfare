import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";
import { calculateRefund } from "@/lib/domain/refunds";
import { TravelMode } from "@/lib/domain/types";
import { parseISO } from "date-fns";

export async function GET(
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
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    let meta: any = {};
    try {
      meta = booking.metadataJson ? JSON.parse(booking.metadataJson) : {};
    } catch {
      // fallback
    }

    // Determine scheduled departure timestamp
    let scheduledDate = new Date(Date.now() + 96 * 3600 * 1000); // Default future
    if (meta.date) {
      scheduledDate = parseISO(meta.date);
    } else if (meta.checkIn) {
      scheduledDate = parseISO(meta.checkIn);
    }

    const refundRes = calculateRefund({
      bookingId: booking.id,
      mode: booking.mode as TravelMode,
      totalPaid: booking.totalAmount,
      scheduledDeparture: scheduledDate,
      hotelFreeCancellationCutoffHours: 24,
    });

    if (!refundRes.ok) {
      return NextResponse.json({ error: refundRes.error }, { status: 400 });
    }

    return NextResponse.json(refundRes.value);
  } catch (err) {
    console.error("Refund preview error:", err);
    return NextResponse.json({ error: "Failed to preview refund" }, { status: 500 });
  }
}

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
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    let meta: any = {};
    try {
      meta = booking.metadataJson ? JSON.parse(booking.metadataJson) : {};
    } catch {
      // fallback
    }

    let scheduledDate = new Date(Date.now() + 96 * 3600 * 1000);
    if (meta.date) {
      scheduledDate = parseISO(meta.date);
    } else if (meta.checkIn) {
      scheduledDate = parseISO(meta.checkIn);
    }

    const refundRes = calculateRefund({
      bookingId: booking.id,
      mode: booking.mode as TravelMode,
      totalPaid: booking.totalAmount,
      scheduledDeparture: scheduledDate,
      hotelFreeCancellationCutoffHours: 24,
    });

    if (!refundRes.ok) {
      return NextResponse.json({ error: refundRes.error }, { status: 400 });
    }

    const refundData = refundRes.value;

    // Transactional cancellation and wallet credit
    await prisma.$transaction(async (tx) => {
      // 1. Update Booking
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      // 2. Create Refund Record
      await tx.refund.create({
        data: {
          bookingId: booking.id,
          amount: refundData.refundableAmount,
          destination: "WALLET",
          status: "COMPLETED",
          computedFromPolicy: refundData.policyApplied,
        },
      });

      // 3. Credit User Wallet
      if (refundData.refundableAmount > 0) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            walletBalance: { increment: refundData.refundableAmount },
          },
        });

        // 4. Record Wallet Transaction
        await tx.walletTransaction.create({
          data: {
            userId: session.user.id,
            type: "REFUND",
            amount: refundData.refundableAmount,
            ref: `Refund for cancelled booking ${booking.pnr || booking.id}`,
          },
        });
      }

      // 5. Create Notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: "WALLET",
          title: `Booking Cancelled: ${booking.pnr || booking.id}`,
          body: `Refund of ₹${refundData.refundableAmount.toLocaleString("en-IN")} credited to your Wayfare Wallet. Policy: ${refundData.policyApplied}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      refund: refundData,
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}

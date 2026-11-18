import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";
import { calculateFare } from "@/lib/domain/pricing";
import { TravelMode } from "@/lib/domain/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      sessionId,
      paymentMethod,
      scenario = "success", // "success" | "failure" | "pending"
      passengers,
      promoCode,
      addOns,
    } = await req.json();

    const checkoutSession = await prisma.checkoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!checkoutSession) {
      return NextResponse.json({ error: "Invalid checkout session" }, { status: 404 });
    }

    if (checkoutSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized session access" }, { status: 403 });
    }

    // Check expiration (Section 8.6)
    if (checkoutSession.expiresAt < new Date() || checkoutSession.status === "EXPIRED") {
      return NextResponse.json(
        { error: "Fare lock expired. Please refresh prices to continue." },
        { status: 410 }
      );
    }

    // Check double-submit idempotency
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        metadataJson: { contains: checkoutSession.id },
      },
    });

    if (existingBooking) {
      return NextResponse.json({
        success: true,
        bookingId: existingBooking.id,
        pnr: existingBooking.pnr,
        status: existingBooking.status,
      });
    }

    const payload = JSON.parse(checkoutSession.payloadJson);
    const mode = checkoutSession.mode as TravelMode;

    // Bus concurrency check (Section 8.10: two users selecting same seat)
    if (mode === "BUS" && payload.busId && payload.date && payload.seats) {
      const busInstance = await prisma.busInstance.findUnique({
        where: { busId_date: { busId: payload.busId, date: payload.date } },
      });
      if (busInstance) {
        const currentlyBooked: string[] = JSON.parse(busInstance.bookedSeats || "[]");
        const overlap = payload.seats.some((s: string) => currentlyBooked.includes(s));
        if (overlap) {
          return NextResponse.json(
            { error: "Seat just taken, pick another. Please select different seats." },
            { status: 409 }
          );
        }
      }
    }

    // Server-side recomputation of total (Never trust client prices!)
    let rawBase = 0;
    if (mode === "FLIGHT" && payload.flights) {
      rawBase = payload.flights.reduce(
        (sum: number, f: any) => sum + f.calculatedFare,
        0
      );
    } else if (mode === "TRAIN") {
      rawBase = payload.fare || 1450;
    } else if (mode === "BUS") {
      rawBase = payload.totalFare || 850;
    } else if (mode === "HOTEL") {
      rawBase = payload.totalPrice || 3200;
    }

    let promoRecord = null;
    if (promoCode) {
      promoRecord = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase().trim() },
      });
    }

    const passengerCount = (passengers && passengers.length > 0) ? passengers.length : 1;
    const recalculatedFare = calculateFare({
      mode,
      baseFare: rawBase / passengerCount,
      passengerCount: mode === "HOTEL" ? 1 : passengerCount,
      promoCode: promoRecord
        ? {
            code: promoRecord.code,
            type: promoRecord.type as "PERCENTAGE" | "FLAT",
            value: promoRecord.value,
            minAmount: promoRecord.minAmount,
            maxDiscount: promoRecord.maxDiscount,
            modes: JSON.parse(promoRecord.modes),
            validTo: promoRecord.validTo,
          }
        : null,
      addOns,
    });

    if (!recalculatedFare.ok) {
      return NextResponse.json({ error: recalculatedFare.error }, { status: 400 });
    }

    const finalAmount = recalculatedFare.value.total;

    // Wallet balance verification if WALLET chosen
    if (paymentMethod === "WALLET") {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user || user.walletBalance < finalAmount) {
        return NextResponse.json(
          { error: "Insufficient wallet balance. Please select another payment method." },
          { status: 400 }
        );
      }
    }

    // Handle Payment Scenario: FAILURE (Section 8.7)
    if (scenario === "failure") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment declined by issuing bank (Simulated Test Gateway Failure). Please retry with another method.",
          allowRetry: true,
        },
        { status: 402 }
      );
    }

    // Generate deterministic 10-digit PNR for Flight / Train
    const pnrDigits = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const bookingStatus = scenario === "pending" ? "PENDING" : "CONFIRMED";
    const paymentStatus = scenario === "pending" ? "PENDING" : "SUCCESS";

    // Deduct wallet if paid via WALLET and confirmed
    if (paymentMethod === "WALLET" && scenario !== "failure") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: { decrement: finalAmount },
        },
      });
      await prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: "DEBIT",
          amount: finalAmount,
          ref: `Booking payment for ${mode}`,
        },
      });
    }

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        mode,
        status: bookingStatus,
        pnr: pnrDigits,
        totalAmount: finalAmount,
        taxes: recalculatedFare.value.taxes,
        fees: recalculatedFare.value.convenienceFee,
        discount: recalculatedFare.value.discount,
        promoCode: recalculatedFare.value.promoCode || null,
        metadataJson: JSON.stringify({
          ...payload,
          checkoutSessionId: checkoutSession.id,
        }),
      },
    });

    // Create Passengers
    const passengerData = (passengers && passengers.length > 0)
      ? passengers
      : [
          {
            name: session.user.name || "Primary Passenger",
            age: 30,
            gender: "M",
            seat: "12A",
            berth: "Lower",
          },
        ];

    for (const p of passengerData) {
      await prisma.bookingPassenger.create({
        data: {
          bookingId: booking.id,
          name: p.name,
          age: p.age ? parseInt(p.age, 10) : null,
          gender: p.gender || null,
          seat: p.seat || "Confirmed",
          berth: p.berth || null,
          ticketStatus: "CNF",
        },
      });
    }

    // Record Payment
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        method: paymentMethod || "UPI",
        status: paymentStatus,
        gatewayRef: `GW_WF_${Date.now()}`,
        amount: finalAmount,
        scenario,
      },
    });

    // Update Bus Instance booked seats
    if (mode === "BUS" && payload.busId && payload.date && payload.seats) {
      const busInst = await prisma.busInstance.findUnique({
        where: { busId_date: { busId: payload.busId, date: payload.date } },
      });
      if (busInst) {
        const currentlyBooked: string[] = JSON.parse(busInst.bookedSeats || "[]");
        const updated = Array.from(new Set([...currentlyBooked, ...payload.seats]));
        await prisma.busInstance.update({
          where: { id: busInst.id },
          data: { bookedSeats: JSON.stringify(updated) },
        });
      }
    }

    // Increment promo usage
    if (recalculatedFare.value.promoCode) {
      await prisma.promoCode.update({
        where: { code: recalculatedFare.value.promoCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "BOOKING",
        title: `Booking Confirmed: ${mode} (${pnrDigits})`,
        body: `Your ${mode.toLowerCase()} booking is confirmed. Total paid: ₹${finalAmount.toLocaleString(
          "en-IN"
        )}.`,
      },
    });

    // Mark checkout session as completed
    await prisma.checkoutSession.update({
      where: { id: checkoutSession.id },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      pnr: pnrDigits,
      status: bookingStatus,
    });
  } catch (err) {
    console.error("Payment error:", err);
    return NextResponse.json(
      { error: "Failed to process payment. Please retry." },
      { status: 500 }
    );
  }
}

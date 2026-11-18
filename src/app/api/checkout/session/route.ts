import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";
import { calculateFare } from "@/lib/domain/pricing";
import { TravelMode } from "@/lib/domain/types";
import { addMinutes } from "date-fns";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required to book" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const mode = (body.mode || "FLIGHT") as TravelMode;
    const passengerCount = body.passengerCount || 1;

    // Calculate server-authoritative base fare and price snapshot
    let baseFare = 0;
    if (mode === "FLIGHT" && body.flights) {
      baseFare = body.flights.reduce(
        (acc: number, f: { calculatedFare: number }) => acc + f.calculatedFare,
        0
      );
    } else if (mode === "TRAIN") {
      baseFare = body.fare || 1450;
    } else if (mode === "BUS") {
      baseFare = body.totalFare || 850;
    } else if (mode === "HOTEL") {
      baseFare = body.totalPrice || 3200;
    }

    const fareRes = calculateFare({
      mode,
      baseFare,
      passengerCount: mode === "HOTEL" ? 1 : passengerCount,
    });

    if (!fareRes.ok) {
      return NextResponse.json({ error: fareRes.error }, { status: 400 });
    }

    // 10-minute lock countdown
    const expiresAt = addMinutes(new Date(), 10);
    const idempotencyKey = crypto.randomUUID();

    const checkoutSession = await prisma.checkoutSession.create({
      data: {
        userId: session.user.id,
        mode,
        payloadJson: JSON.stringify(body),
        priceSnapshot: JSON.stringify(fareRes.value),
        expiresAt,
        status: "ACTIVE",
        idempotencyKey,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      expiresAt: checkoutSession.expiresAt,
      priceSnapshot: fareRes.value,
    });
  } catch (err) {
    console.error("Create checkout session error:", err);
    return NextResponse.json(
      { error: "Failed to initialize checkout session" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  const checkoutSession = await prisma.checkoutSession.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          savedTravellers: true,
        },
      },
    },
  });

  if (!checkoutSession) {
    return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
  }

  if (checkoutSession.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized session access" }, { status: 403 });
  }

  const now = new Date();
  const isExpired = checkoutSession.expiresAt < now || checkoutSession.status === "EXPIRED";
  const secondsRemaining = Math.max(
    0,
    Math.round((checkoutSession.expiresAt.getTime() - now.getTime()) / 1000)
  );

  return NextResponse.json({
    id: checkoutSession.id,
    mode: checkoutSession.mode,
    payload: JSON.parse(checkoutSession.payloadJson),
    priceSnapshot: JSON.parse(checkoutSession.priceSnapshot),
    expiresAt: checkoutSession.expiresAt,
    isExpired,
    secondsRemaining,
    savedTravellers: checkoutSession.user.savedTravellers,
    walletBalance: checkoutSession.user.walletBalance,
  });
}

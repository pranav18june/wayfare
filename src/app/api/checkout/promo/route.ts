import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { calculateFare } from "@/lib/domain/pricing";
import { TravelMode } from "@/lib/domain/types";

export async function POST(req: NextRequest) {
  try {
    const { code, mode, baseFare, passengerCount = 1 } = await req.json();

    if (!code || !baseFare) {
      return NextResponse.json({ error: "Missing promo code or fare" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    const now = new Date();
    if (promo.validTo < now || promo.validFrom > now) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 400 });
    }

    let allowedModes: string[] = [];
    try {
      allowedModes = JSON.parse(promo.modes);
    } catch {
      allowedModes = [promo.modes];
    }

    if (allowedModes.length > 0 && !allowedModes.includes(mode)) {
      return NextResponse.json(
        { error: `Code ${cleanCode} is only applicable for ${allowedModes.join(", ")} bookings` },
        { status: 400 }
      );
    }

    if (baseFare < promo.minAmount) {
      return NextResponse.json(
        { error: `Minimum booking amount of ₹${promo.minAmount} required for this code` },
        { status: 400 }
      );
    }

    const fareRes = calculateFare({
      mode: mode as TravelMode,
      baseFare: baseFare / passengerCount,
      passengerCount,
      promoCode: {
        code: promo.code,
        type: promo.type as "PERCENTAGE" | "FLAT",
        value: promo.value,
        minAmount: promo.minAmount,
        maxDiscount: promo.maxDiscount,
        modes: allowedModes,
        validTo: promo.validTo,
      },
    });

    if (!fareRes.ok) {
      return NextResponse.json({ error: fareRes.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      promoCode: promo.code,
      discount: fareRes.value.discount,
      updatedFare: fareRes.value,
    });
  } catch (err) {
    console.error("Promo validation error:", err);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}

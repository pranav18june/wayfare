import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession, forbiddenResponse } from "@/server/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { validTo: "desc" },
    });

    return NextResponse.json({ promos });
  } catch (error) {
    console.error("Admin promos fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const body = await req.json();
    const {
      code,
      type,
      value,
      minAmount,
      maxDiscount,
      modes,
      validFrom,
      validTo,
      usageLimit,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Code, discount type, and discount value are required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Promo code ${cleanCode} already exists` },
        { status: 409 }
      );
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        type: type === "FLAT" ? "FLAT" : "PERCENTAGE",
        value: Number(value),
        minAmount: Number(minAmount) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        modes: JSON.stringify(Array.isArray(modes) && modes.length > 0 ? modes : ["FLIGHT", "TRAIN", "BUS", "HOTEL"]),
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validTo: validTo ? new Date(validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: usageLimit ? Number(usageLimit) : null,
      },
    });

    return NextResponse.json({ success: true, promo }, { status: 201 });
  } catch (error) {
    console.error("Admin promo creation error:", error);
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}

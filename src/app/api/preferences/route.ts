export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ preferences: null });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { preferences: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ preferences: user.preferences });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const {
      preferredClass,
      preferredSeatType,
      preferredBerthType,
      preferredBusType,
      mealPreference,
      budgetMin,
      budgetMax,
      preferredDepartTime,
      homeCity,
      homeAirport,
      homeStation,
    } = body;

    const updated = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        preferredClass: preferredClass || null,
        preferredSeatType: preferredSeatType || null,
        preferredBerthType: preferredBerthType || null,
        preferredBusType: preferredBusType || null,
        mealPreference: mealPreference || null,
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        preferredDepartTime: preferredDepartTime || null,
        homeCity: homeCity || null,
        homeAirport: homeAirport || null,
        homeStation: homeStation || null,
      },
      update: {
        preferredClass: preferredClass || null,
        preferredSeatType: preferredSeatType || null,
        preferredBerthType: preferredBerthType || null,
        preferredBusType: preferredBusType || null,
        mealPreference: mealPreference || null,
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        preferredDepartTime: preferredDepartTime || null,
        homeCity: homeCity || null,
        homeAirport: homeAirport || null,
        homeStation: homeStation || null,
      },
    });

    return NextResponse.json({ success: true, preferences: updated });
  } catch (err: any) {
    console.error("Error saving preferences:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}

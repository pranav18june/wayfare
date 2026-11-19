export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";

interface BookingMetadata {
  departDate?: string;
  departTime?: string;
  checkIn?: string;
  from?: string;
  to?: string;
  fromCode?: string;
  toCode?: string;
  trainNumber?: string;
  flightNumber?: string;
  busRoute?: string;
  hotelName?: string;
  passengers?: number;
  pnr?: string;
}

interface LiveBooking {
  id: string;
  mode: string;
  pnr: string | null;
  route: string;
  departDate: string;
  departTime: string;
  passengers: number;
  trainNumber?: string;
  totalAmount: number;
}

function parseMetadata(raw: string | null): BookingMetadata {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as BookingMetadata;
  } catch {
    return {};
  }
}

function getRouteLabel(mode: string, meta: BookingMetadata): string {
  if (mode === "HOTEL") {
    return meta.hotelName ?? "Hotel";
  }
  const from = meta.fromCode ?? meta.from ?? "?";
  const to = meta.toCode ?? meta.to ?? "?";
  return `${from} → ${to}`;
}

function getDepartDate(mode: string, meta: BookingMetadata): string {
  if (mode === "HOTEL") return meta.checkIn ?? "";
  return meta.departDate ?? "";
}

export async function GET() {
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

  // today and tomorrow in YYYY-MM-DD (local India time)
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: "CONFIRMED",
    },
    include: {
      passengers: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const liveBookings: LiveBooking[] = [];

  for (const b of bookings) {
    const meta = parseMetadata(b.metadataJson ?? null);
    const departDate = getDepartDate(b.mode, meta);

    if (departDate !== todayStr && departDate !== tomorrowStr) continue;

    liveBookings.push({
      id: b.id,
      mode: b.mode,
      pnr: b.pnr ?? null,
      route: getRouteLabel(b.mode, meta),
      departDate,
      departTime: b.mode === "HOTEL" ? "14:00" : (meta.departTime ?? "00:00"),
      passengers: b.passengers.length || (meta.passengers ?? 1),
      trainNumber: meta.trainNumber,
      totalAmount: b.totalAmount,
    });
  }

  return NextResponse.json({ bookings: liveBookings });
}

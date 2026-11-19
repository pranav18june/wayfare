export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { mode, searchParams, selectedItem, pricePerHead, maxMembers } = body;

    if (!mode || !selectedItem || !pricePerHead) {
      return NextResponse.json(
        { error: "Missing required booking details" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(6).toString("hex"); // readable unique 12-char token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48-hour coordination window

    const groupSession = await prisma.groupSession.create({
      data: {
        token,
        creatorId: user.id,
        mode: mode.toUpperCase(),
        searchParams: JSON.stringify(searchParams || {}),
        selectedItem: JSON.stringify(selectedItem || {}),
        pricePerHead: Number(pricePerHead),
        maxMembers: Number(maxMembers) || 6,
        status: "OPEN",
        expiresAt,
        members: {
          create: {
            userId: user.id,
            name: user.name || "Organizer",
            email: user.email,
            passengersJson: JSON.stringify([
              {
                name: user.name || "Organizer",
                age: 28,
                gender: "M",
              },
            ]),
            paymentStatus: "PENDING",
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json({
      success: true,
      token: groupSession.token,
      sessionId: groupSession.id,
      inviteUrl: `/group/${groupSession.token}`,
    });
  } catch (err: any) {
    console.error("Error creating group session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create group session" },
      { status: 500 }
    );
  }
}

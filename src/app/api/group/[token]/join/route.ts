export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await req.json();
    const { name, email, passengers } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const group = await prisma.groupSession.findUnique({
      where: { token },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.status !== "OPEN") {
      return NextResponse.json(
        { error: `Group is ${group.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (group.members.length >= group.maxMembers) {
      return NextResponse.json(
        { error: "Group has reached maximum passenger capacity" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (user) userId = user.id;
    }

    // Check if already joined with this email
    const existing = group.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );

    let member;
    const passList =
      Array.isArray(passengers) && passengers.length > 0
        ? passengers
        : [{ name, age: 28, gender: "M" }];

    if (existing) {
      member = await prisma.groupMember.update({
        where: { id: existing.id },
        data: {
          name,
          passengersJson: JSON.stringify(passList),
          userId: userId || existing.userId,
        },
      });
    } else {
      member = await prisma.groupMember.create({
        data: {
          sessionId: group.id,
          userId,
          name,
          email,
          passengersJson: JSON.stringify(passList),
          paymentStatus: "PENDING",
        },
      });
    }

    return NextResponse.json({ success: true, member });
  } catch (err: any) {
    console.error("Error joining group:", err);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}

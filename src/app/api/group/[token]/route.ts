export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const session = await getServerSession(authOptions);

    const group = await prisma.groupSession.findUnique({
      where: { token },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        members: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            passengersJson: true,
            paymentStatus: true,
            joinedAt: true,
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group session not found" }, { status: 404 });
    }

    // Check expiration
    if (new Date() > new Date(group.expiresAt) && group.status === "OPEN") {
      await prisma.groupSession.update({
        where: { id: group.id },
        data: { status: "EXPIRED" },
      });
      group.status = "EXPIRED";
    }

    let isCreator = false;
    let currentUserMember = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (user) {
        isCreator = group.creatorId === user.id;
        currentUserMember = group.members.find((m) => m.userId === user.id) || null;
      }
    }

    return NextResponse.json({
      group: {
        id: group.id,
        token: group.token,
        mode: group.mode,
        searchParams: JSON.parse(group.searchParams || "{}"),
        selectedItem: JSON.parse(group.selectedItem || "{}"),
        pricePerHead: group.pricePerHead,
        maxMembers: group.maxMembers,
        status: group.status,
        expiresAt: group.expiresAt,
        createdAt: group.createdAt,
        creator: group.creator,
        members: group.members.map((m) => ({
          ...m,
          passengers: JSON.parse(m.passengersJson || "[]"),
        })),
        isCreator,
        currentUserMember,
      },
    });
  } catch (err: any) {
    console.error("Error fetching group session:", err);
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}

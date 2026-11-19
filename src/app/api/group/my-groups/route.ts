export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function GET() {
  try {
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

    const groups = await prisma.groupSession.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, paymentStatus: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedGroups = groups.map((g) => ({
      id: g.id,
      token: g.token,
      mode: g.mode,
      pricePerHead: g.pricePerHead,
      maxMembers: g.maxMembers,
      status: g.status,
      expiresAt: g.expiresAt,
      createdAt: g.createdAt,
      creator: g.creator,
      isCreator: g.creatorId === user.id,
      memberCount: g.members.length,
      members: g.members,
      searchParams: JSON.parse(g.searchParams || "{}"),
      selectedItem: JSON.parse(g.selectedItem || "{}"),
    }));

    return NextResponse.json({ groups: parsedGroups });
  } catch (err: any) {
    console.error("Error fetching my groups:", err);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

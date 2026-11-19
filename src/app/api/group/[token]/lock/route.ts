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

    const group = await prisma.groupSession.findUnique({
      where: { token },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId !== user.id) {
      return NextResponse.json(
        { error: "Only the group organizer can lock this session" },
        { status: 403 }
      );
    }

    const updated = await prisma.groupSession.update({
      where: { id: group.id },
      data: { status: "LOCKED" },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (err: any) {
    console.error("Error locking group:", err);
    return NextResponse.json({ error: "Failed to lock group" }, { status: 500 });
  }
}

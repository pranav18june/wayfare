import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession, forbiddenResponse } from "@/server/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const body = await req.json();
    const { role } = body;

    if (role !== "TRAVELLER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Role must be TRAVELLER or ADMIN" }, { status: 400 });
    }

    // Safety: prevent admin from demoting themselves
    if (params.id === session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot revoke your own admin access" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Admin user role update error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}

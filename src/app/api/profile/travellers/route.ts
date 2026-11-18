import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const travellerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  berthPreference: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const travellers = await prisma.savedTraveller.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(travellers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = travellerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const created = await prisma.savedTraveller.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        dob: parsed.data.dob ? new Date(parsed.data.dob) : null,
        gender: parsed.data.gender || null,
        idType: parsed.data.idType || null,
        idNumber: parsed.data.idNumber || null,
        berthPreference: parsed.data.berthPreference || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Save traveller error:", err);
    return NextResponse.json({ error: "Failed to save traveller" }, { status: 500 });
  }
}

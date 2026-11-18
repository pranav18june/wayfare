import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession, forbiddenResponse } from "@/server/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const code = decodeURIComponent(params.code).toUpperCase();
    await prisma.promoCode.delete({
      where: { code },
    });

    return NextResponse.json({ success: true, message: `Promo code ${code} deleted` });
  } catch (error) {
    console.error("Admin promo deletion error:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}

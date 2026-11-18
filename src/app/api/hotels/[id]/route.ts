import { NextRequest, NextResponse } from "next/server";
import { hotelProvider } from "@/server/providers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;
    const { searchParams } = new URL(req.url);
    const checkIn = searchParams.get("checkIn") || undefined;
    const checkOut = searchParams.get("checkOut") || undefined;

    const detail = await hotelProvider.getDetail(hotelId, checkIn, checkOut);
    if (!detail) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (err) {
    console.error("Hotel detail error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve hotel detail" },
      { status: 500 }
    );
  }
}

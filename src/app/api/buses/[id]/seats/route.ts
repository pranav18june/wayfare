import { NextRequest, NextResponse } from "next/server";
import { busProvider } from "@/server/providers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const busId = params.id;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const seats = await busProvider.getSeatLayout(busId, date);
    return NextResponse.json(seats);
  } catch (err) {
    console.error("Bus seat layout error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve bus seat layout" },
      { status: 500 }
    );
  }
}

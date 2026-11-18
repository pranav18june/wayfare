import { NextRequest, NextResponse } from "next/server";
import { flightProvider } from "@/server/providers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || "DEL";
    const to = searchParams.get("to") || "BOM";
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const calendar = await flightProvider.getFareCalendar({ from, to, date }, 3);
    return NextResponse.json(calendar);
  } catch (err) {
    console.error("Flight calendar API error:", err);
    return NextResponse.json({ error: "Failed to fetch fare calendar" }, { status: 500 });
  }
}

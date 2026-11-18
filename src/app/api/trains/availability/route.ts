export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { trainProvider } from "@/server/providers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trainNumber = searchParams.get("train") || "";
    const startDate = searchParams.get("date") || "";
    const classCode = searchParams.get("class") || "3A";
    const quota = searchParams.get("quota") || "GN";
    const days = parseInt(searchParams.get("days") || "7", 10);

    if (!trainNumber || !startDate) {
      return NextResponse.json(
        { error: "Missing required parameters: train and date" },
        { status: 400 }
      );
    }

    const avails = await trainProvider.getAvailabilityForDays(
      trainNumber,
      startDate,
      classCode,
      quota,
      days
    );

    return NextResponse.json(avails);
  } catch (err) {
    console.error("Train availability error:", err);
    return NextResponse.json(
      { error: "Failed to fetch class availability expansion" },
      { status: 500 }
    );
  }
}

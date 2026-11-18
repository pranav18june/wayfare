export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { trainProvider } from "@/server/providers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const train = (searchParams.get("train") || "").trim();
    const date = searchParams.get("date") || undefined;

    if (!train) {
      return NextResponse.json(
        { error: "Train number or code required" },
        { status: 400 }
      );
    }

    const runningStatus = await trainProvider.getLiveRunningStatus(train, date);
    if (!runningStatus) {
      return NextResponse.json(
        { error: `No live schedule data available for train ${train}` },
        { status: 404 }
      );
    }

    return NextResponse.json(runningStatus);
  } catch (err) {
    console.error("Running status error:", err);
    return NextResponse.json(
      { error: "Failed to fetch live running status" },
      { status: 500 }
    );
  }
}

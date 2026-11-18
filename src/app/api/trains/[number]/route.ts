import { NextRequest, NextResponse } from "next/server";
import { trainProvider } from "@/server/providers";

export async function GET(
  req: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const trainNumber = params.number;
    const schedule = await trainProvider.getTrainSchedule(trainNumber);

    if (!schedule) {
      return NextResponse.json(
        { error: `Train ${trainNumber} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (err) {
    console.error("Train schedule error:", err);
    return NextResponse.json(
      { error: "Failed to fetch train schedule" },
      { status: 500 }
    );
  }
}

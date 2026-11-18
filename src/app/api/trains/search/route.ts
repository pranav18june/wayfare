export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { trainProvider } from "@/server/providers";
import { z } from "zod";

const trainSearchSchema = z.object({
  from: z.string().min(2),
  to: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  class: z.string().optional(),
  quota: z.string().default("GN"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const date = searchParams.get("date") || "";
    const classCode = searchParams.get("class") || "ALL";
    const quota = searchParams.get("quota") || "GN";

    const parsed = trainSearchSchema.safeParse({ from, to, date, class: classCode, quota });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const results = await trainProvider.search({
      fromStation: from,
      toStation: to,
      date,
      classCode,
      quota,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Train search error:", error);
    return NextResponse.json(
      { error: "Failed to search trains" },
      { status: 500 }
    );
  }
}

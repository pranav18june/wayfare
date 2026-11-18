export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { busProvider } from "@/server/providers";
import { z } from "zod";

const busQuerySchema = z.object({
  from: z.string().min(2),
  to: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const date = searchParams.get("date") || "";

    const parsed = busQuerySchema.safeParse({ from, to, date });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const results = await busProvider.search({
      fromCity: from,
      toCity: to,
      date,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Bus search error:", error);
    return NextResponse.json(
      { error: "Failed to search buses" },
      { status: 500 }
    );
  }
}

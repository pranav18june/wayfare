export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { flightProvider } from "@/server/providers";
import { z } from "zod";

const flightQuerySchema = z.object({
  from: z.string().min(2),
  to: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().optional(),
  adults: z.coerce.number().default(1),
  children: z.coerce.number().default(0),
  infants: z.coerce.number().default(0),
  cabin: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"]).default("ECONOMY"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = flightQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const results = await flightProvider.search(parsed.data);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Flight search API error:", error);
    return NextResponse.json(
      { error: "Failed to search flights" },
      { status: 500 }
    );
  }
}

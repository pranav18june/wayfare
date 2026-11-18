import { NextRequest, NextResponse } from "next/server";
import { hotelProvider } from "@/server/providers";
import { z } from "zod";

const hotelQuerySchema = z.object({
  city: z.string().min(2),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().default(2),
  rooms: z.coerce.number().default(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = hotelQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const results = await hotelProvider.search(parsed.data);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Hotel search error:", err);
    return NextResponse.json(
      { error: "Failed to search hotels" },
      { status: 500 }
    );
  }
}

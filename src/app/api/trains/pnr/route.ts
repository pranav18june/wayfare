export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { trainProvider } from "@/server/providers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pnr = (searchParams.get("pnr") || "").replace(/\D/g, "");

    if (pnr.length !== 10) {
      return NextResponse.json(
        { error: "Invalid PNR format. Must be a 10-digit number." },
        { status: 400 }
      );
    }

    const result = await trainProvider.getPNRStatus(pnr);
    if (!result) {
      return NextResponse.json(
        { error: `No reservation record found for PNR: ${pnr}` },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("PNR status error:", err);
    return NextResponse.json(
      { error: "Failed to resolve PNR status" },
      { status: 500 }
    );
  }
}

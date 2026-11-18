import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateTicketPdf, TicketData } from "@/lib/pdf/ticketGenerator";

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: {
        passengers: true,
        payments: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let meta: any = {};
    try {
      meta = booking.metadataJson ? JSON.parse(booking.metadataJson) : {};
    } catch {
      // fallback
    }

    const successfulPayment = booking.payments.find((p) => p.status === "SUCCESS") || booking.payments[0];

    const ticketData: TicketData = {
      bookingId: booking.id,
      pnr: booking.pnr || booking.id.slice(0, 10).toUpperCase(),
      mode: booking.mode,
      status: booking.status,
      createdAt: booking.createdAt.toISOString().slice(0, 10),
      routeTitle: `${meta.origin || meta.fromStation || meta.from || meta.city || "Origin"} to ${meta.destination || meta.toStation || meta.to || meta.hotelName || "Destination"}`,
      serviceNumber: meta.flightNumber || meta.trainNumber || meta.busType || "WF-STANDARD",
      serviceName: meta.airline || meta.trainName || meta.operator || meta.hotelName || "Wayfare Travel Service",
      travelDate: meta.date || meta.checkIn || booking.createdAt.toISOString().slice(0, 10),
      departureTime: meta.departTime || "06:00",
      arrivalTime: meta.arriveTime || "12:00",
      fromStationOrCity: meta.origin || meta.fromStation || meta.from || meta.city || "City A",
      toStationOrCity: meta.destination || meta.toStation || meta.to || meta.hotelName || "City B",
      passengers: booking.passengers.map((p) => ({
        name: p.name,
        age: p.age,
        gender: p.gender,
        seat: p.seat,
        berth: p.berth,
        status: p.ticketStatus || "CNF",
      })),
      fare: {
        base: booking.totalAmount - booking.taxes - booking.fees + booking.discount,
        taxes: booking.taxes,
        fees: booking.fees,
        discount: booking.discount,
        total: booking.totalAmount,
        paymentMethod: successfulPayment?.method || "UPI",
      },
    };

    const pdfBytes = await generateTicketPdf(ticketData);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Wayfare_Ticket_${ticketData.pnr}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation route error:", err);
    return NextResponse.json({ error: "Failed to generate ticket PDF" }, { status: 500 });
  }
}

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface TicketData {
  bookingId: string;
  pnr: string;
  mode: string;
  status: string;
  createdAt: string;
  routeTitle: string;
  serviceNumber: string;
  serviceName: string;
  travelDate: string;
  departureTime?: string;
  arrivalTime?: string;
  fromStationOrCity: string;
  toStationOrCity: string;
  passengers: {
    name: string;
    age?: number | null;
    gender?: string | null;
    seat?: string | null;
    berth?: string | null;
    status: string;
  }[];
  fare: {
    base: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    paymentMethod: string;
  };
}

export async function generateTicketPdf(data: TicketData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Color palette
  const brandColor = rgb(0.91, 0.35, 0.05); // #E8590C
  const inkColor = rgb(0.08, 0.1, 0.12);     // #14181F
  const mutedColor = rgb(0.36, 0.39, 0.45);  // #5B6472
  const lineColor = rgb(0.89, 0.87, 0.84);   // #E3DFD6
  const canvasBg = rgb(0.96, 0.95, 0.93);    // #F5F3EE
  const okColor = rgb(0.12, 0.48, 0.29);     // #1E7B4B

  let y = height - 50;

  // Header Bar
  page.drawRectangle({
    x: 40,
    y: y - 35,
    width: width - 80,
    height: 45,
    color: canvasBg,
    borderColor: lineColor,
    borderWidth: 1,
  });

  page.drawText("WAYFARE", {
    x: 55,
    y: y - 20,
    size: 18,
    font: fontBold,
    color: brandColor,
  });

  page.drawText("ELECTRONIC TRAVEL TICKET & TAX INVOICE", {
    x: 180,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: inkColor,
  });

  y -= 60;

  // Booking & PNR Meta Banner
  page.drawRectangle({
    x: 40,
    y: y - 50,
    width: width - 80,
    height: 50,
    color: rgb(1, 1, 1),
    borderColor: lineColor,
    borderWidth: 1,
  });

  // PNR
  page.drawText("PNR NUMBER", { x: 55, y: y - 16, size: 8, font: fontBold, color: mutedColor });
  page.drawText(data.pnr || data.bookingId.slice(0, 10).toUpperCase(), {
    x: 55,
    y: y - 35,
    size: 15,
    font: fontMono,
    color: brandColor,
  });

  // Booking ID
  page.drawText("BOOKING REFERENCE", { x: 220, y: y - 16, size: 8, font: fontBold, color: mutedColor });
  page.drawText(data.bookingId, { x: 220, y: y - 33, size: 10, font: fontMono, color: inkColor });

  // Status
  page.drawText("STATUS", { x: 420, y: y - 16, size: 8, font: fontBold, color: mutedColor });
  page.drawText(data.status.toUpperCase(), { x: 420, y: y - 33, size: 12, font: fontBold, color: okColor });

  y -= 75;

  // Journey Summary Box
  page.drawRectangle({
    x: 40,
    y: y - 80,
    width: width - 80,
    height: 80,
    color: rgb(1, 1, 1),
    borderColor: lineColor,
    borderWidth: 1,
  });

  page.drawText("ITINERARY DETAILS", { x: 55, y: y - 16, size: 9, font: fontBold, color: brandColor });

  page.drawText(`${data.mode}: ${data.serviceName} (${data.serviceNumber})`, {
    x: 55,
    y: y - 34,
    size: 11,
    font: fontBold,
    color: inkColor,
  });

  page.drawText(`Date of Travel: ${data.travelDate}`, {
    x: 55,
    y: y - 52,
    size: 9,
    font: fontRegular,
    color: mutedColor,
  });

  page.drawText(`Sector: ${data.fromStationOrCity} -> ${data.toStationOrCity}`, {
    x: 55,
    y: y - 68,
    size: 9,
    font: fontBold,
    color: inkColor,
  });

  if (data.departureTime && data.arrivalTime) {
    page.drawText(`Depart: ${data.departureTime} | Arrive: ${data.arrivalTime}`, {
      x: 320,
      y: y - 52,
      size: 9,
      font: fontRegular,
      color: mutedColor,
    });
  }

  y -= 105;

  // Passenger Manifest Table
  page.drawText("PASSENGER DETAILS", { x: 40, y: y, size: 10, font: fontBold, color: inkColor });
  y -= 15;

  // Table Header
  page.drawRectangle({
    x: 40,
    y: y - 18,
    width: width - 80,
    height: 20,
    color: canvasBg,
    borderColor: lineColor,
    borderWidth: 1,
  });

  page.drawText("#", { x: 50, y: y - 13, size: 8, font: fontBold, color: inkColor });
  page.drawText("Passenger Name", { x: 80, y: y - 13, size: 8, font: fontBold, color: inkColor });
  page.drawText("Age / Gender", { x: 260, y: y - 13, size: 8, font: fontBold, color: inkColor });
  page.drawText("Seat / Berth", { x: 380, y: y - 13, size: 8, font: fontBold, color: inkColor });
  page.drawText("Status", { x: 480, y: y - 13, size: 8, font: fontBold, color: inkColor });

  y -= 20;

  // Passenger Rows
  data.passengers.forEach((p, idx) => {
    page.drawRectangle({
      x: 40,
      y: y - 22,
      width: width - 80,
      height: 22,
      color: rgb(1, 1, 1),
      borderColor: lineColor,
      borderWidth: 1,
    });

    page.drawText(`${idx + 1}`, { x: 50, y: y - 15, size: 8, font: fontRegular, color: mutedColor });
    page.drawText(p.name, { x: 80, y: y - 15, size: 9, font: fontBold, color: inkColor });
    page.drawText(`${p.age || "--"} yrs / ${p.gender || "--"}`, {
      x: 260,
      y: y - 15,
      size: 8,
      font: fontRegular,
      color: mutedColor,
    });
    page.drawText(p.seat || p.berth || "Confirmed", {
      x: 380,
      y: y - 15,
      size: 9,
      font: fontBold,
      color: inkColor,
    });
    page.drawText(p.status || "CNF", { x: 480, y: y - 15, size: 8, font: fontBold, color: okColor });

    y -= 22;
  });

  y -= 25;

  // Fare & Payment Breakdown Box
  page.drawText("PAYMENT SUMMARY", { x: 40, y: y, size: 10, font: fontBold, color: inkColor });
  y -= 15;

  page.drawRectangle({
    x: 40,
    y: y - 85,
    width: width - 80,
    height: 85,
    color: rgb(1, 1, 1),
    borderColor: lineColor,
    borderWidth: 1,
  });

  page.drawText("Base Fare:", { x: 55, y: y - 20, size: 9, font: fontRegular, color: mutedColor });
  page.drawText(`INR ${data.fare.base.toLocaleString("en-IN")}`, {
    x: 200,
    y: y - 20,
    size: 9,
    font: fontMono,
    color: inkColor,
  });

  page.drawText("Taxes & GST:", { x: 55, y: y - 36, size: 9, font: fontRegular, color: mutedColor });
  page.drawText(`INR ${data.fare.taxes.toLocaleString("en-IN")}`, {
    x: 200,
    y: y - 36,
    size: 9,
    font: fontMono,
    color: inkColor,
  });

  page.drawText("Convenience Fee:", { x: 55, y: y - 52, size: 9, font: fontRegular, color: mutedColor });
  page.drawText(`INR ${data.fare.fees.toLocaleString("en-IN")}`, {
    x: 200,
    y: y - 52,
    size: 9,
    font: fontMono,
    color: inkColor,
  });

  if (data.fare.discount > 0) {
    page.drawText("Promo Discount:", { x: 55, y: y - 68, size: 9, font: fontRegular, color: okColor });
    page.drawText(`- INR ${data.fare.discount.toLocaleString("en-IN")}`, {
      x: 200,
      y: y - 68,
      size: 9,
      font: fontMono,
      color: okColor,
    });
  }

  // Total
  page.drawLine({
    start: { x: 340, y: y - 45 },
    end: { x: 500, y: y - 45 },
    thickness: 1,
    color: lineColor,
  });

  page.drawText("TOTAL AMOUNT PAID", { x: 340, y: y - 30, size: 9, font: fontBold, color: mutedColor });
  page.drawText(`INR ${data.fare.total.toLocaleString("en-IN")}`, {
    x: 340,
    y: y - 65,
    size: 16,
    font: fontMono,
    color: brandColor,
  });

  page.drawText(`Paid via: ${data.fare.paymentMethod.toUpperCase()}`, {
    x: 340,
    y: y - 78,
    size: 8,
    font: fontRegular,
    color: mutedColor,
  });

  y -= 110;

  // Important Instructions Footer
  page.drawText("IMPORTANT INFORMATION", { x: 40, y: y, size: 8, font: fontBold, color: mutedColor });
  y -= 12;

  const notes = [
    "1. Valid Government-issued Photo ID (Aadhaar / Passport / Voter ID) is mandatory during transit.",
    "2. For flights, web check-in closes 60 mins before departure; report 2 hours prior for domestic sectors.",
    "3. For trains, chart preparation takes place 4 hours prior to departure from train originating station.",
    "4. Cancellation & refund claims are governed by Wayfare Tiered Transit Policies as published.",
  ];

  notes.forEach((note) => {
    page.drawText(note, { x: 40, y, size: 7, font: fontRegular, color: mutedColor });
    y -= 10;
  });

  return await pdfDoc.save();
}

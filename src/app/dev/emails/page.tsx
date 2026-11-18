"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils/formatters";
import { Mail, Plane, Train, Bus, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DevEmailsPreviewPage() {
  const [selectedMode, setSelectedMode] = useState<"FLIGHT" | "TRAIN" | "BUS" | "HOTEL">("FLIGHT");

  const sampleEmails = {
    FLIGHT: {
      subject: "E-Ticket Confirmation: Skyline Air SL-102 (DEL -> BOM) - PNR WF98234123",
      pnr: "WF98234123",
      service: "Skyline Air SL-102",
      sector: "New Delhi (DEL) to Mumbai (BOM)",
      date: "Sunday, 22 Nov 2026",
      depart: "06:15",
      arrive: "08:30",
      passenger: "Aarav Sharma (Seat 12F)",
      total: 5490,
    },
    TRAIN: {
      subject: "IRCTC Electronic Reservation Slip: 12952 Mumbai Rajdhani - PNR 2489102934",
      pnr: "2489102934",
      service: "12952 Mumbai Rajdhani Express (Class: 3A)",
      sector: "New Delhi (NDLS) to Mumbai Central (BCT)",
      date: "Tuesday, 24 Nov 2026",
      depart: "16:55",
      arrive: "08:35 (+1 day)",
      passenger: "Aarav Sharma (Coach B3, Berth 42 - Lower)",
      total: 2420,
    },
    BUS: {
      subject: "Bus Booking Voucher: Zingbus Connect (New Delhi -> Jaipur)",
      pnr: "BUS8492019",
      service: "Zingbus Connect (Volvo Multi-Axle AC Sleeper)",
      sector: "New Delhi Central Bus Station to Jaipur City Terminal",
      date: "Friday, 20 Nov 2026",
      depart: "22:30",
      arrive: "04:00 (+1 day)",
      passenger: "Aarav Sharma (Seat L4 - Lower Deck)",
      total: 1250,
    },
    HOTEL: {
      subject: "Hotel Confirmation Voucher: Grand Heritage Mumbai",
      pnr: "HTL4920192",
      service: "Grand Heritage Mumbai (Executive King Room)",
      sector: "City Center, Mumbai",
      date: "20 Nov 2026 to 22 Nov 2026 (2 Nights)",
      depart: "Check-in: 14:00",
      arrive: "Check-out: 11:00",
      passenger: "Aarav Sharma & Guest (1 Room, 2 Guests)",
      total: 4800,
    },
  };

  const email = sampleEmails[selectedMode];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 border-b border-[var(--line)] pb-4">
        <span className="font-mono text-xs font-bold text-[var(--brand)]">
          INTERNAL DEV PREVIEW (/dev/emails)
        </span>
        <h1 className="text-xl font-bold text-[var(--ink)]">
          Transactional Email Templates
        </h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Zero external SMTP dependencies; rendered in-browser for visual and content validation.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="mb-6 flex gap-2">
        {(["FLIGHT", "TRAIN", "BUS", "HOTEL"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSelectedMode(m)}
            className={`rounded px-4 py-1.5 text-xs font-semibold transition-colors ${
              selectedMode === m
                ? "bg-[var(--brand)] text-white shadow-2xs"
                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--canvas)]"
            }`}
          >
            {m} Confirmation
          </button>
        ))}
      </div>

      {/* Email Client Preview Shell */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-md overflow-hidden">
        {/* Email Header Metadata */}
        <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-4 text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-[var(--ink-muted)] w-14">From:</span>
            <span className="font-mono text-[var(--ink)]">tickets@wayfare.transit</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-[var(--ink-muted)] w-14">To:</span>
            <span className="font-mono text-[var(--ink)]">traveller@demo.test</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--ink-muted)] w-14">Subject:</span>
            <span className="font-semibold text-[var(--ink)]">{email.subject}</span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-8 max-w-2xl mx-auto font-sans text-xs text-[var(--ink)]">
          {/* Brand Logo */}
          <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-[var(--brand)] text-xs font-bold text-white">
                W
              </span>
              <span className="font-mono text-base font-bold text-[var(--ink)]">Wayfare</span>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--brand)] bg-[#FFF4ED] px-2 py-0.5 rounded border border-[#FED7AA]">
              PNR: {email.pnr}
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-[var(--ok)]">
              <CheckCircle2 size={18} />
              <span>Your {selectedMode} Booking is Confirmed</span>
            </div>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Dear Aarav, thank you for booking with Wayfare. Your electronic reservation is confirmed and ready for travel.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-4 mb-6">
            <div className="text-xs font-bold text-[var(--ink)] mb-1">{email.service}</div>
            <div className="text-xs text-[var(--ink)] font-semibold">{email.sector}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[var(--ink-muted)] font-mono border-t border-[var(--line)] pt-2">
              <div>Date: {email.date}</div>
              <div>Timing: {email.depart} → {email.arrive}</div>
              <div className="col-span-2 text-[var(--ink)] font-bold">
                Passenger: {email.passenger}
              </div>
            </div>
          </div>

          {/* Fare Summary */}
          <div className="rounded border border-[var(--line)] p-4 mb-6 text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-[var(--ink)]">Total Amount Paid</span>
              <div className="text-[10px] text-[var(--ink-muted)]">Inclusive of GST & IRCTC Convenience Fee</div>
            </div>
            <span className="font-mono text-base font-bold text-[var(--brand)]">
              {formatINR(email.total)}
            </span>
          </div>

          <div className="border-t border-[var(--line)] pt-4 text-[10px] text-[var(--ink-muted)] leading-relaxed">
            Please carry a valid government-issued photo identity proof during your journey.
            You can access your e-ticket anytime in your Wayfare dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}

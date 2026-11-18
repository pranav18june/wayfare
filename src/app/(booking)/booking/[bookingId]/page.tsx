"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import {
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ArrowRight,
  Train,
  Plane,
  Bus,
  Building2,
  FileText,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/booking/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  function handleCopyPnr() {
    if (booking?.pnr) {
      navigator.clipboard.writeText(booking.pnr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleResolvePending() {
    setResolving(true);
    try {
      const res = await fetch(`/api/booking/${bookingId}/resolve`, {
        method: "POST",
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  }

  if (loading || !booking) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-xs text-[var(--ink-muted)]">
        Retrieving reservation record...
      </div>
    );
  }

  const isPending = booking.status === "PENDING";
  let meta: any = {};
  try {
    meta = booking.metadataJson ? JSON.parse(booking.metadataJson) : {};
  } catch {
    // fallback
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Pending status banner (Section 8.7) */}
      {isPending ? (
        <div className="mb-6 rounded-md border border-[#FEEFC3] bg-[#FEF7E0] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-[var(--warn)] shrink-0 animate-pulse" />
              <div>
                <h1 className="text-base font-bold text-[var(--ink)]">
                  Payment Authorization Pending
                </h1>
                <p className="text-xs text-[var(--ink-muted)]">
                  We are awaiting final clearance from your banking gateway. The reservation will update automatically once confirmed.
                </p>
              </div>
            </div>

            {/* Dev-only resolve control */}
            <button
              type="button"
              disabled={resolving}
              onClick={handleResolvePending}
              className="flex items-center gap-1.5 rounded bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black shrink-0"
            >
              <RefreshCw size={12} className={resolving ? "animate-spin" : ""} />
              <span>Dev: Simulate Bank Clearance</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-md border border-[#CEEAD6] bg-[#E6F4EA] p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-[var(--ok)] shrink-0" />
            <div>
              <h1 className="text-base font-bold text-[var(--ink)]">
                Booking Successfully Confirmed!
              </h1>
              <p className="text-xs text-[var(--ink-muted)]">
                Your ticket and travel invoice have been generated and sent to your registered account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Container */}
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        {/* PNR & Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--ink-muted)]">PNR NUMBER:</span>
              <span className="font-mono text-lg font-bold text-[var(--brand)]">
                {booking.pnr || "WF" + booking.id.slice(0, 8).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleCopyPnr}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                title="Copy PNR"
              >
                <Copy size={13} />
              </button>
              {copied && <span className="text-[10px] text-[var(--ok)]">Copied</span>}
            </div>

            <div className="font-mono text-[11px] text-[var(--ink-muted)] mt-0.5">
              Ref ID: {booking.id} • Booked: {formatDate(booking.createdAt, "d MMM yyyy, HH:mm")}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`/api/booking/${booking.id}/pdf`}
              download
              className="flex items-center gap-1.5 rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-ink)] shadow-sm"
            >
              <Download size={14} />
              <span>Download PDF Ticket</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)]"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Mode Itinerary Box */}
        <div className="rounded-md bg-[var(--canvas)] p-4 mb-6 border border-[var(--line)] text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-[var(--accent)] uppercase">
              {booking.mode} SERVICE
            </span>
            <StatusBadge status={booking.status} />
          </div>

          <div className="text-sm font-bold text-[var(--ink)] mb-1">
            {meta.origin || meta.fromStation || meta.from || meta.city || "Origin"} →{" "}
            {meta.destination || meta.toStation || meta.to || meta.hotelName || "Destination"}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ink-muted)] font-mono">
            <span>Date: {meta.date || meta.checkIn || formatDate(booking.createdAt, "yyyy-MM-dd")}</span>
            {meta.flightNumber && <span>Flight: {meta.flightNumber}</span>}
            {meta.trainNumber && <span>Train: {meta.trainNumber} ({meta.trainName})</span>}
            {meta.busType && <span>Bus: {meta.operatorName || meta.operator} ({meta.busType})</span>}
            {meta.roomType && <span>Room: {meta.roomType}</span>}
          </div>
        </div>

        {/* Passenger Manifest */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
            Passenger Manifest
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--ink-muted)]">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Passenger Name</th>
                  <th className="pb-2 font-medium">Age / Gender</th>
                  <th className="pb-2 font-medium">Assigned Seat / Berth</th>
                  <th className="pb-2 text-right font-medium">Ticket Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-mono">
                {booking.passengers?.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[var(--canvas)]">
                    <td className="py-2.5 text-[var(--ink-muted)]">{idx + 1}</td>
                    <td className="py-2.5 font-sans font-bold text-[var(--ink)]">{p.name}</td>
                    <td className="py-2.5 text-[var(--ink-muted)]">
                      {p.age || "--"} yrs / {p.gender || "--"}
                    </td>
                    <td className="py-2.5 font-bold text-[var(--ink)]">
                      {p.seat || p.berth || "Confirmed"}
                    </td>
                    <td className="py-2.5 text-right font-bold text-[var(--ok)]">
                      {p.ticketStatus || "CNF"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="border-t border-[var(--line)] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex flex-col gap-1 text-[var(--ink-muted)] font-mono">
            <span>Taxes & GST: {formatINR(booking.taxes)}</span>
            <span>Convenience Fee: {formatINR(booking.fees)}</span>
            {booking.discount > 0 && (
              <span className="text-[var(--ok)]">Promo Discount: -{formatINR(booking.discount)}</span>
            )}
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[10px] text-[var(--ink-muted)]">Total Paid (Inclusive of Taxes)</div>
            <div className="font-mono text-xl font-bold text-[var(--brand)]">
              {formatINR(booking.totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Links */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link
          href="/trips"
          className="flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline"
        >
          <span>View all bookings in My Trips</span>
          <ArrowRight size={13} />
        </Link>

        <Link
          href={`/dev/emails?bookingId=${booking.id}`}
          className="flex items-center gap-1 font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          <ExternalLink size={13} />
          <span>Preview E-Ticket Email (/dev/emails)</span>
        </Link>
      </div>
    </div>
  );
}

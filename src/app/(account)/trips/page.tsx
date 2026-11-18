"use client";

import { useState, useEffect } from "react";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Plane,
  Train,
  Bus,
  Building2,
  Download,
  Calendar,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
  Clock,
  RotateCcw,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED" | "GROUPED">("UPCOMING");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [refundPreview, setRefundPreview] = useState<any | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Modification Modal state
  const [modifyModalBooking, setModifyModalBooking] = useState<any | null>(null);
  const [newDateInput, setNewDateInput] = useState("");
  const [modifying, setModifying] = useState(false);

  // Grouping Modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [tripName, setTripName] = useState("");
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [grouping, setGrouping] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Preview cancellation refund (Section 8.8)
  async function handleOpenCancelModal(booking: any) {
    setCancelModalBooking(booking);
    setLoadingPreview(true);
    setRefundPreview(null);
    try {
      const res = await fetch(`/api/booking/${booking.id}/cancel`);
      if (res.ok) {
        const preview = await res.json();
        setRefundPreview(preview);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  }

  // Confirm cancellation
  async function handleConfirmCancel() {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/booking/${cancelModalBooking.id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        setCancelModalBooking(null);
        fetchTrips();
      } else {
        alert("Cancellation failed");
      }
    } catch {
      alert("Network error during cancellation");
    } finally {
      setCancelling(false);
    }
  }

  // Confirm modification
  async function handleConfirmModify() {
    if (!modifyModalBooking || !newDateInput) return;
    setModifying(true);
    try {
      const res = await fetch(`/api/booking/${modifyModalBooking.id}/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate: newDateInput }),
      });
      if (res.ok) {
        setModifyModalBooking(null);
        fetchTrips();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to modify date");
      }
    } catch {
      alert("Network error");
    } finally {
      setModifying(false);
    }
  }

  // Create Grouped Trip
  async function handleCreateGroupTrip() {
    if (!tripName.trim() || selectedBookingIds.length === 0) return;
    setGrouping(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tripName.trim(),
          bookingIds: selectedBookingIds,
        }),
      });
      if (res.ok) {
        setGroupModalOpen(false);
        setTripName("");
        setSelectedBookingIds([]);
        fetchTrips();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGrouping(false);
    }
  }

  const currentBookings =
    activeTab === "UPCOMING"
      ? data?.upcoming || []
      : activeTab === "COMPLETED"
      ? data?.completed || []
      : activeTab === "CANCELLED"
      ? data?.cancelled || []
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Cancellation Dialog Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--danger)] mb-2">
              <AlertTriangle size={18} />
              <span>Cancel Booking: {cancelModalBooking.pnr || cancelModalBooking.id}</span>
            </div>
            <p className="text-xs text-[var(--ink-muted)] mb-4">
              Review your computed refund breakdown per published transit cancellation policy.
            </p>

            {loadingPreview ? (
              <div className="py-8 text-center text-xs text-[var(--ink-muted)]">
                Computing refund deductions...
              </div>
            ) : refundPreview ? (
              <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-4 mb-5 text-xs flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Total Paid:</span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    {formatINR(refundPreview.totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Cancellation Fee / Deduction:</span>
                  <span className="font-mono font-bold text-[var(--danger)]">
                    -{formatINR(refundPreview.cancellationFee)}
                  </span>
                </div>
                <div className="border-t border-[var(--line)] pt-2 flex justify-between font-bold text-[var(--ink)]">
                  <span>Refund Credited to Wallet:</span>
                  <span className="font-mono text-base text-[var(--ok)]">
                    {formatINR(refundPreview.refundableAmount)}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[var(--ink-muted)] border-t border-[var(--line)] pt-2">
                  <strong>Policy Applied:</strong> {refundPreview.policyApplied}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="rounded border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--canvas)]"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling || loadingPreview}
                onClick={handleConfirmCancel}
                className="rounded bg-[var(--danger)] px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {cancelling ? "Processing Cancellation..." : "Confirm & Credit Wallet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Date Modal */}
      {modifyModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl">
            <h2 className="text-sm font-bold text-[var(--ink)] mb-2">
              Reschedule Travel Date
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mb-4">
              Select a new date for {modifyModalBooking.mode} booking ({modifyModalBooking.pnr}).
              Nominal rescheduling fee applies.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                New Travel Date
              </label>
              <input
                type="date"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="h-10 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-mono text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModifyModalBooking(null)}
                className="rounded border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modifying || !newDateInput}
                onClick={handleConfirmModify}
                className="rounded bg-[var(--brand)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-ink)] disabled:opacity-50"
              >
                {modifying ? "Rescheduling..." : "Confirm Modification (₹350 Fee)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Trip Creation Modal */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl">
            <h2 className="text-sm font-bold text-[var(--ink)] mb-1">
              Group Bookings into a Combined Trip
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mb-4">
              Bundle flights, trains, buses, and hotels into a unified chronological itinerary.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Trip Name
              </label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. Goa Vacation & Conference"
                className="h-10 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--ink-muted)] mb-2">
                Select Bookings to Group
              </label>
              <div className="max-h-48 overflow-y-auto divide-y divide-[var(--line)] border border-[var(--line)] rounded p-2 text-xs">
                {data?.upcoming?.map((b: any) => (
                  <label key={b.id} className="flex items-center gap-2 p-2 hover:bg-[var(--canvas)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBookingIds.includes(b.id)}
                      onChange={(e) => {
                        setSelectedBookingIds((prev) =>
                          e.target.checked ? [...prev, b.id] : prev.filter((id) => id !== b.id)
                        );
                      }}
                      className="rounded border-[var(--line)] text-[var(--accent)]"
                    />
                    <div>
                      <span className="font-bold text-[var(--ink)]">{b.mode}: {b.pnr || b.id}</span>
                      <span className="text-[11px] text-[var(--ink-muted)] ml-2">({formatINR(b.totalAmount)})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGroupModalOpen(false)}
                className="rounded border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={grouping || !tripName.trim() || selectedBookingIds.length === 0}
                onClick={handleCreateGroupTrip}
                className="rounded bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {grouping ? "Creating..." : "Create Trip Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--ink)]">My Trips & Bookings</h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Manage your active itineraries, download tickets, reschedule dates, or calculate refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGroupModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] shadow-2xs self-start"
        >
          <FolderPlus size={14} className="text-[var(--accent)]" />
          <span>Group Bookings</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-[var(--line)] gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("UPCOMING")}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === "UPCOMING"
              ? "border-[var(--brand)] text-[var(--brand)] font-bold"
              : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          Upcoming ({data?.upcoming?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COMPLETED")}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === "COMPLETED"
              ? "border-[var(--brand)] text-[var(--brand)] font-bold"
              : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          Completed ({data?.completed?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CANCELLED")}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === "CANCELLED"
              ? "border-[var(--brand)] text-[var(--brand)] font-bold"
              : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          Cancelled ({data?.cancelled?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("GROUPED")}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === "GROUPED"
              ? "border-[var(--brand)] text-[var(--brand)] font-bold"
              : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          Grouped Itineraries ({data?.groupedTrips?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--ink-muted)]">Loading bookings...</div>
      ) : activeTab === "GROUPED" ? (
        <div className="flex flex-col gap-4">
          {data?.groupedTrips?.length === 0 ? (
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--ink-muted)]">
              No grouped trips created yet. Use &ldquo;Group Bookings&rdquo; above to combine flights, trains, and hotels into a unified trip timeline.
            </div>
          ) : (
            data?.groupedTrips?.map((trip: any) => (
              <div key={trip.id} className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--ink)]">{trip.name}</h2>
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      {trip.bookings?.length} Booked Segments
                    </span>
                  </div>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="flex items-center gap-1 rounded bg-[var(--canvas)] border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)]"
                  >
                    <span>View Itinerary Timeline</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {trip.bookings?.map((b: any) => (
                    <span key={b.id} className="rounded bg-[var(--canvas)] border border-[var(--line)] px-2.5 py-1 font-mono text-[11px]">
                      {b.mode}: {b.pnr || b.id} ({formatINR(b.totalAmount)})
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : currentBookings.length === 0 ? (
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--ink-muted)]">
          No {activeTab.toLowerCase()} bookings found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {currentBookings.map((b: any) => {
            let meta: any = {};
            try {
              meta = b.metadataJson ? JSON.parse(b.metadataJson) : {};
            } catch {
              // fallback
            }

            return (
              <div
                key={b.id}
                className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--line)]">
                      {b.mode}
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--brand)]">
                      {b.pnr || b.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="font-mono text-sm font-bold text-[var(--ink)]">
                      {formatINR(b.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center py-2">
                  <div className="sm:col-span-8 flex flex-col gap-1 text-xs">
                    <div className="text-sm font-bold text-[var(--ink)]">
                      {meta.origin || meta.fromStation || meta.from || meta.city || "Origin"} →{" "}
                      {meta.destination || meta.toStation || meta.to || meta.hotelName || "Destination"}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)] font-mono">
                      <span>Date: {meta.date || meta.checkIn || formatDate(b.createdAt, "yyyy-MM-dd")}</span>
                      {meta.flightNumber && <span>Flight: {meta.flightNumber}</span>}
                      {meta.trainNumber && <span>Train: {meta.trainNumber}</span>}
                      {meta.operator && <span>Operator: {meta.operator}</span>}
                      <span>Passengers: {b.passengers?.length || 1}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="sm:col-span-4 flex flex-wrap items-center justify-end gap-2 border-t sm:border-t-0 border-[var(--line)] pt-3 sm:pt-0 text-xs">
                    <a
                      href={`/api/booking/${b.id}/pdf`}
                      download
                      className="flex items-center gap-1 rounded border border-[var(--line)] bg-[var(--canvas)] px-2.5 py-1.5 font-medium text-[var(--ink)] hover:border-[var(--accent)]"
                      title="Download PDF Ticket"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </a>

                    {/* Reschedule Button (Flights / Buses only) */}
                    {(b.mode === "FLIGHT" || b.mode === "BUS") && b.status === "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() => {
                          setModifyModalBooking(b);
                          setNewDateInput(meta.date || "2026-11-26");
                        }}
                        className="flex items-center gap-1 rounded border border-[var(--line)] px-2.5 py-1.5 font-medium text-[var(--ink)] hover:border-[var(--accent)]"
                      >
                        <Calendar size={13} />
                        <span>Modify</span>
                      </button>
                    )}

                    {/* Cancel Booking Button */}
                    {b.status === "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(b)}
                        className="flex items-center gap-1 rounded bg-[#FCE8E6] text-[var(--danger)] px-2.5 py-1.5 font-semibold border border-[#FAD2CF] hover:bg-[#FAD2CF]"
                      >
                        <span>Cancel</span>
                      </button>
                    )}

                    <Link
                      href={`/booking/${b.id}`}
                      className="flex items-center gap-1 rounded bg-[var(--brand)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--brand-ink)]"
                    >
                      <span>Details</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

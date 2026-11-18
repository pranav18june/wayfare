"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plane,
  Train,
  Bus,
  Hotel,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils/formatters";

interface AdminBooking {
  id: string;
  mode: string;
  pnr: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  passengers: Array<{
    id: string;
    name: string;
    seat: string | null;
  }>;
  payments: Array<{
    id: string;
    status: string;
    amount: number;
    method: string;
  }>;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);
      if (mode) params.set("mode", mode);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, mode]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            CANCELLED
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            PENDING
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-stone-100 text-stone-800">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[var(--ink)]">
            Bookings Registry
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Audit, inspect, and override booking lifecycle states across all travel modes.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--ink-muted)]">
          Total Records: <span className="font-semibold text-[var(--ink)]">{total}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, PNR, email, customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-[var(--line)] rounded text-xs focus:outline-none focus:border-[var(--brand)] bg-[var(--canvas)]/40"
          />
        </div>

        {/* Mode Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--ink-muted)] hidden sm:block" />
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setPage(1);
            }}
            className="border border-[var(--line)] rounded px-3 py-2 text-xs bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)] font-mono"
          >
            <option value="">All Modes</option>
            <option value="FLIGHT">Flights</option>
            <option value="TRAIN">Trains</option>
            <option value="BUS">Buses</option>
            <option value="HOTEL">Hotels</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-[var(--line)] rounded px-3 py-2 text-xs bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)] font-mono"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--canvas)] border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Booking Ref / PNR</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Mode & Travellers</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--canvas)]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/booking/${b.id}`}
                          target="_blank"
                          className="font-semibold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{b.id.slice(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      {b.pnr && (
                        <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                          PNR: <span className="font-semibold text-[var(--ink)]">{b.pnr}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[var(--ink)]">
                        {b.user?.name || "Guest Traveller"}
                      </div>
                      <div className="text-[11px] text-[var(--ink-muted)] font-mono">
                        {b.user?.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--canvas)] text-[var(--ink)]">
                          {b.mode === "FLIGHT" && <Plane className="w-3 h-3" />}
                          {b.mode === "TRAIN" && <Train className="w-3 h-3" />}
                          {b.mode === "BUS" && <Bus className="w-3 h-3" />}
                          {b.mode === "HOTEL" && <Hotel className="w-3 h-3" />}
                          <span>{b.mode}</span>
                        </span>
                        <span className="text-[11px] text-[var(--ink-muted)]">
                          ({b.passengers?.length || 1} {b.mode === "HOTEL" ? "guests" : "pax"})
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-[var(--ink)]">
                      {formatINR(b.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(b.status)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--ink-muted)] whitespace-nowrap">
                      {formatDate(b.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        disabled={updatingId === b.id}
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="text-xs font-mono border border-[var(--line)] rounded px-2 py-1 bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)] disabled:opacity-50 cursor-pointer"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--line)] bg-[var(--canvas)]/40 flex items-center justify-between text-xs">
            <span className="font-mono text-[var(--ink-muted)]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--line)] rounded bg-[var(--surface)] text-[var(--ink)] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--canvas)] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--line)] rounded bg-[var(--surface)] text-[var(--ink)] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--canvas)] transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

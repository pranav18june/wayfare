"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Ticket,
  Users,
  AlertTriangle,
  IndianRupee,
  Plane,
  Train,
  Bus,
  Hotel,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatINR } from "@/lib/utils/formatters";

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    cancellationRate: number;
    totalUsers: number;
  };
  modeBreakdown: Array<{
    mode: string;
    revenue: number;
    bookings: number;
  }>;
  dailyTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  topRoutes: Array<{
    route: string;
    mode: string;
    count: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[var(--line)]/50 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[var(--surface)] border border-[var(--line)] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-[var(--surface)] border border-[var(--line)] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-8 text-center">
        <p className="text-sm text-[var(--ink-muted)]">Failed to load analytics data.</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-[var(--brand)] text-white text-xs font-medium rounded hover:bg-[var(--brand)]/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, modeBreakdown, dailyTrends, topRoutes } = data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[var(--ink)]">
            Executive Overview
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Real-time operations, travel volume, and revenue analytics.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-medium rounded hover:bg-[var(--canvas)] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider font-mono">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--ink)]">
            {formatINR(summary.totalRevenue)}
          </div>
          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">Settled transactions</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider font-mono">
              Total Bookings
            </span>
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--ink)]">
            {summary.totalBookings}
          </div>
          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">All modes combined</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider font-mono">
              Active Bookings
            </span>
            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--ink)]">
            {summary.confirmedBookings}
          </div>
          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">Confirmed & ready</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider font-mono">
              Cancellation Rate
            </span>
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--ink)]">
            {summary.cancellationRate}%
          </div>
          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
            {summary.cancelledBookings} cancelled
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider font-mono">
              Total Users
            </span>
            <div className="w-8 h-8 rounded bg-stone-100 text-stone-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--ink)]">
            {summary.totalUsers}
          </div>
          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">Registered accounts</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Bookings Trend (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)]">
                Booking Activity (Last 14 Days)
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Daily volume across all travel services
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--ink-muted)]">
              Daily Count
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8590C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E8590C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3DFD6" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#E3DFD6" }}
                  tick={{ fontSize: 10, fill: "#5B6472", fontFamily: "var(--font-mono)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#E3DFD6" }}
                  tick={{ fontSize: 10, fill: "#5B6472", fontFamily: "var(--font-mono)" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[var(--surface)] border border-[var(--line)] p-2.5 rounded shadow-sm text-xs font-mono">
                          <div className="font-semibold text-[var(--ink)]">{d.date}</div>
                          <div className="text-[var(--brand)] mt-1">Bookings: {d.bookings}</div>
                          <div className="text-[var(--ink-muted)]">Revenue: {formatINR(d.revenue)}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#E8590C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#bookingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Mode (1 col) */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)]">
                Revenue by Mode
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Contribution across verticals
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3DFD6" />
                <XAxis
                  dataKey="mode"
                  tickLine={false}
                  axisLine={{ stroke: "#E3DFD6" }}
                  tick={{ fontSize: 11, fill: "#5B6472" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "#E3DFD6" }}
                  tick={{ fontSize: 10, fill: "#5B6472", fontFamily: "var(--font-mono)" }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[var(--surface)] border border-[var(--line)] p-2.5 rounded shadow-sm text-xs font-mono">
                          <div className="font-semibold text-[var(--ink)]">{d.mode}</div>
                          <div className="text-[var(--brand)] mt-1">Revenue: {formatINR(d.revenue)}</div>
                          <div className="text-[var(--ink-muted)]">Bookings: {d.bookings}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#14181F" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Routes & Quick Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Routes (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)]">
                High-Demand Routes
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Most booked origins and destinations
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-medium text-[var(--brand)] hover:underline inline-flex items-center gap-1"
            >
              <span>View all bookings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--canvas)] border-y border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Route / Destination</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3 text-right">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {topRoutes.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[var(--canvas)]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-[var(--ink-muted)]">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3 font-medium text-[var(--ink)]">
                      {r.route}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--canvas)] text-[var(--ink)]">
                        {r.mode === "FLIGHT" && <Plane className="w-3 h-3" />}
                        {r.mode === "TRAIN" && <Train className="w-3 h-3" />}
                        {r.mode === "BUS" && <Bus className="w-3 h-3" />}
                        {r.mode === "HOTEL" && <Hotel className="w-3 h-3" />}
                        <span>{r.mode}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-[var(--ink)]">
                      {r.count}
                    </td>
                  </tr>
                ))}
                {topRoutes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[var(--ink-muted)]">
                      No route activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Shortcuts (1 col) */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]">
              Operational Consoles
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              Direct access to system administration modules
            </p>

            <div className="mt-4 space-y-2.5">
              <Link
                href="/admin/bookings"
                className="flex items-center justify-between p-3 border border-[var(--line)] rounded hover:border-[var(--brand)] hover:bg-[var(--canvas)] transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
                    Bookings Registry
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Search, filter, and override status
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--ink-muted)] group-hover:text-[var(--brand)]" />
              </Link>

              <Link
                href="/admin/promos"
                className="flex items-center justify-between p-3 border border-[var(--line)] rounded hover:border-[var(--brand)] hover:bg-[var(--canvas)] transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
                    Promo Code Engine
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Create discount rules and limits
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--ink-muted)] group-hover:text-[var(--brand)]" />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 border border-[var(--line)] rounded hover:border-[var(--brand)] hover:bg-[var(--canvas)] transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
                    User Accounts
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Permissions and wallet balances
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--ink-muted)] group-hover:text-[var(--brand)]" />
              </Link>

              <Link
                href="/admin/inventory"
                className="flex items-center justify-between p-3 border border-[var(--line)] rounded hover:border-[var(--brand)] hover:bg-[var(--canvas)] transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
                    Inventory Catalog
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Schedules, fares, and room allocations
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--ink-muted)] group-hover:text-[var(--brand)]" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--line)] text-[11px] text-[var(--ink-muted)] font-mono">
            Environment: Local SQLite · Deterministic Seeded Engine
          </div>
        </div>
      </div>
    </div>
  );
}

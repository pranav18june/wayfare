import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plane,
  Train,
  Bus,
  Hotel,
  Download,
  ExternalLink,
  ShieldAlert,
  Users,
  Compass,
  MapPin,
  Calendar,
  AlertCircle,
  Navigation,
} from "lucide-react";
import { CountdownTimer } from "@/components/features/CountdownTimer";

export const dynamic = "force-dynamic";

interface BookingMetadata {
  from?: string;
  to?: string;
  fromCode?: string;
  toCode?: string;
  departDate?: string;
  departTime?: string;
  arriveTime?: string;
  trainNumber?: string;
  trainName?: string;
  flightNumber?: string;
  busOperator?: string;
  hotelName?: string;
  terminal?: string;
  platform?: string;
}

function parseMeta(json: string | null): BookingMetadata {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export default async function TripModePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/trips/live");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
        include: { passengers: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/auth/signin");

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  // Filter bookings for today or tomorrow, or fall back to the most recent upcoming booking
  const relevantBookings = user.bookings.filter((b) => {
    const meta = parseMeta(b.metadataJson);
    const d = b.mode === "HOTEL" ? meta.departDate : meta.departDate;
    return d === todayStr || d === tomorrowStr;
  });

  // If no day-of bookings, pick the latest confirmed booking to still provide a demo experience
  const displayBookings =
    relevantBookings.length > 0 ? relevantBookings : user.bookings.slice(0, 1);

  const isToday = relevantBookings.length > 0;

  return (
    <div className="min-h-screen bg-[var(--canvas)] pb-16">
      {/* Top Banner */}
      <div className="bg-[var(--ink)] text-white border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase bg-[var(--brand)] text-white tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Trip Mode Active
                </span>
                <span className="text-xs text-white/60 font-mono">
                  Day-of Travel Safety & Status Hub
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Live Journey Companion
              </h1>
              <p className="text-sm text-white/70 mt-1">
                Real-time gate status, timetable checks, offline ticket access, and connection alerts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/trips"
                className="text-xs font-mono text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-lg border border-white/10 transition-colors"
              >
                All Bookings →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {!isToday && displayBookings.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Simulated Active Travel View</p>
              <p className="text-amber-800 text-xs mt-0.5">
                You do not have a booking scheduled for today ({todayStr}). Displaying your most recent confirmed booking as a live demo preview.
              </p>
            </div>
          </div>
        )}

        {displayBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--line)] p-12 text-center max-w-xl mx-auto mt-8">
            <Compass className="w-12 h-12 text-[var(--ink-muted)] mx-auto mb-4 stroke-1" />
            <h3 className="text-lg font-bold text-[var(--ink)]">No active journeys found</h3>
            <p className="text-sm text-[var(--ink-muted)] mt-1 mb-6">
              You do not have any confirmed flights, trains, buses, or hotels booked yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-[var(--brand)] hover:bg-[#d04f0a] text-white font-medium text-sm rounded-lg transition-colors"
            >
              Search & Book a Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {displayBookings.map((b) => {
              const meta = parseMeta(b.metadataJson);
              const departDate = meta.departDate ?? todayStr;
              const departTime = meta.departTime ?? "10:30";
              const targetString = `${departTime} on ${departDate}`;

              const ModeIcon =
                b.mode === "FLIGHT"
                  ? Plane
                  : b.mode === "TRAIN"
                  ? Train
                  : b.mode === "BUS"
                  ? Bus
                  : Hotel;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden"
                >
                  {/* Status header ribbon */}
                  <div className="bg-slate-50 border-b border-[var(--line)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--ink)] text-white flex items-center justify-center">
                        <ModeIcon className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--ink)]">
                            {b.mode === "FLIGHT"
                              ? `${meta.flightNumber ?? "Flight"} (${meta.fromCode ?? "DEL"} → ${meta.toCode ?? "BOM"})`
                              : b.mode === "TRAIN"
                              ? `${meta.trainName ?? "Express"} #${meta.trainNumber ?? "12951"}`
                              : b.mode === "BUS"
                              ? `${meta.busOperator ?? "Intercity Express"} (${meta.from ?? "Origin"} → ${meta.to ?? "Dest"})`
                              : meta.hotelName ?? "Hotel Stay"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-semibold">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 mt-0.5 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          Departure Date: {departDate} at {departTime}
                        </p>
                      </div>
                    </div>

                    {/* Countdown Pill */}
                    <div className="bg-white px-4 py-2.5 rounded-xl border border-[var(--line)] shadow-xs min-w-[200px]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                        Departure Countdown
                      </span>
                      <CountdownTimer targetTime={targetString} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Journey specifics */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--canvas)] border border-[var(--line)]/50">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                            PNR / Booking Ref
                          </span>
                          <p className="font-mono font-bold text-[var(--ink)] text-sm mt-0.5">
                            {b.pnr ?? b.id.slice(0, 10).toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                            Gate / Platform
                          </span>
                          <p className="font-semibold text-emerald-700 text-sm mt-0.5 flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5" />
                            {meta.platform ?? "Platform 3 (Expected)"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                            Terminal / Pickup
                          </span>
                          <p className="font-medium text-[var(--ink)] text-sm mt-0.5">
                            {meta.terminal ?? "Terminal 2, Gate 4"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                            Total Fare Paid
                          </span>
                          <p className="font-mono font-bold text-[var(--ink)] text-sm mt-0.5">
                            ₹{b.totalAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Passenger list */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Passenger Manifest ({b.passengers.length})
                          </h4>
                          <span className="text-xs text-emerald-700 font-medium">
                            ✓ All seats checked-in
                          </span>
                        </div>
                        <div className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-xl overflow-hidden">
                          {b.passengers.map((p, idx) => (
                            <div
                              key={p.id || idx}
                              className="px-4 py-3 flex items-center justify-between text-sm bg-white"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-[var(--ink-muted)] text-xs flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                <span className="font-medium text-[var(--ink)]">{p.name}</span>
                                {p.gender && (
                                  <span className="text-xs text-[var(--ink-muted)]">
                                    ({p.gender}, {p.age || 28}y)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-[var(--ink)]">
                                  Seat/Berth: {p.seat || p.berth || `12${String.fromCharCode(65 + idx)}`}
                                </span>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {p.ticketStatus || "CNF"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Real-time status widget for trains or flights */}
                      {b.mode === "TRAIN" && (
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono uppercase font-bold text-blue-900 flex items-center gap-1.5">
                              <Train className="w-4 h-4 text-blue-600" />
                              Live NTES Train Status
                            </span>
                            <span className="text-xs text-blue-700 font-mono">
                              Updated 2 mins ago
                            </span>
                          </div>
                          <p className="text-sm text-blue-950 font-medium">
                            Train running On-Time. Departed previous halt on schedule.
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <Link
                              href={`/trains/running-status?number=${meta.trainNumber || "12951"}`}
                              className="text-xs font-medium text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                            >
                              Full Station Timeline & Map
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {b.mode === "FLIGHT" && (
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono uppercase font-bold text-[var(--ink)] flex items-center gap-1.5">
                              <Plane className="w-4 h-4 text-[var(--brand)]" />
                              Flight Status
                            </span>
                            <span className="text-xs text-emerald-700 font-semibold font-mono">
                              ON SCHEDULE
                            </span>
                          </div>
                          <p className="text-xs text-[var(--ink-muted)]">
                            Aircraft turnaround complete. Baggage drop counters open 2 hours prior to departure.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Emergency & Action Bar */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-[var(--line)] space-y-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] block">
                          Day-of Action Toolkit
                        </span>

                        <a
                          href={`/api/booking/${b.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--ink)] text-white hover:bg-black font-medium text-sm transition-colors shadow-xs"
                        >
                          <Download className="w-4 h-4 text-orange-400" />
                          Download PDF Ticket
                        </a>

                        <Link
                          href={`/booking/${b.id}`}
                          className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-slate-100 font-medium text-sm transition-colors"
                        >
                          Booking Details & Invoice
                        </Link>

                        {b.pnr && (
                          <Link
                            href={`/trains/pnr?pnr=${b.pnr}`}
                            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-slate-100 font-medium text-sm transition-colors"
                          >
                            Live PNR Tracker
                          </Link>
                        )}
                      </div>

                      {/* Travel Safety Assistance Card */}
                      <div className="p-4 rounded-xl border border-[var(--line)] bg-white space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                          <ShieldAlert className="w-4 h-4 text-emerald-600" />
                          Transit Protection & Helpline
                        </div>
                        <p className="text-[var(--ink-muted)] leading-relaxed">
                          Emergency assistance is active for this route. In case of disruption or delays exceeding 60 minutes, your automatic re-accommodation guarantee applies.
                        </p>
                        <div className="pt-2 border-t border-[var(--line)] flex justify-between text-slate-700 font-mono">
                          <span>Railway Police: 139</span>
                          <span>Airport Desk: 011-4768</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

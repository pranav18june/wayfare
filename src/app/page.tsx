"use client";

import { useState } from "react";
import { ModeNav } from "@/components/layout/ModeNav";
import { FlightSearchForm } from "@/features/flights/components/FlightSearchForm";
import { TrainSearchForm } from "@/features/trains/components/TrainSearchForm";
import { BusSearchForm } from "@/features/buses/components/BusSearchForm";
import { HotelSearchForm } from "@/features/hotels/components/HotelSearchForm";
import { PNRQuickCheck } from "@/features/trains/components/PNRQuickCheck";
import { LiveRunningQuickCheck } from "@/features/trains/components/LiveRunningQuickCheck";
import { TravelDayBanner } from "@/components/features/TravelDayBanner";
import {
  Tag,
  ArrowRight,
  Clock,
  ShieldCheck,
  Ticket,
  Copy,
  Check,
  Compass,
  Plane,
  Train,
  Bus,
  Building2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils/formatters";

type ActiveTab = "FLIGHT" | "TRAIN" | "BUS" | "HOTEL" | "PNR" | "RUNNING_STATUS";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("FLIGHT");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Popular routes with live starting prices
  const popularRoutes = [
    { mode: "FLIGHT", from: "New Delhi (DEL)", to: "Mumbai (BOM)", duration: "2h 15m", price: 3450, href: "/flights/results?from=DEL&to=BOM&date=2026-11-22" },
    { mode: "FLIGHT", from: "Bengaluru (BLR)", to: "New Delhi (DEL)", duration: "2h 45m", price: 4200, href: "/flights/results?from=BLR&to=DEL&date=2026-11-22" },
    { mode: "TRAIN", from: "New Delhi (NDLS)", to: "Mumbai Central (BCT)", duration: "15h 35m", price: 1650, href: "/trains/results?from=NDLS&to=BCT&date=2026-11-24" },
    { mode: "TRAIN", from: "Chennai (MAS)", to: "Bengaluru (SBC)", duration: "4h 45m", price: 450, href: "/trains/results?from=MAS&to=SBC&date=2026-11-24" },
    { mode: "BUS", from: "New Delhi", to: "Jaipur", duration: "5h 30m", price: 650, href: "/buses/results?from=New+Delhi&to=Jaipur&date=2026-11-20" },
    { mode: "BUS", from: "Bengaluru", to: "Goa", duration: "11h 00m", price: 1100, href: "/buses/results?from=Bengaluru&to=Goa&date=2026-11-20" },
  ];

  const activePromos = [
    { code: "FLYWAYFARE", title: "₹1,500 Off Domestic Flights", desc: "Instant discount on verified domestic sectors.", min: "Min. spend ₹3,000", tag: "Flights" },
    { code: "SUPERRAIL", title: "Flat ₹500 Off Trains", desc: "Savings on 3A, 2A, and Executive Chair Car bookings.", min: "Min. spend ₹1,000", tag: "Trains" },
    { code: "WELCOME500", title: "₹500 Welcome Discount", desc: "Applicable on your first flight, train, bus, or hotel booking.", min: "No min. booking", tag: "All Modes" },
    { code: "HOTELSTAY", title: "15% Off Handpicked Stays", desc: "Verified properties with complimentary breakfast.", min: "Min. spend ₹2,500", tag: "Hotels" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Travel Day Live Journey Banner (shows if trip is departing today/tomorrow) */}
      <TravelDayBanner />

      {/* Network Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-4 text-xs font-mono text-[var(--ink-muted)]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[var(--ink)]">Network Active:</span>
          <span>40 Airport Hubs · 40 Rail Terminals · 190 Bus Lines · 150 Hotels</span>
        </div>
      </div>

      {/* Main Booking Engine Console */}
      <section className="space-y-4">
        {/* Mode Navigation Tabs */}
        <ModeNav currentMode={activeTab} onSelectMode={(m) => setActiveTab(m)} />

        {/* Dynamic Search Panels */}
        <div className="transition-all">
          {activeTab === "FLIGHT" && <FlightSearchForm />}
          {activeTab === "TRAIN" && <TrainSearchForm />}
          {activeTab === "BUS" && <BusSearchForm />}
          {activeTab === "HOTEL" && <HotelSearchForm />}
          {activeTab === "PNR" && <PNRQuickCheck />}
          {activeTab === "RUNNING_STATUS" && <LiveRunningQuickCheck />}
        </div>
      </section>

      {/* Train Signature Utilities Dual Strip (Visible on non-train utility tabs) */}
      {activeTab !== "PNR" && activeTab !== "RUNNING_STATUS" && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PNRQuickCheck />
          <LiveRunningQuickCheck />
        </section>
      )}

      {/* Platform Innovations: What Traditional OTAs Lack */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-orange-100 text-[var(--brand-ink)]">
                Differentiating Pillars
              </span>
            </div>
            <h2 className="text-base font-bold text-[var(--ink)]">
              Wayfare Innovations — Beyond Standard Travel Search
            </h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Engineered to resolve structural gaps that legacy travel apps still struggle with.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Trip Mode */}
          <Link
            href="/trips/live"
            className="group p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center mb-3 group-hover:bg-[var(--brand)] transition-colors">
                <Compass className="w-4 h-4 text-orange-300 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)] mb-1">
                Trip Mode Companion
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Day-of travel safety hub with live departure countdown, NTES running status, and offline PDF ticket access.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-[var(--brand)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open Trip Mode →
            </span>
          </Link>

          {/* Card 2: Group Split */}
          <Link
            href="/group"
            className="group p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center mb-3 group-hover:bg-[var(--brand)] transition-colors">
                <Ticket className="w-4 h-4 text-orange-300 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)] mb-1">
                Group Split Booking
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Collaborative trip canvas with WhatsApp invite links, decentralized traveler manifests, and split payments.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-[var(--brand)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Explore Group Split →
            </span>
          </Link>

          {/* Card 3: True All-In Price */}
          <Link
            href="/flights/results?from=DEL&to=BOM&date=2026-11-22&allin=1"
            className="group p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center mb-3 group-hover:bg-[var(--brand)] transition-colors">
                <ShieldCheck className="w-4 h-4 text-orange-300 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)] mb-1">
                True All-In Pricing
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Zero drip pricing. Toggle all-inclusive rates (GST + convenience fees + baggage) on all search result cards.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-[var(--brand)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              See Live Demo →
            </span>
          </Link>

          {/* Card 4: Travel Intelligence Profile */}
          <Link
            href="/profile#preferences"
            className="group p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] hover:border-[var(--brand)] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center mb-3 group-hover:bg-[var(--brand)] transition-colors">
                <TrendingUp className="w-4 h-4 text-orange-300 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)] mb-1">
                Booking Intelligence
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Save personal seat, berth, bus type, and budget limits that automatically re-rank and filter search results.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-[var(--brand)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Configure Profile →
            </span>
          </Link>
        </div>
      </section>

      {/* High-Frequency Transit Sectors Table */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">
              High-Frequency Transit Sectors
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              Current lowest starting fares across major multimodal domestic corridors.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
            <TrendingUp size={14} />
            <span>Live Price Strips</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
                <th className="pb-3 font-semibold">Mode</th>
                <th className="pb-3 font-semibold">Corridor</th>
                <th className="pb-3 font-semibold">Typical Duration</th>
                <th className="pb-3 font-semibold">Starting From</th>
                <th className="pb-3 text-right font-semibold">Search</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {popularRoutes.map((r, i) => (
                <tr key={i} className="hover:bg-[var(--canvas)]/50 transition-colors group">
                  <td className="py-3.5 font-mono">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--canvas)] px-2.5 py-1 border border-[var(--line)] text-[11px] font-semibold text-[var(--ink)]">
                      {r.mode === "FLIGHT" && <Plane size={12} className="text-[var(--brand)]" />}
                      {r.mode === "TRAIN" && <Train size={12} className="text-[var(--brand)]" />}
                      {r.mode === "BUS" && <Bus size={12} className="text-[var(--brand)]" />}
                      <span>{r.mode}</span>
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-sm text-[var(--ink)]">
                    {r.from} <span className="text-[var(--ink-muted)] mx-1">→</span> {r.to}
                  </td>
                  <td className="py-3.5 text-[var(--ink-muted)] font-mono text-xs">{r.duration}</td>
                  <td className="py-3.5 font-mono text-base font-bold text-[var(--ink)]">
                    {formatINR(r.price)}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={r.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] group-hover:translate-x-0.5 transition-transform hover:underline"
                    >
                      <span>Book Now</span>
                      <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Active Promo Codes (Voucher-style coupons) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">
              Verified Discount Coupons
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              Redeemable at checkout. Discounts are mathematically re-evaluated server-side.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--ink-muted)]">
            Auto-applied on click
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activePromos.map((p) => {
            const isCopied = copiedCode === p.code;
            return (
              <div
                key={p.code}
                className="relative flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-card hover:shadow-card-hover transition-all border-dashed"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => copyCode(p.code)}
                      className="font-mono text-xs font-bold text-[var(--brand)] bg-[var(--brand-light)] px-2.5 py-1 rounded-md border border-[var(--brand)]/20 hover:border-[var(--brand)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      title="Click to copy coupon code"
                    >
                      <span>{p.code}</span>
                      {isCopied ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                    </button>
                    <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase font-semibold bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--line)]">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--ink)]">{p.title}</h3>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed">{p.desc}</p>
                </div>

                <div className="mt-4 border-t border-[var(--line)]/60 pt-3 flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)]">
                  <span>{p.min}</span>
                  {isCopied && <span className="text-emerald-700 font-bold">Copied!</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

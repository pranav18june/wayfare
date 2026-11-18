"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plane,
  Train,
  Bus,
  Hotel,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  ShieldCheck,
  Star,
} from "lucide-react";
import { formatINR, formatDuration } from "@/lib/utils/formatters";

interface InventoryCounts {
  flights: number;
  trains: number;
  buses: number;
  hotels: number;
}

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<"FLIGHT" | "TRAIN" | "BUS" | "HOTEL">("FLIGHT");
  const [counts, setCounts] = useState<InventoryCounts>({ flights: 0, trains: 0, buses: 0, hotels: 0 });
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        mode: activeTab,
        page: page.toString(),
        limit: "15",
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts || { flights: 0, trains: 0, buses: 0, hotels: 0 });
        setItems(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[var(--ink)]">
            Inventory Catalog
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Browse schedule records, route capacity, and asset inventories.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--ink-muted)]">
          Total items in catalog:{" "}
          <span className="font-semibold text-[var(--ink)]">
            {counts.flights + counts.trains + counts.buses + counts.hotels}
          </span>
        </div>
      </div>

      {/* Mode Switcher Tabs with Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveTab("FLIGHT");
            setPage(1);
            setSearch("");
          }}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            activeTab === "FLIGHT"
              ? "bg-[var(--surface)] border-[var(--brand)] ring-1 ring-[var(--brand)] shadow-sm"
              : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--ink-muted)]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span className="flex items-center gap-1.5 font-sans font-medium text-[var(--ink)]">
              <Plane className="w-4 h-4 text-[var(--brand)]" />
              Flights
            </span>
            <span className="font-semibold">{counts.flights}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-muted)]">Scheduled sectors</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("TRAIN");
            setPage(1);
            setSearch("");
          }}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            activeTab === "TRAIN"
              ? "bg-[var(--surface)] border-[var(--brand)] ring-1 ring-[var(--brand)] shadow-sm"
              : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--ink-muted)]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span className="flex items-center gap-1.5 font-sans font-medium text-[var(--ink)]">
              <Train className="w-4 h-4 text-[var(--brand)]" />
              Trains
            </span>
            <span className="font-semibold">{counts.trains}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-muted)]">Express & Rajdhani</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("BUS");
            setPage(1);
            setSearch("");
          }}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            activeTab === "BUS"
              ? "bg-[var(--surface)] border-[var(--brand)] ring-1 ring-[var(--brand)] shadow-sm"
              : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--ink-muted)]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span className="flex items-center gap-1.5 font-sans font-medium text-[var(--ink)]">
              <Bus className="w-4 h-4 text-[var(--brand)]" />
              Buses
            </span>
            <span className="font-semibold">{counts.buses}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-muted)]">Sleeper & Seater</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("HOTEL");
            setPage(1);
            setSearch("");
          }}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            activeTab === "HOTEL"
              ? "bg-[var(--surface)] border-[var(--brand)] ring-1 ring-[var(--brand)] shadow-sm"
              : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--ink-muted)]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span className="flex items-center gap-1.5 font-sans font-medium text-[var(--ink)]">
              <Hotel className="w-4 h-4 text-[var(--brand)]" />
              Hotels
            </span>
            <span className="font-semibold">{counts.hotels}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-muted)]">Verified properties</div>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "FLIGHT"
                ? "Search flight number (e.g. SL-102), airport code (DEL, BOM), airline..."
                : activeTab === "TRAIN"
                ? "Search train number (e.g. 12952), name (Rajdhani), type..."
                : activeTab === "BUS"
                ? "Search operator (e.g. Zingbus), city, bus type..."
                : "Search hotel name, locality, city..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-[var(--line)] rounded text-xs focus:outline-none focus:border-[var(--brand)] bg-[var(--canvas)]/40"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "FLIGHT" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--canvas)] border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Airline</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Stops</th>
                  <th className="py-3 px-4 text-right">Base Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                      Loading flights...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                      No flights found.
                    </td>
                  </tr>
                ) : (
                  items.map((f) => (
                    <tr key={f.id} className="hover:bg-[var(--canvas)]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--ink)]">
                        {f.number}
                      </td>
                      <td className="py-3 px-4 text-[var(--ink)] font-medium">
                        {f.airline?.name}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-semibold text-[var(--ink)]">{f.fromCode}</span>
                        <span className="text-[var(--ink-muted)] mx-1">→</span>
                        <span className="font-semibold text-[var(--ink)]">{f.toCode}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {f.departTime} - {f.arriveTime}
                      </td>
                      <td className="py-3 px-4 text-[var(--ink-muted)]">
                        {formatDuration(f.durationMin)}
                      </td>
                      <td className="py-3 px-4 text-[var(--ink-muted)] font-mono">
                        {f.stops === 0 ? "Non-stop" : `${f.stops} stop`}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--ink)]">
                        {formatINR(f.basePrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "TRAIN" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--canvas)] border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Train No.</th>
                  <th className="py-3 px-4">Train Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Terminal Stations</th>
                  <th className="py-3 px-4">Class Fares</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--ink-muted)]">
                      Loading trains...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--ink-muted)]">
                      No trains found.
                    </td>
                  </tr>
                ) : (
                  items.map((t) => (
                    <tr key={t.number} className="hover:bg-[var(--canvas)]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--ink)]">
                        {t.number}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--ink)]">
                        {t.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[var(--canvas)] text-[var(--ink)] border border-[var(--line)]">
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--ink-muted)]">
                        {t.stops?.[0]?.stationCode || "Origin"} → {t.stops?.[1]?.stationCode || "Terminus"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                          {t.classFares?.map((cf: any) => (
                            <span
                              key={cf.trainClass}
                              className="px-1.5 py-0.5 rounded bg-[var(--canvas)] text-[var(--ink)]"
                            >
                              {cf.trainClass}: {formatINR(cf.baseFare)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "BUS" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--canvas)] border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Bus Type</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Base Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--ink-muted)]">
                      Loading buses...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--ink-muted)]">
                      No buses found.
                    </td>
                  </tr>
                ) : (
                  items.map((b) => (
                    <tr key={b.id} className="hover:bg-[var(--canvas)]/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--ink)]">
                        {b.operator?.name}
                      </td>
                      <td className="py-3 px-4 text-[var(--ink-muted)]">
                        {b.type}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {b.fromCity?.name} → {b.toCity?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {b.departTime} - {b.arriveTime}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          {b.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--ink)]">
                        {formatINR(b.basePrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "HOTEL" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--canvas)] border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">City / Locality</th>
                  <th className="py-3 px-4">Stars</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Room Types</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--ink-muted)]">
                      Loading hotels...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--ink-muted)]">
                      No hotels found.
                    </td>
                  </tr>
                ) : (
                  items.map((h) => (
                    <tr key={h.id} className="hover:bg-[var(--canvas)]/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--ink)]">
                        {h.name}
                      </td>
                      <td className="py-3 px-4 text-[var(--ink-muted)]">
                        {h.locality}, {h.city?.name}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {h.stars} Star
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          {h.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--ink-muted)]">
                        {h.rooms?.length || 0} configured room categories
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
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

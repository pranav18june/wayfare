"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Clock, ArrowRight, PlusCircle, AlertCircle } from "lucide-react";

export default function MyGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/group/my-groups")
      .then((res) => res.json())
      .then((data) => {
        if (data.groups) setGroups(data.groups);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--brand)]" />
            Group Bookings & Split Trips
          </h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Coordinate travel with friends or family, collect traveler info, and split payments.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[var(--ink)] text-white hover:bg-black transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Plan New Group Trip
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm font-mono text-[var(--ink-muted)]">
          <Clock className="w-4 h-4 animate-spin inline-block mr-2 text-[var(--brand)]" />
          Loading your group trips...
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--line)] p-12 text-center max-w-lg mx-auto">
          <Users className="w-12 h-12 text-[var(--ink-muted)] mx-auto mb-3 stroke-1" />
          <h3 className="text-base font-bold text-[var(--ink)]">No group trips yet</h3>
          <p className="text-xs text-[var(--ink-muted)] mt-1 mb-6">
            Search any flight, train, or bus on Wayfare and click &quot;Group Booking&quot; on the card to generate an invite canvas.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-[var(--brand)] hover:bg-[#d04f0a] text-white font-medium text-xs rounded-lg transition-colors"
          >
            Explore Travel Routes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-xl border border-[var(--line)] p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 text-[var(--ink)]">
                    {g.mode} GROUP
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      g.status === "OPEN"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <h3 className="font-bold text-[var(--ink)] text-base">
                  {g.selectedItem?.title ||
                    g.selectedItem?.name ||
                    g.selectedItem?.number ||
                    `${g.mode} Journey`}
                </h3>

                <p className="text-xs text-[var(--ink-muted)] mt-1">
                  Organized by: {g.isCreator ? "You" : g.creator?.name} · Token #{g.token}
                </p>

                <div className="mt-4 pt-4 border-t border-[var(--line)]/60 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[var(--ink-muted)] text-[10px] uppercase block">
                      Per Head Split
                    </span>
                    <span className="font-bold text-[var(--brand)]">
                      ₹{g.pricePerHead.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--ink-muted)] text-[10px] uppercase block">
                      Roster Status
                    </span>
                    <span className="font-bold text-[var(--ink)]">
                      {g.memberCount} of {g.maxMembers} joined
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--line)]/60 flex items-center justify-between">
                <span className="text-xs text-[var(--ink-muted)]">
                  {new Date(g.createdAt).toLocaleDateString("en-IN")}
                </span>
                <Link
                  href={`/group/${g.token}`}
                  className="text-xs font-medium text-[var(--brand)] hover:underline flex items-center gap-1"
                >
                  Open Canvas
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import { Bell, Plus, Trash2, CheckCircle2, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New alert form state
  const [from, setFrom] = useState("DEL");
  const [to, setTo] = useState("BOM");
  const [targetPrice, setTargetPrice] = useState("3500");
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const json = await res.json();
        setAlerts(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAlert(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "FLIGHT",
          from: from.trim().toUpperCase(),
          to: to.trim().toUpperCase(),
          targetPrice: parseFloat(targetPrice),
        }),
      });

      if (res.ok) {
        setIsCreating(false);
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAlert(id: string) {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--ink)]">Flight Price Alerts</h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Set fare targets. We notify you instantly when airline algorithms drop prices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-ink)] shadow-sm self-start"
        >
          <Plus size={14} />
          <span>Create Alert</span>
        </button>
      </div>

      {/* New Alert Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateAlert}
          className="mb-6 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm text-xs"
        >
          <h2 className="text-xs font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
            Set New Fare Target
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--ink-muted)] mb-1">
                From Airport (Code)
              </label>
              <input
                type="text"
                required
                maxLength={3}
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                placeholder="e.g. DEL"
                className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 font-mono text-xs uppercase text-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--ink-muted)] mb-1">
                To Airport (Code)
              </label>
              <input
                type="text"
                required
                maxLength={3}
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                placeholder="e.g. BOM"
                className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 font-mono text-xs uppercase text-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--ink-muted)] mb-1">
                Target Maximum Fare (₹)
              </label>
              <input
                type="number"
                required
                min={1000}
                step={100}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="3500"
                className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 font-mono text-xs text-[var(--ink)]"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded border border-[var(--line)] px-3 py-1.5 font-medium text-[var(--ink)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-[var(--brand)] px-4 py-1.5 font-semibold text-white hover:bg-[var(--brand-ink)] disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Alert"}
            </button>
          </div>
        </form>
      )}

      {/* Alerts List */}
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--ink)] mb-4 uppercase tracking-wider">
          Tracked Routes
        </h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--ink-muted)]">
            Checking live flight fares...
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--ink-muted)]">
            No active price alerts. Click &ldquo;Create Alert&rdquo; above to track any domestic corridor.
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {alerts.map((a) => {
              const isTriggered = a.status === "TRIGGERED";
              return (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--line)]">
                        {a.mode}
                      </span>
                      <span className="font-bold text-[var(--ink)] text-sm">
                        {a.route?.from || "DEL"} → {a.route?.to || "BOM"}
                      </span>
                      {isTriggered ? (
                        <span className="flex items-center gap-1 rounded bg-[#E6F4EA] px-2 py-0.5 font-mono font-bold text-[10px] text-[var(--ok)] border border-[#CEEAD6]">
                          <CheckCircle2 size={11} />
                          <span>Target Hit!</span>
                        </span>
                      ) : (
                        <span className="rounded bg-[var(--canvas)] px-2 py-0.5 font-mono font-bold text-[10px] text-[var(--ink-muted)] border border-[var(--line)]">
                          Monitoring
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-4 text-[11px] text-[var(--ink-muted)] font-mono">
                      <span>Target: {formatINR(a.targetPrice)}</span>
                      {a.currentPrice && <span>Current: {formatINR(a.currentPrice)}</span>}
                      <span>Created: {formatDate(a.createdAt, "d MMM yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isTriggered && (
                      <Link
                        href={`/flights/results?from=${a.route?.from}&to=${a.route?.to}&date=2026-11-22`}
                        className="flex items-center gap-1 rounded bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brand-ink)]"
                      >
                        <span>Book Now</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-1 text-[var(--ink-muted)] hover:text-[var(--danger)]"
                      title="Delete Alert"
                    >
                      <Trash2 size={15} />
                    </button>
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

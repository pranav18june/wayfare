"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LiveRunningStatusResult } from "@/server/providers/types";
import { Activity, Clock, MapPin, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

function RunningStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTrain = searchParams.get("train") || "";
  const initialDate = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const [trainInput, setTrainInput] = useState(initialTrain);
  const [dateInput, setDateInput] = useState(initialDate);
  const [data, setData] = useState<LiveRunningStatusResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTrain) {
      handleLookup(initialTrain, initialDate);
    }
  }, [initialTrain, initialDate]);

  async function handleLookup(trainNo: string, runDate: string) {
    if (!trainNo.trim()) {
      setError("Please enter a valid train number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/trains/running-status?train=${encodeURIComponent(trainNo)}&date=${runDate}`
      );
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || "No live running status found for this train.");
        setData(null);
      }
    } catch {
      setError("Failed to fetch running status.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLookup(trainInput, dateInput);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--ink)]">Live Train Running Status</h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Real-time GPS-simulated train positions, station delays, and estimated arrival times.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm mb-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Train Number or Name
            </label>
            <input
              type="text"
              value={trainInput}
              onChange={(e) => {
                setTrainInput(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. 12952 or Rajdhani"
              className="h-10 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-mono text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Journey Date
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="h-10 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-mono text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-[var(--ink)] text-xs font-semibold text-white hover:bg-black transition-colors disabled:opacity-50"
            >
              <Activity size={14} />
              <span>{loading ? "Tracking..." : "Track"}</span>
            </button>
          </div>
        </form>

        {error && <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>}

        <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
          <span>Popular Trains:</span>
          <button
            type="button"
            onClick={() => {
              setTrainInput("12952");
              handleLookup("12952", dateInput);
            }}
            className="font-mono text-[var(--accent)] hover:underline"
          >
            12952 (Mumbai Rajdhani)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setTrainInput("12004");
              handleLookup("12004", dateInput);
            }}
            className="font-mono text-[var(--accent)] hover:underline"
          >
            12004 (Shatabdi)
          </button>
        </div>
      </div>

      {/* Live Timeline Display */}
      {data && (
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
          {/* Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--line)]">
                  {data.trainNumber}
                </span>
                <span className="text-base font-bold text-[var(--ink)]">{data.trainName}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                <span>Current Location: <strong>{data.currentStationName}</strong></span>
                <span>•</span>
                <span className="font-mono">Updated: {data.lastUpdated}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              {data.isDelayed ? (
                <div className="flex items-center gap-1.5 rounded bg-[#FEF7E0] px-3 py-1 text-xs font-mono font-bold text-[var(--warn)] border border-[#FEEFC3]">
                  <Clock size={14} />
                  <span>Running {data.overallDelayMins}m Late</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded bg-[#E6F4EA] px-3 py-1 text-xs font-mono font-bold text-[var(--ok)] border border-[#CEEAD6]">
                  <CheckCircle2 size={14} />
                  <span>Right On Time</span>
                </div>
              )}
            </div>
          </div>

          {/* Station Timeline Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--ink-muted)]">
                  <th className="pb-2 font-medium">Station</th>
                  <th className="pb-2 font-medium">Sched. Arr / Dep</th>
                  <th className="pb-2 font-medium">Actual / Exp</th>
                  <th className="pb-2 font-medium">Delay</th>
                  <th className="pb-2 font-medium">Halt</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-mono">
                {data.timeline.map((st) => {
                  const isCurrent = st.status === "CURRENT";
                  const isDeparted = st.status === "DEPARTED";

                  return (
                    <tr
                      key={st.stationCode}
                      className={
                        isCurrent
                          ? "bg-[#FFF4ED] font-semibold text-[var(--ink)]"
                          : isDeparted
                          ? "opacity-75 hover:bg-[var(--canvas)]"
                          : "hover:bg-[var(--canvas)]"
                      }
                    >
                      <td className="py-3 font-sans">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              isCurrent
                                ? "bg-[var(--brand)] animate-ping"
                                : isDeparted
                                ? "bg-[var(--ok)]"
                                : "bg-[var(--line)]"
                            }`}
                          />
                          <div>
                            <span className="font-bold text-[var(--ink)]">{st.stationName}</span>
                            <span className="ml-1 text-[11px] text-[var(--ink-muted)]">
                              ({st.stationCode})
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-[var(--ink-muted)]">
                        {st.scheduledArrival || "Origin"} / {st.scheduledDeparture || "Terminus"}
                      </td>

                      <td className="py-3 font-bold text-[var(--ink)]">
                        {st.expectedArrival || "Origin"} / {st.expectedDeparture || "Terminus"}
                      </td>

                      <td className="py-3">
                        {st.delayMins > 0 ? (
                          <span className="text-[var(--warn)] font-bold">+{st.delayMins}m</span>
                        ) : (
                          <span className="text-[var(--ok)] font-medium">On time</span>
                        )}
                      </td>

                      <td className="py-3 text-[var(--ink-muted)]">
                        {st.haltMins > 0 ? `${st.haltMins}m` : "—"}
                      </td>

                      <td className="py-3 text-right">
                        {isCurrent ? (
                          <span className="rounded bg-[var(--brand)] text-white px-2 py-0.5 text-[10px] uppercase font-bold">
                            Current
                          </span>
                        ) : isDeparted ? (
                          <span className="text-[var(--ok)] font-medium text-[11px]">Departed</span>
                        ) : (
                          <span className="text-[var(--ink-muted)] text-[11px]">Upcoming</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RunningStatusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading train status...</div>}>
      <RunningStatusContent />
    </Suspense>
  );
}

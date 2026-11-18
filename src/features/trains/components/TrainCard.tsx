"use client";

import { useState } from "react";
import { TrainResult, TrainClassAvailability } from "@/server/providers/types";
import { formatINR, formatDuration } from "@/lib/utils/formatters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ChevronDown, ChevronUp, Calendar, Clock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface TrainCardProps {
  train: TrainResult;
  searchDate: string;
  quota: string;
  onBookClass: (train: TrainResult, classItem: TrainClassAvailability) => void;
}

export function TrainCard({
  train,
  searchDate,
  quota,
  onBookClass,
}: TrainCardProps) {
  const [selectedClass, setSelectedClass] = useState<TrainClassAvailability | null>(null);
  const [expansionData, setExpansionData] = useState<
    { date: string; status: string; count: number; fare: number }[] | null
  >(null);
  const [loadingExpansion, setLoadingExpansion] = useState(false);

  // Toggle 7-day availability expansion for a class
  async function handleToggleClass(cls: TrainClassAvailability) {
    if (selectedClass?.classCode === cls.classCode) {
      setSelectedClass(null);
      setExpansionData(null);
      return;
    }

    setSelectedClass(cls);
    setLoadingExpansion(true);
    try {
      const res = await fetch(
        `/api/trains/availability?train=${train.trainNumber}&date=${searchDate}&class=${cls.classCode}&quota=${quota}&days=7`
      );
      if (res.ok) {
        const data = await res.json();
        setExpansionData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExpansion(false);
    }
  }

  // Days of week active
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card hover:shadow-card-hover transition-all">
      {/* Header: Train Number, Name, Type & Schedule Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-white bg-[var(--ink)] px-2.5 py-1 rounded-lg shadow-2xs">
            {train.trainNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--ink)]">{train.trainName}</h3>
              <span className="font-mono text-[10px] text-[var(--brand)] bg-[var(--brand-light)] font-bold px-2 py-0.5 rounded border border-[var(--brand)]/20 uppercase">
                {train.trainType}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[var(--ink-muted)]">
              Daily Express Service · IRCTC Certified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Running Days */}
          <div className="flex items-center gap-1 text-[11px] text-[var(--ink-muted)] font-mono">
            <span className="mr-1 text-[10px] uppercase font-semibold">Runs:</span>
            {daysOfWeek.map((day, idx) => (
              <span
                key={idx}
                className="flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                {day}
              </span>
            ))}
          </div>

          <Link
            href={`/trains/${train.trainNumber}`}
            className="text-xs font-semibold text-[var(--brand)] hover:underline inline-flex items-center gap-0.5 ml-1"
          >
            <span>Timetable</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Timing and Station Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center py-5">
        {/* Departure */}
        <div className="sm:col-span-4 text-left">
          <div className="font-mono text-2xl font-bold text-[var(--ink)] tracking-tight">
            {train.departureTime}
          </div>
          <div className="font-mono text-xs font-bold text-[var(--ink-muted)] mt-0.5">
            {train.fromStation}
          </div>
        </div>

        {/* Duration */}
        <div className="sm:col-span-4 flex flex-col items-center">
          <div className="flex items-center gap-1 font-mono text-xs text-[var(--ink-muted)] font-medium">
            <Clock size={13} />
            <span>{formatDuration(train.durationMin)}</span>
          </div>
          <div className="relative my-2 flex items-center justify-center w-28 sm:w-36">
            <div className="h-[1.5px] w-full bg-[var(--line)]" />
            <div className="absolute h-2 w-2 rounded-full border-2 border-white bg-[var(--brand)]" />
          </div>
          <span className="text-[10px] font-mono text-[var(--ink-muted)]">Direct Transit</span>
        </div>

        {/* Arrival */}
        <div className="sm:col-span-4 text-right">
          <div className="font-mono text-2xl font-bold text-[var(--ink)] tracking-tight">
            {train.arrivalTime}
          </div>
          <div className="font-mono text-xs font-bold text-[var(--ink-muted)] mt-0.5">
            {train.toStation}
          </div>
        </div>
      </div>

      {/* Class Availability Chips Grid */}
      <div className="border-t border-[var(--line)] pt-4">
        <div className="mb-3 flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
          <span className="text-[11px]">Select travel class to view 7-day calendar & confirmation probability</span>
          <span className="text-[11px] font-bold text-[var(--ink)] bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--line)]">
            QUOTA: {quota}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
          {train.classes.map((cls) => {
            const isExpanded = selectedClass?.classCode === cls.classCode;
            return (
              <button
                key={cls.classCode}
                type="button"
                onClick={() => handleToggleClass(cls)}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  isExpanded
                    ? "border-[var(--brand)] bg-orange-50/30 ring-2 ring-[var(--brand)]/30 shadow-xs"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand)]/60 hover:shadow-2xs"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[var(--ink)]">
                    {cls.classCode}
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--ink)]">
                    {formatINR(cls.fare)}
                  </span>
                </div>

                <div className="mt-2.5 flex w-full items-center justify-between">
                  <StatusBadge status={cls.status} count={cls.count} />
                  <span className="text-[var(--ink-muted)]">
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7-Day Expanded Availability Strip & WL Confirmation Prediction */}
      {selectedClass && (
        <div className="mt-5 rounded-xl border border-[var(--brand)]/30 bg-orange-50/20 p-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3.5 mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[var(--brand)]" />
              <span className="font-bold text-sm text-[var(--ink)]">
                Next 7-Days Seat Calendar · Class {selectedClass.classCode}
              </span>
            </div>

            {/* WL / RAC Confirmation Probability Heuristic (Section 2.2 B) */}
            {selectedClass.probabilityPercent !== undefined && (
              <div className="flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-3 py-1.5 border border-[var(--line)] shadow-2xs">
                <ShieldCheck size={14} className="text-[var(--brand)]" />
                <span className="text-xs text-[var(--ink-muted)]">Confirmation Chance:</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    selectedClass.probabilityRating === "HIGH"
                      ? "text-emerald-700"
                      : selectedClass.probabilityRating === "MEDIUM"
                      ? "text-amber-700"
                      : "text-rose-700"
                  }`}
                >
                  {selectedClass.probabilityPercent}% ({selectedClass.probabilityRating})
                </span>
                <span className="text-[10px] text-[var(--ink-muted)]">(Heuristic)</span>
              </div>
            )}
          </div>

          {loadingExpansion ? (
            <div className="py-6 text-center text-xs text-[var(--ink-muted)] font-mono animate-pulse">
              Consulting IRCTC seat matrix for Class {selectedClass.classCode}...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {(expansionData || []).map((exp) => {
                let formattedDay = exp.date;
                try {
                  formattedDay = format(parseISO(exp.date), "EEE, d MMM");
                } catch {
                  // fallback
                }

                return (
                  <div
                    key={exp.date}
                    className="flex flex-col items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 text-center shadow-2xs hover:border-[var(--brand)]/50 transition-colors"
                  >
                    <span className="text-[11px] font-mono text-[var(--ink-muted)]">{formattedDay}</span>
                    <div className="my-2">
                      <StatusBadge status={exp.status} count={exp.count} />
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--ink)]">
                      {formatINR(exp.fare)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Direct Book CTA for Selected Class */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <span className="text-xs text-[var(--ink-muted)]">
              Base Fare: <strong className="font-mono font-bold text-[var(--ink)]">{formatINR(selectedClass.fare)}</strong> per passenger (IRCTC statutory charges included)
            </span>
            <button
              type="button"
              onClick={() => onBookClass(train, selectedClass)}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[var(--brand-hover)] active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <span>Instant Book Class {selectedClass.classCode}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

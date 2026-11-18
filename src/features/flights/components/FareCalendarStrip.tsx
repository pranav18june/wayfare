"use client";

import { DayFare } from "@/server/providers/types";
import { formatINR } from "@/lib/utils/formatters";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

interface FareCalendarStripProps {
  days: DayFare[];
  currentDate: string;
  onSelectDate: (date: string) => void;
}

export function FareCalendarStrip({
  days,
  currentDate,
  onSelectDate,
}: FareCalendarStripProps) {
  if (days.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-card">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-[var(--ink-muted)] border-r border-[var(--line)] shrink-0">
          <Calendar size={14} className="text-[var(--brand)]" />
          <span>±3 Days Strip</span>
        </div>

        {days.map((d) => {
          const isSelected = d.date === currentDate;
          let dayDisplay = d.date;
          let weekday = "";
          try {
            const dt = parseISO(d.date);
            dayDisplay = format(dt, "d MMM");
            weekday = format(dt, "EEE");
          } catch {
            // fallback
          }

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelectDate(d.date)}
              className={`flex min-w-[96px] flex-1 flex-col items-center justify-center rounded-lg px-3 py-2 text-xs transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-orange-50/50 border border-[var(--brand)] text-[var(--brand)] font-bold shadow-xs"
                  : "hover:bg-[var(--canvas)] text-[var(--ink)] border border-transparent"
              }`}
            >
              <span className="text-[10px] font-mono text-[var(--ink-muted)] font-normal">{weekday}</span>
              <span className="font-semibold text-xs mt-0.5">{dayDisplay}</span>
              <span
                className={`font-mono text-xs mt-1 ${
                  isSelected ? "text-[var(--brand)] font-bold" : "text-emerald-700 font-semibold"
                }`}
              >
                {d.available && d.minFare > 0 ? formatINR(d.minFare) : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

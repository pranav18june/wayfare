"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string;
  error?: string;
  className?: string;
  fareHint?: string;
  id?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  error,
  className = "",
  fareHint,
  id,
}: DatePickerProps) {
  const inputId = id || `datepicker-${label.toLowerCase().replace(/\s+/g, "-")}`;

  let formattedDisplay = value;
  try {
    if (value) {
      formattedDisplay = format(parseISO(value), "EEE, d MMM yyyy");
    }
  } catch {
    // fallback
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={inputId} className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
          {label}
        </label>
        {fareHint && (
          <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            {fareHint}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={inputId}
          type="date"
          value={value}
          min={minDate}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] font-mono font-medium transition-all focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none shadow-xs ${
            error ? "border-rose-400 bg-rose-50/20" : "border-[var(--line)] hover:border-[var(--ink-muted)]"
          }`}
        />
        <div className="pointer-events-none absolute right-3 top-3 text-[var(--ink-muted)]">
          <CalendarIcon size={16} />
        </div>
      </div>

      {formattedDisplay && (
        <span className="mt-1 text-[11px] text-[var(--ink-muted)]">
          {formattedDisplay}
        </span>
      )}

      {error && (
        <span id={`${inputId}-error`} className="mt-1 text-xs text-[var(--danger)]">
          {error}
        </span>
      )}
    </div>
  );
}

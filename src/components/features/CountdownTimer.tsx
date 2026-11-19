"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetTime: string; // ISO string or "HH:mm on YYYY-MM-DD"
}

function parseTarget(targetTime: string): Date | null {
  // Try ISO first
  const d = new Date(targetTime);
  if (!isNaN(d.getTime())) return d;

  // Try "HH:mm on YYYY-MM-DD"
  const match = targetTime.match(/^(\d{2}:\d{2}) on (\d{4}-\d{2}-\d{2})$/);
  if (match) {
    const parsed = new Date(`${match[2]}T${match[1]}:00`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function formatDiff(ms: number): {
  label: string;
  variant: "future-far" | "future-near" | "urgent" | "departed";
  progressPct?: number;
} {
  if (ms <= 0) {
    return { label: "Departed", variant: "departed" };
  }

  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);

  if (ms > 24 * 3600 * 1000) {
    return { label: `Departs tomorrow`, variant: "future-far" };
  }

  if (ms > 3600 * 1000) {
    // 1-24h: show progress bar (how much of the remaining day is gone)
    const dayMs = 24 * 3600 * 1000;
    const progressPct = Math.round(((dayMs - ms) / dayMs) * 100);
    return {
      label: `${h}h ${m}m remaining`,
      variant: "future-near",
      progressPct,
    };
  }

  // < 1h: urgent
  return { label: `${m} min remaining`, variant: "urgent" };
}

export function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  const target = parseTarget(targetTime);

  if (!target) {
    return (
      <span className="font-mono text-sm text-[var(--ink-muted)]">
        Time unavailable
      </span>
    );
  }

  const diffMs = target.getTime() - now.getTime();
  const { label, variant, progressPct } = formatDiff(diffMs);

  const targetLabel = target.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Clock
          className={`w-4 h-4 shrink-0 ${
            variant === "urgent"
              ? "text-[var(--brand)]"
              : variant === "departed"
              ? "text-[var(--ink-muted)]"
              : "text-[var(--ink)]"
          }`}
        />
        <span
          className={`font-mono text-sm font-semibold tracking-tight ${
            variant === "urgent"
              ? "text-[var(--brand)]"
              : variant === "departed"
              ? "text-[var(--ink-muted)]"
              : "text-[var(--ink)]"
          }`}
          style={{ fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)" }}
        >
          {label}
        </span>
        {variant === "future-far" && (
          <span className="text-xs text-[var(--ink-muted)] font-mono">
            at {targetLabel}
          </span>
        )}
      </div>

      {variant === "future-near" && progressPct !== undefined && (
        <div className="h-1.5 bg-[var(--line)] rounded-full overflow-hidden w-full">
          <div
            className="h-full bg-[var(--ink)] rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

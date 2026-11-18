"use client";

import { useState, useRef, useEffect } from "react";
import { Users, ChevronDown, Plus, Minus } from "lucide-react";

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
  cabin: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS";
}

interface PassengerSelectorProps {
  value: PassengerCount;
  onChange: (value: PassengerCount) => void;
  className?: string;
  showCabin?: boolean;
}

export function PassengerSelector({
  value,
  onChange,
  className = "",
  showCabin = true,
}: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = value.adults + value.children + value.infants;

  function updateCount(type: "adults" | "children" | "infants", delta: number) {
    const currentTotal = value.adults + value.children + value.infants;
    if (delta > 0 && currentTotal >= 9) return; // Max 9 passengers

    const nextVal = { ...value };
    if (type === "adults") {
      const nextAdults = Math.max(1, value.adults + delta);
      nextVal.adults = nextAdults;
      // Constraint: infants cannot exceed adults
      if (nextVal.infants > nextAdults) {
        nextVal.infants = nextAdults;
      }
    } else if (type === "children") {
      nextVal.children = Math.max(0, value.children + delta);
    } else if (type === "infants") {
      const nextInfants = Math.max(0, value.infants + delta);
      if (nextInfants <= value.adults) {
        nextVal.infants = nextInfants;
      }
    }

    onChange(nextVal);
  }

  return (
    <div ref={containerRef} className={`relative flex flex-col ${className}`}>
      <span className="mb-1 text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
        Travellers & Class
      </span>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] hover:border-[var(--ink-muted)] transition-all shadow-xs"
      >
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[var(--ink-muted)]" />
          <span className="font-medium">
            {total} {total === 1 ? "Traveller" : "Travellers"}
            {showCabin && (
              <span className="ml-1 text-xs text-[var(--ink-muted)]">
                • {value.cabin.replace("_", " ")}
              </span>
            )}
          </span>
        </div>
        <ChevronDown size={14} className="text-[var(--ink-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 shadow-dropdown">
          <div className="flex flex-col gap-3">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--ink)]">Adults</div>
                <div className="text-[11px] text-[var(--ink-muted)]">12+ years</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateCount("adults", -1)}
                  disabled={value.adults <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-40"
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center font-mono text-sm font-semibold">
                  {value.adults}
                </span>
                <button
                  type="button"
                  onClick={() => updateCount("adults", 1)}
                  disabled={total >= 9}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-40"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--ink)]">Children</div>
                <div className="text-[11px] text-[var(--ink-muted)]">2 - 12 years</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateCount("children", -1)}
                  disabled={value.children <= 0}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-40"
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center font-mono text-sm font-semibold">
                  {value.children}
                </span>
                <button
                  type="button"
                  onClick={() => updateCount("children", 1)}
                  disabled={total >= 9}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-40"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--ink)]">Infants</div>
                <div className="text-[11px] text-[var(--ink-muted)]">Under 2 years (on lap)</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateCount("infants", -1)}
                  disabled={value.infants <= 0}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-40"
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center font-mono text-sm font-semibold">
                  {value.infants}
                </span>
                <button
                  type="button"
                  onClick={() => updateCount("infants", 1)}
                  disabled={total >= 9 || value.infants >= value.adults}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-40"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Cabin Class Selection */}
            {showCabin && (
              <div className="mt-2 border-t border-[var(--line)] pt-3">
                <div className="mb-2 text-xs font-semibold text-[var(--ink)]">Cabin Class</div>
                <div className="flex flex-col gap-1.5">
                  {(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"] as const).map((cls) => (
                    <label key={cls} className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="cabin"
                        checked={value.cabin === cls}
                        onChange={() => onChange({ ...value, cabin: cls })}
                        className="text-[var(--accent)]"
                      />
                      <span>{cls.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full rounded-md bg-[var(--ink)] py-1.5 text-xs font-semibold text-white hover:bg-black"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Train, Bus, Building2, FileSearch, Activity } from "lucide-react";

interface ModeNavProps {
  currentMode?: "FLIGHT" | "TRAIN" | "BUS" | "HOTEL" | "PNR" | "RUNNING_STATUS";
  onSelectMode?: (mode: "FLIGHT" | "TRAIN" | "BUS" | "HOTEL" | "PNR" | "RUNNING_STATUS") => void;
}

export function ModeNav({ currentMode = "FLIGHT", onSelectMode }: ModeNavProps) {
  const pathname = usePathname();

  const modes = [
    { id: "FLIGHT", label: "Flights", icon: Plane, href: "/flights", badge: "Live Fares" },
    { id: "TRAIN", label: "Trains", icon: Train, href: "/trains", badge: "IRCTC Direct" },
    { id: "BUS", label: "Buses", icon: Bus, href: "/buses", badge: "Seat Map" },
    { id: "HOTEL", label: "Hotels", icon: Building2, href: "/hotels", badge: "Free Cancel" },
    { id: "PNR", label: "PNR Status", icon: FileSearch, href: "/trains/pnr" },
    { id: "RUNNING_STATUS", label: "Live Running Status", icon: Activity, href: "/trains/running-status" },
  ] as const;

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-1.5 shadow-card">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = currentMode === m.id || (onSelectMode ? false : pathname === m.href);

          if (onSelectMode) {
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[var(--ink)] text-white font-semibold shadow-xs"
                    : "text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon size={15} strokeWidth={isSelected ? 2 : 1.75} className={isSelected ? "text-[var(--brand)]" : ""} />
                <span>{m.label}</span>
                {isSelected && "badge" in m && (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/20 text-white font-bold ml-1">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={m.id}
              href={m.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-[var(--ink)] text-white font-semibold shadow-xs"
                  : "text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
              }`}
            >
              <Icon size={15} strokeWidth={isSelected ? 2 : 1.75} className={isSelected ? "text-[var(--brand)]" : ""} />
              <span>{m.label}</span>
              {isSelected && "badge" in m && (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/20 text-white font-bold ml-1">
                  {m.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

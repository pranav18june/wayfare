"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Settings2, Sliders } from "lucide-react";

interface Preferences {
  preferredClass?: string | null;
  preferredSeatType?: string | null;
  preferredDepartTime?: string | null;
  budgetMax?: number | null;
}

export function PersonalizationBadge() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  useEffect(() => {
    fetch("/api/preferences")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.preferences) {
          setPrefs(data.preferences);
        }
      })
      .catch(() => {});
  }, []);

  if (!prefs) return null;

  const highlights = [];
  if (prefs.preferredClass) highlights.push(`Class ${prefs.preferredClass}`);
  if (prefs.preferredSeatType) highlights.push(prefs.preferredSeatType.toLowerCase());
  if (prefs.budgetMax) highlights.push(`Max ₹${prefs.budgetMax}`);

  if (highlights.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
      <span className="flex items-center gap-1 font-semibold text-amber-900 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
        Personalised:
      </span>
      <span className="text-amber-800 font-mono truncate max-w-[200px] sm:max-w-none">
        {highlights.join(" · ")}
      </span>
      <Link
        href="/profile#preferences"
        className="text-[var(--brand)] hover:underline ml-1 font-medium flex items-center gap-0.5"
      >
        <Sliders className="w-3 h-3" />
        Adjust
      </Link>
    </div>
  );
}

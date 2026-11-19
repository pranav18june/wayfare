"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Info, ShieldCheck } from "lucide-react";

interface AllInPriceToggleProps {
  className?: string;
}

export function AllInPriceToggle({ className = "" }: AllInPriceToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allIn, setAllIn] = useState<boolean>(() => {
    return searchParams.get("allin") === "1";
  });

  useEffect(() => {
    const isUrlAllIn = searchParams.get("allin") === "1";
    if (isUrlAllIn !== allIn) {
      setAllIn(isUrlAllIn);
    }
  }, [searchParams]);

  const handleToggle = () => {
    const nextVal = !allIn;
    setAllIn(nextVal);

    if (typeof window !== "undefined") {
      localStorage.setItem("wayfare_allin_price", nextVal ? "true" : "false");
    }

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (nextVal) {
      current.set("allin", "1");
    } else {
      current.delete("allin");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  return (
    <div
      className={`inline-flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-[var(--line)] shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2">
        <label
          htmlFor="all-in-switch"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="relative inline-flex items-center">
            <input
              id="all-in-switch"
              type="checkbox"
              checked={allIn}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--brand)]"></div>
          </div>
          <span className="text-xs font-semibold text-[var(--ink)]">
            All-In Price
          </span>
        </label>
      </div>

      <div className="h-3 w-px bg-[var(--line)] hidden sm:block" />

      <span className="text-[11px] text-[var(--ink-muted)] hidden sm:inline flex items-center gap-1 font-mono">
        <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
        {allIn ? "Taxes & convenience fee included" : "Base fare view"}
      </span>
    </div>
  );
}

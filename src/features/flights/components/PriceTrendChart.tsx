"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";

interface PriceTrendChartProps {
  from: string;
  to: string;
}

interface TrendPoint {
  date: string;
  price: number;
}

export function PriceTrendChart({ from, to }: PriceTrendChartProps) {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [advice, setAdvice] = useState<string>("");
  const [isRising, setIsRising] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const res = await fetch(`/api/flights/trends?from=${from}&to=${to}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.history || []);
          setAdvice(json.advice || "");
          setIsRising(json.trend === "RISING");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, [from, to]);

  if (loading || data.length === 0) return null;

  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isRising ? (
            <TrendingUp size={16} className="text-[var(--warn)]" />
          ) : (
            <TrendingDown size={16} className="text-[var(--ok)]" />
          )}
          <h3 className="text-xs font-bold text-[var(--ink)]">
            30-Day Fare Trend ({from} → {to})
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
          <Info size={13} />
          <span className="text-[11px] font-medium text-[var(--ink)]">{advice}</span>
        </div>
      </div>

      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fareGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B5D63" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0B5D63" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "#E3DFD6" }}
              tick={{ fill: "#5B6472", fontSize: 10, fontFamily: "var(--font-mono)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#E3DFD6" }}
              tick={{ fill: "#5B6472", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickFormatter={(v) => `₹${v}`}
              domain={["dataMin - 200", "dataMax + 200"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  const d = payload[0].payload.date;
                  return (
                    <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-2 shadow-dropdown text-xs">
                      <div className="text-[10px] text-[var(--ink-muted)]">{d}</div>
                      <div className="font-mono font-bold text-[var(--brand)]">
                        {formatINR(val)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#0B5D63"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fareGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Train, Clock, MapPin } from "lucide-react";

export default async function TrainSchedulePage({
  params,
}: {
  params: { number: string };
}) {
  const trainNumber = params.number;

  const train = await prisma.train.findUnique({
    where: { number: trainNumber },
    include: {
      stops: {
        orderBy: { seq: "asc" },
      },
    },
  });

  if (!train) {
    notFound();
  }

  // Get station names
  const stationCodes = train.stops.map((s) => s.stationCode);
  const stations = await prisma.station.findMany({
    where: { code: { in: stationCodes } },
  });
  const stationMap = new Map(stations.map((s) => [s.code, s.name]));

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3 border-b border-[var(--line)] pb-4">
        <Link
          href="/trains"
          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--line)]">
              {train.number}
            </span>
            <h1 className="text-lg font-bold text-[var(--ink)]">{train.name}</h1>
          </div>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            Type: {train.type} • Operating daily across {train.stops.length} major stations
          </p>
        </div>
      </div>

      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-xs font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
          Complete Route Timetable & Halts
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--ink-muted)]">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Station</th>
                <th className="pb-2 font-medium">Arrival</th>
                <th className="pb-2 font-medium">Departure</th>
                <th className="pb-2 font-medium">Halt</th>
                <th className="pb-2 font-medium">Distance</th>
                <th className="pb-2 text-right font-medium">Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono">
              {train.stops.map((s) => {
                const name = stationMap.get(s.stationCode) || s.stationCode;
                let haltMins = 0;
                if (s.arrival && s.departure) {
                  const [ah, am] = s.arrival.split(":").map(Number);
                  const [dh, dm] = s.departure.split(":").map(Number);
                  haltMins = (dh * 60 + dm) - (ah * 60 + am);
                  if (haltMins < 0) haltMins += 1440;
                }

                return (
                  <tr key={s.id} className="hover:bg-[var(--canvas)]">
                    <td className="py-2.5 text-[var(--ink-muted)]">{s.seq}</td>
                    <td className="py-2.5 font-sans font-medium text-[var(--ink)]">
                      {name} <span className="font-mono text-[11px] text-[var(--ink-muted)]">({s.stationCode})</span>
                    </td>
                    <td className="py-2.5 text-[var(--ink-muted)]">{s.arrival || "Origin"}</td>
                    <td className="py-2.5 font-bold text-[var(--ink)]">{s.departure || "Terminus"}</td>
                    <td className="py-2.5 text-[var(--ink-muted)]">{haltMins > 0 ? `${haltMins}m` : "—"}</td>
                    <td className="py-2.5 text-[var(--ink-muted)]">{s.distanceKm} km</td>
                    <td className="py-2.5 text-right font-bold text-[var(--ink)]">Day {s.dayOffset + 1}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

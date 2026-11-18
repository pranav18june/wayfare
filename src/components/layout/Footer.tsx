import Link from "next/link";
import { APP_NAME } from "./Header";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] py-8 text-xs text-[var(--ink-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-mono text-sm font-bold text-[var(--ink)]">
              {APP_NAME} Transit & Travel
            </div>
            <p className="mt-1 text-[var(--ink-muted)]">
              Multi-modal search, booking, and trip orchestration platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/flights" className="hover:text-[var(--ink)]">
              Flights
            </Link>
            <Link href="/trains" className="hover:text-[var(--ink)]">
              Trains
            </Link>
            <Link href="/buses" className="hover:text-[var(--ink)]">
              Buses
            </Link>
            <Link href="/hotels" className="hover:text-[var(--ink)]">
              Hotels
            </Link>
            <Link href="/trains/pnr" className="hover:text-[var(--ink)]">
              PNR Status
            </Link>
            <Link href="/trains/running-status" className="hover:text-[var(--ink)]">
              Live Running Status
            </Link>
            <Link href="/dev/emails" className="hover:text-[var(--ink)]">
              Dev Email Previews
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--line)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} {APP_NAME}. Built for Course Evaluation. All mock inventory deterministic.
          </div>
          <div className="flex items-center gap-4">
            <span>Demo Mode: Mock Provider Active</span>
            <span className="font-mono text-[var(--ok)]">● Engine Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

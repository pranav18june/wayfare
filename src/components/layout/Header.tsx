"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plane,
  Train,
  Bus,
  Building2,
  FileSearch,
  Activity,
  Wallet,
  Bell,
  User,
  Users,
  LogOut,
  Shield,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { formatINR } from "@/lib/utils/formatters";

export const APP_NAME = "Wayfare";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/flights", label: "Flights", icon: Plane },
    { href: "/trains", label: "Trains", icon: Train },
    { href: "/buses", label: "Buses", icon: Bus },
    { href: "/hotels", label: "Hotels", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Main Modes */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-lg font-bold tracking-tight text-[var(--ink)] group"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--brand)] text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              W
            </span>
            <span className="tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? "bg-[var(--brand-light)] text-[var(--brand-ink)] font-semibold shadow-xs"
                      : "text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon size={14} strokeWidth={isActive ? 2 : 1.75} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Train Utilities & Account Controls */}
        <div className="flex items-center gap-3">
          {/* Quick IRCTC Tools */}
          <div className="hidden items-center gap-2 lg:flex border-r border-[var(--line)] pr-3 text-xs">
            <Link
              href="/trains/pnr"
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                pathname === "/trains/pnr"
                  ? "text-[var(--brand)] font-semibold bg-[var(--canvas)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]"
              }`}
            >
              <FileSearch size={13} />
              <span>PNR Status</span>
            </Link>
            <Link
              href="/trains/running-status"
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                pathname === "/trains/running-status"
                  ? "text-[var(--brand)] font-semibold bg-[var(--canvas)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]"
              }`}
            >
              <Activity size={13} />
              <span>Live Train Status</span>
            </Link>
          </div>

          {session?.user ? (
            <div className="flex items-center gap-2">
              {/* Wallet pill */}
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-1 text-xs font-mono font-medium text-[var(--ink)] hover:border-[var(--brand)] transition-colors shadow-2xs"
                title="Wayfare Wallet"
              >
                <Wallet size={13} className="text-[var(--brand)]" />
                <span>{formatINR(session.user.walletBalance ?? 4500)}</span>
              </Link>

              {/* Notification icon */}
              <Link
                href="/notifications"
                className="relative rounded-md p-1.5 text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] transition-colors"
                title="Notifications"
              >
                <Bell size={16} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--brand)] ring-2 ring-white" />
              </Link>

              {/* Live Journey Trip Mode */}
              <Link
                href="/trips/live"
                className={`hidden rounded-md px-2.5 py-1 text-xs font-medium transition-colors lg:inline-flex items-center gap-1.5 ${
                  pathname.startsWith("/trips/live")
                    ? "bg-[var(--ink)] text-white font-semibold"
                    : "text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                }`}
                title="Day-of Journey Companion"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
                Trip Mode
              </Link>

              {/* Group Trips */}
              <Link
                href="/group"
                className={`hidden rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:inline-block ${
                  pathname.startsWith("/group")
                    ? "bg-[var(--canvas)] text-[var(--ink)] font-semibold"
                    : "text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                }`}
              >
                Group Split
              </Link>

              {/* My Trips */}
              <Link
                href="/trips"
                className={`hidden rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:inline-block ${
                  pathname.startsWith("/trips") && !pathname.startsWith("/trips/live")
                    ? "bg-[var(--canvas)] text-[var(--ink)] font-semibold"
                    : "text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                }`}
              >
                My Trips
              </Link>

              {/* Admin Badge link if admin */}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 rounded-md bg-[var(--ink)] px-2.5 py-1 text-xs font-mono font-medium text-white hover:bg-black transition-colors"
                >
                  <Shield size={12} />
                  <span>Admin</span>
                </Link>
              )}

              {/* User profile */}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:border-[var(--brand)] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center text-[10px] font-bold">
                  {session.user.name?.[0] || "U"}
                </div>
                <span className="hidden sm:inline text-xs font-medium">
                  {session.user.name?.split(" ")[0]}
                </span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md p-1.5 text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-rose-600 transition-colors"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-hover)] transition-colors shadow-2xs"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-[var(--ink-muted)] hover:bg-[var(--canvas)] md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 md:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-md border border-[var(--line)] bg-[var(--canvas)] text-xs font-medium text-[var(--ink)]"
                >
                  <Icon size={15} className="text-[var(--brand)]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[var(--line)] pt-2 space-y-1">
            <Link
              href="/trains/pnr"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              <FileSearch size={15} />
              <span>PNR Status Checker</span>
            </Link>
            <Link
              href="/trains/running-status"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              <Activity size={15} />
              <span>Live Train Running Status</span>
            </Link>
            <Link
              href="/trips/live"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 text-xs font-medium text-[var(--brand)] hover:bg-orange-50 rounded"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
              <span>Live Trip Mode (Day-of Travel)</span>
            </Link>
            <Link
              href="/group"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              <Users size={15} />
              <span>Group Bookings & Split Trips</span>
            </Link>
            <Link
              href="/trips"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              <Compass size={15} />
              <span>My Trips & Bookings</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Tag,
  Boxes,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/auth/signin?error=AccessDenied");
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="bg-[var(--surface)] border-b border-[var(--line)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wayfare</span>
            </Link>
            <div className="h-4 w-px bg-[var(--line)]" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight text-[var(--ink)]">
                WAYFARE
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--brand)] text-white">
                <ShieldCheck className="w-3 h-3" />
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[var(--ink)]">
                {session.user.name || "Administrator"}
              </div>
              <div className="text-[11px] font-mono text-[var(--ink-muted)]">
                {session.user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--line)]/60 bg-[var(--surface)]">
          <nav className="flex space-x-8 overflow-x-auto">
            <Link
              href="/admin"
              className="flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-xs text-[var(--ink)] border-[var(--brand)] transition-colors whitespace-nowrap"
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--brand)]" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-xs text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)] hover:border-[var(--line)] transition-colors whitespace-nowrap"
            >
              <Ticket className="w-4 h-4" />
              <span>Bookings</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-xs text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)] hover:border-[var(--line)] transition-colors whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/promos"
              className="flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-xs text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)] hover:border-[var(--line)] transition-colors whitespace-nowrap"
            >
              <Tag className="w-4 h-4" />
              <span>Promo Codes</span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-xs text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)] hover:border-[var(--line)] transition-colors whitespace-nowrap"
            >
              <Boxes className="w-4 h-4" />
              <span>Inventory</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

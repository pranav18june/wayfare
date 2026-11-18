"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils/formatters";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  walletBalance: number;
  createdAt: string;
  _count: {
    bookings: number;
    savedTravellers: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (search.trim()) params.set("search", search.trim());
      if (role) params.set("role", role);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "TRAVELLER" : "ADMIN";
    const confirmMsg =
      currentRole === "ADMIN"
        ? "Are you sure you want to revoke Admin rights from this user?"
        : "Are you sure you want to grant Administrator rights to this user?";

    if (!confirm(confirmMsg)) return;

    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update user role");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[var(--ink)]">
            User Accounts
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Directory of registered customers, profile permissions, and wallet holdings.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--ink-muted)]">
          Total Users: <span className="font-semibold text-[var(--ink)]">{total}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-[var(--line)] rounded text-xs focus:outline-none focus:border-[var(--brand)] bg-[var(--canvas)]/40"
          />
        </div>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="border border-[var(--line)] rounded px-3 py-2 text-xs bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)] font-mono"
        >
          <option value="">All Roles</option>
          <option value="TRAVELLER">Travellers</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--canvas)] border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Bookings</th>
                <th className="py-3 px-4">Saved Travellers</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--canvas)]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[var(--ink)] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                        <span>{u.name || "Unnamed"}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[var(--ink-muted)] mt-0.5">
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-[10px] font-mono text-[var(--ink-muted)]">
                          {u.phone}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--brand)] text-white">
                          <ShieldCheck className="w-3 h-3" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--canvas)] text-[var(--ink)] border border-[var(--line)]">
                          TRAVELLER
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-[var(--ink)]">
                      {formatINR(u.walletBalance)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[var(--ink)]">
                      {u._count.bookings}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[var(--ink-muted)]">
                      {u._count.savedTravellers}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--ink-muted)] whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        disabled={updatingId === u.id}
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
                          u.role === "ADMIN"
                            ? "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
                            : "border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                        } disabled:opacity-50`}
                      >
                        {u.role === "ADMIN" ? "Revoke Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--line)] bg-[var(--canvas)]/40 flex items-center justify-between text-xs">
            <span className="font-mono text-[var(--ink-muted)]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--line)] rounded bg-[var(--surface)] text-[var(--ink)] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--canvas)] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--line)] rounded bg-[var(--surface)] text-[var(--ink)] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--canvas)] transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils/formatters";
import {
  Bell,
  CheckCheck,
  Plane,
  Train,
  Wallet,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function getIcon(type: string) {
    if (type === "BOOKING") return <CheckCircle2 size={16} className="text-[var(--ok)]" />;
    if (type === "ALERT") return <Bell size={16} className="text-[var(--brand)]" />;
    if (type === "TRAIN_DELAY") return <Train size={16} className="text-[var(--warn)]" />;
    if (type === "WALLET") return <Wallet size={16} className="text-[var(--accent)]" />;
    return <Info size={16} className="text-[var(--ink-muted)]" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--ink)]">Notification Centre</h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Status changes, itinerary delay warnings, fare targets, and wallet transactions.
          </p>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] shadow-2xs self-start"
          >
            <CheckCheck size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--ink-muted)]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--ink-muted)]">
            No notifications in your inbox.
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {notifications.map((n) => {
              const isUnread = !n.readAt;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3.5 py-4 text-xs transition-colors ${
                    isUnread ? "bg-[#FFFDF9] -mx-4 px-4 rounded" : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--canvas)] border border-[var(--line)] shrink-0">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-[var(--ink)]">{n.title}</h2>
                      <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                        {formatDate(n.createdAt, "d MMM, HH:mm")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

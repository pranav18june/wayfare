"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Copy,
  Check,
  Share2,
  Lock,
  Clock,
  Plane,
  Train,
  Bus,
  Hotel,
  ShieldCheck,
  CreditCard,
  UserCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Passenger {
  name: string;
  age: number;
  gender: string;
}

interface Member {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  passengers: Passenger[];
  paymentStatus: string;
  joinedAt: string;
}

interface GroupData {
  id: string;
  token: string;
  mode: string;
  searchParams: any;
  selectedItem: any;
  pricePerHead: number;
  maxMembers: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  creator: { id: string; name: string; email: string };
  members: Member[];
  isCreator: boolean;
  currentUserMember?: Member | null;
}

export default function GroupBookingPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for joining
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinAge, setJoinAge] = useState(26);
  const [joinGender, setJoinGender] = useState("M");
  const [submitting, setSubmitting] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);
  const [locking, setLocking] = useState(false);
  const [paying, setPaying] = useState(false);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/group/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Group session not found");
      } else {
        setGroup(data.group);
      }
    } catch {
      setError("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [token]);

  const copyInviteLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName || !joinEmail) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/group/${token}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: joinName,
          email: joinEmail,
          passengers: [{ name: joinName, age: Number(joinAge), gender: joinGender }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not join group");
      } else {
        setJoinName("");
        setJoinEmail("");
        await fetchGroup();
      }
    } catch {
      alert("Failed to join group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLock = async () => {
    if (!confirm("Locking prevents new members from joining. Proceed?")) return;
    setLocking(true);
    try {
      const res = await fetch(`/api/group/${token}/lock`, { method: "POST" });
      if (res.ok) {
        await fetchGroup();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to lock group");
      }
    } catch {
      alert("Error locking group");
    } finally {
      setLocking(false);
    }
  };

  const handlePayShare = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      alert("Test Payment Received! Your share has been marked as PAID.");
      fetchGroup();
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-mono text-[var(--ink-muted)]">
          <Clock className="w-4 h-4 animate-spin text-[var(--brand)]" />
          Loading collaborative group canvas...
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[var(--line)] text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[var(--ink)]">Group Unavailable</h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1 mb-6">
            {error || "This group session has expired or does not exist."}
          </p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 bg-[var(--ink)] text-white text-sm rounded-lg font-medium"
          >
            Return to Search
          </Link>
        </div>
      </div>
    );
  }

  const ModeIcon =
    group.mode === "FLIGHT"
      ? Plane
      : group.mode === "TRAIN"
      ? Train
      : group.mode === "BUS"
      ? Bus
      : Hotel;

  const totalMembers = group.members.length;
  const totalCost = group.pricePerHead * Math.max(totalMembers, 1);
  const paidMembers = group.members.filter((m) => m.paymentStatus === "PAID").length;
  const isFull = totalMembers >= group.maxMembers;
  const isJoined = Boolean(group.currentUserMember);

  return (
    <div className="min-h-screen bg-[var(--canvas)] pb-16">
      {/* Top Header */}
      <div className="bg-[var(--ink)] text-white border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Users className="w-3.5 h-3.5" />
                  Collaborative Booking Canvas
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    group.status === "OPEN"
                      ? "bg-emerald-500 text-white"
                      : group.status === "LOCKED"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {group.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ModeIcon className="w-6 h-6 text-orange-400" />
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {group.selectedItem?.title ||
                    group.selectedItem?.name ||
                    group.selectedItem?.number ||
                    `${group.mode} Group Journey`}
                </h1>
              </div>

              <p className="text-xs text-white/70 mt-1 font-mono">
                Organized by {group.creator.name} · Link Token: #{group.token}
              </p>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyInviteLink}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-white text-[var(--ink)] hover:bg-slate-100 px-3.5 py-2 rounded-lg transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied Link!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Invite Link
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Join our ${group.mode.toLowerCase()} trip on Wayfare! Click link to add your details and split the fare: ${
                    typeof window !== "undefined" ? window.location.href : ""
                  }`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-2 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp Share
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Left: Roster & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Split Fare Summary Bar */}
          <div className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-4">
              Real-Time Split Fare Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-[var(--line)]/60">
                <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                  Cost Per Person
                </span>
                <p className="font-mono text-xl font-bold text-[var(--brand)] mt-0.5">
                  ₹{group.pricePerHead.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-[var(--line)]/60">
                <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                  Total Joined
                </span>
                <p className="font-mono text-xl font-bold text-[var(--ink)] mt-0.5">
                  {totalMembers} / {group.maxMembers}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-[var(--line)]/60">
                <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                  Total Estimated
                </span>
                <p className="font-mono text-xl font-bold text-[var(--ink)] mt-0.5">
                  ₹{totalCost.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-[var(--line)]/60">
                <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                  Paid Roster
                </span>
                <p className="font-mono text-xl font-bold text-emerald-700 mt-0.5">
                  {paidMembers} of {totalMembers}
                </p>
              </div>
            </div>
          </div>

          {/* Member Roster Table */}
          <div className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Traveler Manifest ({totalMembers} of {group.maxMembers} spots)
                </h3>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                  Each traveler submits their own government manifest details directly.
                </p>
              </div>

              {group.isCreator && group.status === "OPEN" && (
                <button
                  onClick={handleLock}
                  disabled={locking}
                  className="text-xs font-mono font-medium text-[var(--ink)] hover:text-black bg-slate-100 hover:bg-slate-200 border border-[var(--line)] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {locking ? "Locking..." : "Lock Group Roster"}
                </button>
              )}
            </div>

            <div className="divide-y divide-[var(--line)]">
              {group.members.map((m, idx) => (
                <div
                  key={m.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-[var(--ink-muted)] font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--ink)]">{m.name}</span>
                        {m.userId === group.creator.id && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                            ORGANIZER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] font-mono">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-mono text-[var(--ink-muted)] block">
                        Share: ₹{group.pricePerHead.toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          m.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {m.paymentStatus === "PAID" ? "✓ PAID" : "PENDING"}
                      </span>
                    </div>

                    {m.userId === group.currentUserMember?.userId &&
                      m.paymentStatus === "PENDING" && (
                        <button
                          onClick={handlePayShare}
                          disabled={paying}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          {paying ? "Processing..." : "Pay ₹" + group.pricePerHead}
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Join Form or Coordination Help */}
        <div className="space-y-6">
          {/* Join Group Form */}
          {group.status === "OPEN" && !isFull && (
            <div className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[var(--ink)] mb-1">
                {isJoined ? "Update Your Passenger Info" : "Join This Journey"}
              </h3>
              <p className="text-xs text-[var(--ink-muted)] mb-4">
                Submit your official details to lock your seat in this group.
              </p>

              <form onSubmit={handleJoin} className="space-y-3.5">
                <div>
                  <label className="text-xs font-mono uppercase text-[var(--ink-muted)] block mb-1">
                    Full Name (As on ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-sm px-3.5 py-2 rounded-lg border border-[var(--line)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[var(--ink-muted)] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={joinEmail}
                    onChange={(e) => setJoinEmail(e.target.value)}
                    placeholder="e.g. priya@example.com"
                    className="w-full text-sm px-3.5 py-2 rounded-lg border border-[var(--line)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase text-[var(--ink-muted)] block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={joinAge}
                      onChange={(e) => setJoinAge(Number(e.target.value))}
                      className="w-full text-sm px-3.5 py-2 rounded-lg border border-[var(--line)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-[var(--ink-muted)] block mb-1">
                      Gender
                    </label>
                    <select
                      value={joinGender}
                      onChange={(e) => setJoinGender(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--line)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none bg-white"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-[var(--brand)] hover:bg-[#d04f0a] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Users className="w-4 h-4" />
                  {submitting
                    ? "Submitting..."
                    : isJoined
                    ? "Update Details"
                    : "Add My Spot (₹" + group.pricePerHead.toLocaleString("en-IN") + ")"}
                </button>
              </form>
            </div>
          )}

          {isFull && (
            <div className="bg-slate-50 rounded-2xl border border-[var(--line)] p-6 text-center text-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-[var(--ink)]">Roster Full</h4>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                All {group.maxMembers} group spots have been filled.
              </p>
            </div>
          )}

          {/* Group Rules & Trust Box */}
          <div className="bg-white rounded-2xl border border-[var(--line)] p-5 space-y-3 text-xs">
            <h4 className="font-mono font-bold uppercase tracking-wider text-[var(--ink)]">
              How Wayfare Split Works
            </h4>
            <ul className="space-y-2 text-[var(--ink-muted)] leading-relaxed list-disc pl-4">
              <li>
                <strong>No WhatsApp chasing:</strong> Each person inputs their own name and age for the government ticket manifest.
              </li>
              <li>
                <strong>Individual pay:</strong> Members can pay their own split directly without fronting cash for everyone.
              </li>
              <li>
                <strong>Single e-ticket:</strong> Once locked and completed, a unified group e-ticket with all berths/seats together is issued.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Wallet, Users, Plus, Shield, CheckCircle2 } from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import Link from "next/link";

interface SavedTraveller {
  id: string;
  name: string;
  dob?: string | null;
  gender?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  berthPreference?: string | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [travellers, setTravellers] = useState<SavedTraveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("M");
  const [idType, setIdType] = useState("AADHAAR");
  const [idNumber, setIdNumber] = useState("");
  const [berthPreference, setBerthPreference] = useState("LOWER");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTravellers();
  }, []);

  async function fetchTravellers() {
    try {
      const res = await fetch("/api/profile/travellers");
      if (res.ok) {
        const data = await res.json();
        setTravellers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTraveller(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Traveller name is required");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/profile/travellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          dob: dob || undefined,
          gender,
          idType: idType || undefined,
          idNumber: idNumber.trim() || undefined,
          berthPreference,
        }),
      });

      if (res.ok) {
        setName("");
        setDob("");
        setIdNumber("");
        setIsAdding(false);
        fetchTravellers();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to add traveller");
      }
    } catch {
      setFormError("Error saving traveller details");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--ink)]">Account & Travellers</h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Manage your personal profile and frequent passenger preferences.
          </p>
        </div>
        {session?.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-md bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
          >
            <Shield size={14} />
            <span>Admin Console</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--canvas)] text-[var(--ink)] font-mono font-bold text-sm border border-[var(--line)]">
              {session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "WF"}
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--ink)]">{session?.user?.name}</div>
              <div className="text-xs text-[var(--ink-muted)]">{session?.user?.email}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-[var(--line)] pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--ink-muted)]">Account Role</span>
              <span className="font-mono font-semibold text-[var(--ink)]">
                {session?.user?.role || "TRAVELLER"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--ink-muted)]">Wallet Balance</span>
              <span className="font-mono font-bold text-[var(--brand)]">
                {formatINR(session?.user?.walletBalance ?? 4500)}
              </span>
            </div>

            <Link
              href="/wallet"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--canvas)] py-2 text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)]"
            >
              <Wallet size={14} />
              <span>View Wallet Ledger</span>
            </Link>
          </div>
        </div>

        {/* Saved Travellers Section */}
        <div className="md:col-span-2 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">Saved Travellers</h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Pre-fill passenger details automatically at checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1 rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brand-ink)]"
            >
              <Plus size={14} />
              <span>Add Traveller</span>
            </button>
          </div>

          {/* Add Traveller Form Modal/Drawer */}
          {isAdding && (
            <form
              onSubmit={handleAddTraveller}
              className="mb-5 rounded-md border border-[var(--line)] bg-[var(--canvas)] p-4 text-xs"
            >
              <div className="mb-3 font-semibold text-[var(--ink)]">New Traveller Profile</div>

              {formError && (
                <div className="mb-3 rounded border border-[#FAD2CF] bg-[#FCE8E6] p-2 text-xs text-[var(--danger)]">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-medium text-[var(--ink-muted)] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="As per Government ID"
                    className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink-muted)] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink-muted)] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink-muted)] mb-1">Berth Preference (Train)</label>
                  <select
                    value={berthPreference}
                    onChange={(e) => setBerthPreference(e.target.value)}
                    className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="LOWER">Lower Berth</option>
                    <option value="MIDDLE">Middle Berth</option>
                    <option value="UPPER">Upper Berth</option>
                    <option value="SIDE_LOWER">Side Lower</option>
                    <option value="SIDE_UPPER">Side Upper</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink-muted)] mb-1">ID Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="DRIVING_LICENCE">Driving Licence</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink-muted)] mb-1">ID Number (optional)</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Masked e.g. XXXX4321"
                    className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 font-medium text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-[var(--brand)] px-4 py-1.5 font-semibold text-white hover:bg-[var(--brand-ink)]"
                >
                  {submitting ? "Saving..." : "Save Traveller"}
                </button>
              </div>
            </form>
          )}

          {/* Travellers List */}
          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--ink-muted)]">Loading travellers...</div>
          ) : travellers.length === 0 ? (
            <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-6 text-center text-xs text-[var(--ink-muted)]">
              No saved travellers yet. Add travellers to speed up flight and train bookings.
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {travellers.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">{t.name}</div>
                    <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[var(--ink-muted)]">
                      <span>Gender: {t.gender || "Not specified"}</span>
                      {t.dob && <span>DOB: {formatDate(t.dob, "d MMM yyyy")}</span>}
                      {t.berthPreference && <span>Berth: {t.berthPreference.replace("_", " ")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.idType && (
                      <span className="rounded bg-[var(--canvas)] px-2 py-0.5 font-mono text-[10px] text-[var(--ink-muted)] border border-[var(--line)]">
                        {t.idType}: {t.idNumber || "Verified"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

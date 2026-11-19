"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Wallet, Users, Plus, Shield, CheckCircle2, Sparkles, SlidersHorizontal, Save } from "lucide-react";
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

  // Travel Personalization Profile State
  const [preferredClass, setPreferredClass] = useState("3A");
  const [preferredSeatType, setPreferredSeatType] = useState("WINDOW");
  const [preferredBerthType, setPreferredBerthType] = useState("LOWER");
  const [preferredBusType, setPreferredBusType] = useState("AC_SLEEPER");
  const [mealPreference, setMealPreference] = useState("VEG");
  const [budgetMax, setBudgetMax] = useState(8000);
  const [preferredDepartTime, setPreferredDepartTime] = useState("MORNING");
  const [homeAirport, setHomeAirport] = useState("DEL");
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetchTravellers();
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      const res = await fetch("/api/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          const p = data.preferences;
          if (p.preferredClass) setPreferredClass(p.preferredClass);
          if (p.preferredSeatType) setPreferredSeatType(p.preferredSeatType);
          if (p.preferredBerthType) setPreferredBerthType(p.preferredBerthType);
          if (p.preferredBusType) setPreferredBusType(p.preferredBusType);
          if (p.mealPreference) setMealPreference(p.mealPreference);
          if (p.budgetMax) setBudgetMax(p.budgetMax);
          if (p.preferredDepartTime) setPreferredDepartTime(p.preferredDepartTime);
          if (p.homeAirport) setHomeAirport(p.homeAirport);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefsSaved(false);
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredClass,
          preferredSeatType,
          preferredBerthType,
          preferredBusType,
          mealPreference,
          budgetMax: Number(budgetMax),
          preferredDepartTime,
          homeAirport,
        }),
      });
      if (res.ok) {
        setPrefsSaved(true);
        setTimeout(() => setPrefsSaved(false), 3000);
      }
    } catch {
      alert("Error saving preferences");
    } finally {
      setSavingPrefs(false);
    }
  }

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

        {/* Persistent Travel Personalization Profile */}
        <div id="preferences" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-50 text-[var(--brand)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--ink)]">
                  Personal Travel Profile & Booking Intelligence
                </h2>
                <p className="text-xs text-[var(--ink-muted)]">
                  Wayfare uses these explicit rules to auto-filter search results and highlight your preferred seats.
                </p>
              </div>
            </div>

            {prefsSaved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Preferences Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Preferred Train Class */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[var(--line)]/60 space-y-2">
                <label className="font-mono font-bold uppercase tracking-wider text-[var(--ink)] block">
                  Preferred Train Class
                </label>
                <div className="grid grid-cols-5 gap-1.5 font-mono">
                  {["SL", "3A", "2A", "1A", "CC"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPreferredClass(c)}
                      className={`py-2 rounded-lg border text-center font-bold transition-all ${
                        preferredClass === c
                          ? "bg-[var(--brand)] text-white border-[var(--brand)] shadow-2xs"
                          : "bg-white text-[var(--ink)] border-[var(--line)] hover:bg-slate-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Seat Type */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[var(--line)]/60 space-y-2">
                <label className="font-mono font-bold uppercase tracking-wider text-[var(--ink)] block">
                  Flight & Bus Seat Preference
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {["WINDOW", "AISLE", "MIDDLE"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPreferredSeatType(s)}
                      className={`py-2 rounded-lg border text-center font-bold transition-all ${
                        preferredSeatType === s
                          ? "bg-[var(--brand)] text-white border-[var(--brand)] shadow-2xs"
                          : "bg-white text-[var(--ink)] border-[var(--line)] hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Train Berth */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[var(--line)]/60 space-y-2">
                <label className="font-mono font-bold uppercase tracking-wider text-[var(--ink)] block">
                  Train Berth Allocation Preference
                </label>
                <select
                  value={preferredBerthType}
                  onChange={(e) => setPreferredBerthType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[var(--line)] bg-white px-3 font-mono text-xs focus:ring-1 focus:ring-[var(--brand)] outline-none"
                >
                  <option value="LOWER">Lower Berth (Best for seniors / comfort)</option>
                  <option value="SIDE_LOWER">Side Lower (Window view + privacy)</option>
                  <option value="MIDDLE">Middle Berth</option>
                  <option value="UPPER">Upper Berth</option>
                  <option value="SIDE_UPPER">Side Upper</option>
                </select>
              </div>

              {/* Preferred Bus Type */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[var(--line)]/60 space-y-2">
                <label className="font-mono font-bold uppercase tracking-wider text-[var(--ink)] block">
                  Intercity Bus Comfort Tier
                </label>
                <select
                  value={preferredBusType}
                  onChange={(e) => setPreferredBusType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[var(--line)] bg-white px-3 font-mono text-xs focus:ring-1 focus:ring-[var(--brand)] outline-none"
                >
                  <option value="AC_SLEEPER">AC Sleeper (2+1 / Multi-Axle)</option>
                  <option value="AC_SEATER">AC Seater (BharatBenz / Volvo)</option>
                  <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                  <option value="NON_AC_SEATER">Non-AC Seater</option>
                </select>
              </div>

              {/* Meal & Time Band */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[var(--line)]/60 space-y-2">
                <label className="font-mono font-bold uppercase tracking-wider text-[var(--ink)] block">
                  Dietary / Meal Preference
                </label>
                <select
                  value={mealPreference}
                  onChange={(e) => setMealPreference(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[var(--line)] bg-white px-3 font-mono text-xs focus:ring-1 focus:ring-[var(--brand)] outline-none"
                >
                  <option value="VEG">Standard Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="JAIN">Strict Jain Meal (No root vegetables)</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>

              {/* Budget Ceiling & Home Airport */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[var(--line)]/60 space-y-2">
                <label className="font-mono font-bold uppercase tracking-wider text-[var(--ink)] block">
                  Default Max Budget Filter (₹)
                </label>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="number"
                    min={500}
                    max={50000}
                    step={500}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="flex-1 h-9 rounded-lg border border-[var(--line)] bg-white px-3 text-xs focus:ring-1 focus:ring-[var(--brand)] outline-none font-bold"
                  />
                  <span className="text-[var(--ink-muted)] text-xs">INR Max</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
              <button
                type="submit"
                disabled={savingPrefs}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-orange-400" />
                {savingPrefs ? "Saving Intelligence..." : "Save Travel Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

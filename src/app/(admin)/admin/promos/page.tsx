"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Plane,
  Train,
  Bus,
  Hotel,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils/formatters";

interface PromoCodeItem {
  code: string;
  type: string;
  value: number;
  minAmount: number;
  maxDiscount: number | null;
  modes: string;
  validFrom: string;
  validTo: string;
  usageLimit: number | null;
  usedCount: number;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [selectedModes, setSelectedModes] = useState<string[]>([
    "FLIGHT",
    "TRAIN",
    "BUS",
    "HOTEL",
  ]);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promos");
      if (res.ok) {
        const data = await res.json();
        setPromos(data.promos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreatePromo = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) {
      alert("Please provide code and discount value");
      return;
    }

    try {
      setSubmitting(true);
      const validToDate = new Date();
      validToDate.setDate(validToDate.getDate() + parseInt(validDays, 10));

      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        minAmount: minAmount ? parseFloat(minAmount) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        modes: selectedModes,
        validTo: validToDate.toISOString(),
      };

      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setCode("");
        setValue("");
        setMinAmount("");
        setMaxDiscount("");
        setUsageLimit("");
        fetchPromos();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create promo code");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating promo code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePromo = async (promoCode: string) => {
    if (!confirm(`Are you sure you want to permanently delete promo code ${promoCode}?`)) return;

    try {
      const res = await fetch(`/api/admin/promos/${encodeURIComponent(promoCode)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.code !== promoCode));
      } else {
        alert("Failed to delete promo code");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting promo code");
    }
  };

  const toggleMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[var(--ink)]">
            Promo Code Rules
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Configure discount campaigns, redemption ceilings, and travel mode restrictions.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--brand)] text-white text-xs font-medium rounded hover:bg-[var(--brand)]/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Promos Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--canvas)] border-b border-[var(--line)] text-[var(--ink-muted)] font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Spend / Max Benefit</th>
                <th className="py-3 px-4">Applicable Modes</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                    Loading promo codes...
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--ink-muted)]">
                    No promo codes active. Click "New Promo Code" to create one.
                  </td>
                </tr>
              ) : (
                promos.map((p) => {
                  let modesArr: string[] = [];
                  try {
                    modesArr = JSON.parse(p.modes);
                  } catch {
                    modesArr = [];
                  }

                  const isExpired = new Date(p.validTo) < new Date();

                  return (
                    <tr key={p.code} className="hover:bg-[var(--canvas)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--ink)]">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--canvas)] border border-[var(--line)]">
                          <Tag className="w-3 h-3 text-[var(--brand)]" />
                          <span>{p.code}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {p.type === "PERCENTAGE" ? (
                          <span className="font-semibold text-emerald-700">
                            {p.value}% OFF
                          </span>
                        ) : (
                          <span className="font-semibold text-blue-700">
                            Flat {formatINR(p.value)} OFF
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>Min: {formatINR(p.minAmount)}</div>
                        {p.maxDiscount && (
                          <div className="text-[var(--ink-muted)]">
                            Max Cap: {formatINR(p.maxDiscount)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {modesArr.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center p-1 rounded bg-[var(--canvas)] text-[var(--ink-muted)]"
                              title={m}
                            >
                              {m === "FLIGHT" && <Plane className="w-3 h-3" />}
                              {m === "TRAIN" && <Train className="w-3 h-3" />}
                              {m === "BUS" && <Bus className="w-3 h-3" />}
                              {m === "HOTEL" && <Hotel className="w-3 h-3" />}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-semibold text-[var(--ink)]">{p.usedCount}</span>
                        {p.usageLimit && (
                          <span className="text-[var(--ink-muted)]"> / {p.usageLimit}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                        <span className={isExpired ? "text-rose-600 font-semibold" : "text-[var(--ink-muted)]"}>
                          {formatDate(p.validTo)}
                        </span>
                        {isExpired && (
                          <span className="ml-1 text-[10px] text-rose-600">(Expired)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeletePromo(p.code)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete promo code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promo Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-base font-bold font-mono text-[var(--ink)]">
              Create New Promo Code
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Set discount parameters, eligibility, and validity period.
            </p>

            <form onSubmit={handleCreatePromo} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-[var(--line)] rounded font-mono font-bold focus:outline-none focus:border-[var(--brand)] uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[var(--line)] rounded font-mono focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Discount Value {type === "PERCENTAGE" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={type === "PERCENTAGE" ? "15" : "500"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--line)] rounded font-mono focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Min Booking Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--line)] rounded font-mono focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={type === "FLAT"}
                    placeholder={type === "FLAT" ? "N/A" : "1500"}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--line)] rounded font-mono focus:outline-none focus:border-[var(--brand)] disabled:bg-[var(--canvas)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Usage Limit (Total)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--line)] rounded font-mono focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Validity (Days from now)
                  </label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--line)] rounded font-mono focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)]"
                  >
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--ink)] mb-1.5">
                  Eligible Modes
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "FLIGHT", label: "Flights" },
                    { id: "TRAIN", label: "Trains" },
                    { id: "BUS", label: "Buses" },
                    { id: "HOTEL", label: "Hotels" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMode(m.id)}
                      className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                        selectedModes.includes(m.id)
                          ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                          : "bg-[var(--canvas)] text-[var(--ink-muted)] border-[var(--line)]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-[var(--line)] rounded text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[var(--brand)] text-white font-medium rounded hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Users, Copy, Check, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface GroupBookingButtonProps {
  mode: "FLIGHT" | "TRAIN" | "BUS" | "HOTEL";
  selectedItem: any;
  pricePerHead: number;
  className?: string;
}

export function GroupBookingButton({
  mode,
  selectedItem,
  pricePerHead,
  className = "",
}: GroupBookingButtonProps) {
  const [open, setOpen] = useState(false);
  const [maxMembers, setMaxMembers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/group/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          selectedItem,
          pricePerHead,
          maxMembers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        alert(data.error || "Failed to initialize group booking");
      } else {
        const fullUrl = `${window.location.origin}/group/${data.token}`;
        setCreatedUrl(fullUrl);
      }
    } catch {
      alert("Error creating group session");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--line)] bg-white hover:bg-slate-50 text-[var(--ink)] transition-colors ${className}`}
      >
        <Users className="w-3.5 h-3.5 text-[var(--brand)]" />
        Group Split
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[var(--line)] shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--brand)]" />
                <h3 className="font-bold text-[var(--ink)] text-base">
                  Collaborative Group Booking
                </h3>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setCreatedUrl(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!createdUrl ? (
              <div className="space-y-4">
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  Generate a collaborative trip link. Friends can add their own passenger details and pay their individual split share.
                </p>

                <div className="p-3 bg-[var(--canvas)] rounded-xl border border-[var(--line)] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                    Estimated Split Per Head
                  </span>
                  <p className="font-mono text-lg font-bold text-[var(--brand)]">
                    ₹{pricePerHead.toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[var(--ink-muted)] block mb-1">
                    Maximum Group Size (Travelers)
                  </label>
                  <select
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--line)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none bg-white font-mono"
                  >
                    {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} travelers max
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[var(--ink)] hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Users className="w-4 h-4 text-orange-400" />
                    {loading ? "Generating Group Link..." : "Create Canvas & Get Invite Link"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-[var(--ink)] text-base">
                  Group Canvas Ready!
                </h4>
                <p className="text-xs text-[var(--ink-muted)]">
                  Share this invite link with your travelers. Each person can submit their details.
                </p>

                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-[var(--line)] rounded-lg">
                  <input
                    type="text"
                    readOnly
                    value={createdUrl}
                    className="w-full text-xs font-mono bg-transparent text-[var(--ink)] outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs font-medium bg-white border border-[var(--line)] rounded shadow-2xs hover:bg-slate-100 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={createdUrl}
                    className="flex-1 py-2 px-3 bg-[var(--brand)] hover:bg-[#d04f0a] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    Open Canvas
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setCreatedUrl(null);
                    }}
                    className="py-2 px-3 border border-[var(--line)] text-xs font-medium rounded-lg hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

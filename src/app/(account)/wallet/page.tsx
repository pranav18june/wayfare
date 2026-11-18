"use client";

import { useState, useEffect } from "react";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, RotateCcw, ShieldCheck } from "lucide-react";

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState<number>(1000);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  async function fetchWallet() {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const json = await res.json();
        setBalance(json.walletBalance);
        setTransactions(json.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTopup() {
    if (topupAmount <= 0) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topupAmount }),
      });
      if (res.ok) {
        setIsTopupOpen(false);
        fetchWallet();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--ink)]">Wayfare Wallet</h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Instant 1-click checkout, instant refund credits, and promotional rewards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTopupOpen(!isTopupOpen)}
          className="flex items-center gap-1.5 rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-ink)] shadow-sm self-start"
        >
          <Plus size={14} />
          <span>Add Money</span>
        </button>
      </div>

      {/* Balance Card */}
      <div className="mb-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--canvas)] text-[var(--brand)] border border-[var(--line)]">
              <Wallet size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Available Wallet Balance
              </div>
              <div className="font-mono text-2xl font-bold text-[var(--ink)]">
                {formatINR(balance)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--ok)] font-medium">
            <ShieldCheck size={16} />
            <span>100% RBI Compliant Closed Wallet</span>
          </div>
        </div>

        {/* Topup drawer/form */}
        {isTopupOpen && (
          <div className="mt-6 border-t border-[var(--line)] pt-4">
            <span className="text-xs font-bold text-[var(--ink)] block mb-2">
              Select Top-up Amount:
            </span>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`rounded border px-4 py-1.5 font-mono text-xs font-semibold transition-colors ${
                    topupAmount === amt
                      ? "border-[var(--brand)] bg-[var(--canvas)] text-[var(--brand)]"
                      : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line)]"
                  }`}
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={processing}
                onClick={handleTopup}
                className="rounded-md bg-[var(--ink)] px-5 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                {processing ? "Adding..." : `Add ${formatINR(topupAmount)} to Wallet`}
              </button>
              <button
                type="button"
                onClick={() => setIsTopupOpen(false)}
                className="text-xs text-[var(--ink-muted)] hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Ledger */}
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--ink)] mb-4 uppercase tracking-wider">
          Transaction History Ledger
        </h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--ink-muted)]">
            Loading ledger transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--ink-muted)]">
            No wallet transactions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {transactions.map((t) => {
              const isCredit = t.type === "CREDIT" || t.type === "REFUND";
              return (
                <div key={t.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        isCredit
                          ? "border-[#CEEAD6] bg-[#E6F4EA] text-[var(--ok)]"
                          : "border-[#FAD2CF] bg-[#FCE8E6] text-[var(--danger)]"
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div className="font-bold text-[var(--ink)]">{t.ref || t.type}</div>
                      <div className="font-mono text-[10px] text-[var(--ink-muted)]">
                        {formatDate(t.createdAt, "d MMM yyyy, HH:mm")}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono text-sm font-bold ${
                        isCredit ? "text-[var(--ok)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {formatINR(t.amount)}
                    </div>
                    <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[var(--canvas)] text-[var(--ink-muted)] border border-[var(--line)]">
                      {t.type}
                    </span>
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

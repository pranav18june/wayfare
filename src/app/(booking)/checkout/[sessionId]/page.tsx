"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { FareBreakdown } from "@/components/common/FareBreakdown";
import { PriceTag } from "@/components/common/PriceTag";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import {
  Clock,
  ShieldCheck,
  Check,
  AlertTriangle,
  CreditCard,
  QrCode,
  Wallet,
  Building,
  User,
  Plus,
  Tag,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 10-Minute Lock Countdown state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [isLockExpired, setIsLockExpired] = useState(false);

  // Passengers form state
  const [passengers, setPassengers] = useState<
    Array<{ name: string; age: string; gender: string; seat: string; berth: string; idNumber?: string }>
  >([]);

  // Add-ons
  const [addOns, setAddOns] = useState({
    insurance: false,
    meals: 0,
    extraBaggage: 0,
  });

  // Promo code
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING" | "WALLET">("UPI");
  const [testScenario, setTestScenario] = useState<"success" | "failure" | "pending">("success");
  const [upiId, setUpiId] = useState("traveller@okhdfcbank");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Fetch session data
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/checkout/session?id=${sessionId}`);
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setSessionData(data);
        setSecondsRemaining(data.secondsRemaining || 600);
        setIsLockExpired(data.isExpired || false);

        // Pre-fill primary passenger from session or saved travellers
        const count = data.payload.passengerCount || 1;
        const initialPassengers = [];
        const saved = data.savedTravellers || [];

        for (let i = 0; i < count; i++) {
          const s = saved[i];
          initialPassengers.push({
            name: s ? s.name : i === 0 ? "Aarav Sharma" : `Traveller ${i + 1}`,
            age: s?.dob ? "32" : "28",
            gender: s?.gender || "M",
            seat: data.payload.seats ? data.payload.seats[i] : `12${String.fromCharCode(65 + i)}`,
            berth: s?.berthPreference || "Lower",
            idNumber: s?.idNumber || "",
          });
        }
        setPassengers(initialPassengers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId, router]);

  // Countdown timer effect
  useEffect(() => {
    if (isLockExpired || secondsRemaining <= 0) {
      setIsLockExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsLockExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, isLockExpired]);

  // Apply Promo Code
  async function handleApplyPromo() {
    if (!promoCodeInput.trim()) return;
    setValidatingPromo(true);
    setPromoError("");

    try {
      const res = await fetch("/api/checkout/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          mode: sessionData?.mode,
          baseFare: sessionData?.priceSnapshot?.baseFare || 3000,
          passengerCount: passengers.length,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setAppliedPromo(json.promoCode);
        setPromoDiscount(json.discount);
        setPromoCodeInput("");
      } else {
        setPromoError(json.error || "Invalid promo code");
      }
    } catch {
      setPromoError("Failed to apply promo code");
    } finally {
      setValidatingPromo(false);
    }
  }

  // Calculate dynamic fare breakdown
  const currentFareBreakdown = useMemo(() => {
    if (!sessionData?.priceSnapshot) {
      return { baseFare: 0, taxes: 0, convenienceFee: 0, discount: 0, total: 0 };
    }

    const base = sessionData.priceSnapshot.baseFare || 0;
    let addOnCost = 0;
    if (addOns.insurance) addOnCost += 199 * passengers.length;
    if (addOns.meals > 0) addOnCost += addOns.meals * 350;
    if (addOns.extraBaggage > 0) addOnCost += addOns.extraBaggage * 450;

    const subtotal = base + addOnCost;
    const taxes = Math.round(subtotal * 0.12);
    const convenienceFee = sessionData.priceSnapshot.convenienceFee || 200;
    const total = Math.max(0, subtotal + taxes + convenienceFee - promoDiscount);

    return {
      baseFare: base + addOnCost,
      taxes,
      convenienceFee,
      discount: promoDiscount,
      total,
      promoCode: appliedPromo || undefined,
    };
  }, [sessionData, addOns, promoDiscount, appliedPromo, passengers.length]);

  // Handle final payment submission
  async function handleProcessPayment() {
    setProcessingPayment(true);
    setPaymentError("");

    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          paymentMethod,
          scenario: testScenario,
          passengers,
          promoCode: appliedPromo,
          addOns,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProcessingPayment(false);
        setPaymentError(data.error || "Payment failed");
        setFailedAttempts((prev) => prev + 1);

        // Section 8.7: seats released after 3 failed attempts
        if (failedAttempts + 1 >= 3) {
          setIsLockExpired(true);
        }
        return;
      }

      // Success or Pending: redirect to booking confirmation
      router.push(`/booking/${data.bookingId}`);
    } catch (err) {
      setProcessingPayment(false);
      setPaymentError("Network error occurred during payment processing.");
    }
  }

  if (loading || !sessionData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-xs text-[var(--ink-muted)]">
        Initializing secure checkout session...
      </div>
    );
  }

  // Format countdown mm:ss
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* 10-Minute Seat/Price Lock Expiry Modal (Section 8.6) */}
      {isLockExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCE8E6] text-[var(--danger)]">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-base font-bold text-[var(--ink)]">Fare Lock Expired</h2>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              The 10-minute inventory and price guarantee for this reservation has expired.
              Please refresh current fares to resume booking.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => router.push(`/${sessionData.mode.toLowerCase()}s`)}
                className="flex-1 rounded border border-[var(--line)] py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--canvas)]"
              >
                Return to Search
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 rounded bg-[var(--brand)] py-2 text-xs font-semibold text-white hover:bg-[var(--brand-ink)]"
              >
                Refresh Fares
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Lock Timer Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <span className="font-mono text-xs font-bold text-[var(--brand)]">
            SECURE CHECKOUT • {sessionData.mode}
          </span>
          <h1 className="text-xl font-bold text-[var(--ink)]">Complete Your Reservation</h1>
        </div>

        {/* 10-minute Lock Timer */}
        <div className="flex items-center gap-2 rounded-md border border-[#FED7AA] bg-[#FFF4ED] px-3 py-1.5 text-xs text-[var(--brand)]">
          <Clock size={15} className="animate-spin text-[var(--brand)]" />
          <span>Fare locked for:</span>
          <span className="font-mono font-bold text-sm text-[var(--brand)]">
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between max-w-xl mx-auto text-xs">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-[var(--brand)] font-bold" : "text-[var(--ink-muted)]"}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[11px] font-mono">
            1
          </span>
          <span>Review Itinerary</span>
        </div>
        <div className="h-[1px] flex-1 bg-[var(--line)] mx-3" />
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-[var(--brand)] font-bold" : "text-[var(--ink-muted)]"}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[11px] font-mono">
            2
          </span>
          <span>Travellers & Add-ons</span>
        </div>
        <div className="h-[1px] flex-1 bg-[var(--line)] mx-3" />
        <div className={`flex items-center gap-2 ${step === 3 ? "text-[var(--brand)] font-bold" : "text-[var(--ink-muted)]"}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[11px] font-mono">
            3
          </span>
          <span>Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Interactive Flow (Col 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* STEP 1: Itinerary Review */}
          {step === 1 && (
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[var(--ink)] mb-4 uppercase tracking-wider">
                1. Review Itinerary Details
              </h2>

              <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-4 mb-4 text-xs">
                {sessionData.mode === "FLIGHT" && (
                  <div className="flex flex-col gap-3">
                    {sessionData.payload.flights?.map((f: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between border-b last:border-b-0 border-[var(--line)] pb-2 last:pb-0">
                        <div>
                          <span className="font-mono font-bold text-[var(--brand)]">
                            {f.airlineCode} {f.flightNumber}
                          </span>
                          <div className="text-xs font-semibold text-[var(--ink)] mt-0.5">
                            {f.fromCode} ({f.departTime}) → {f.toCode} ({f.arriveTime})
                          </div>
                          <span className="text-[11px] text-[var(--ink-muted)]">{f.baggage}</span>
                        </div>
                        <div className="font-mono font-bold text-sm text-[var(--ink)]">
                          {formatINR(f.calculatedFare)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sessionData.mode === "TRAIN" && (
                  <div className="flex flex-col gap-1">
                    <span className="font-mono font-bold text-[var(--accent)]">
                      Train {sessionData.payload.trainNumber} • {sessionData.payload.trainName}
                    </span>
                    <div className="text-xs font-semibold text-[var(--ink)]">
                      {sessionData.payload.fromStation} → {sessionData.payload.toStation} ({sessionData.payload.date})
                    </div>
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      Class: {sessionData.payload.classCode} • Quota: {sessionData.payload.quota}
                    </span>
                  </div>
                )}

                {sessionData.mode === "BUS" && (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[var(--ink)]">
                      {sessionData.payload.operatorName}
                    </span>
                    <div className="text-xs font-semibold text-[var(--ink)]">
                      {sessionData.payload.fromCity} → {sessionData.payload.toCity} ({sessionData.payload.date})
                    </div>
                    <span className="text-[11px] text-[var(--ink-muted)] font-mono">
                      Seats: {sessionData.payload.seats?.join(", ")} • Boarding: {sessionData.payload.boardingPoint}
                    </span>
                  </div>
                )}

                {sessionData.mode === "HOTEL" && (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[var(--ink)]">
                      {sessionData.payload.hotelName}
                    </span>
                    <div className="text-xs font-semibold text-[var(--ink)]">
                      {sessionData.payload.city} • Room: {sessionData.payload.roomType}
                    </div>
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      Check-In: {sessionData.payload.checkIn} → Check-Out: {sessionData.payload.checkOut} ({sessionData.payload.nights} Nights)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-md bg-[var(--brand)] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-ink)] shadow-sm"
                >
                  <span>Proceed to Traveller Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Travellers & Add-ons */}
          {step === 2 && (
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">
                    2. Passenger & Guest Manifest
                  </h2>
                  <span className="text-xs text-[var(--ink-muted)]">
                    {passengers.length} {passengers.length === 1 ? "Passenger" : "Passengers"}
                  </span>
                </div>

                {/* Saved Travellers Quick Fill */}
                {sessionData.savedTravellers && sessionData.savedTravellers.length > 0 && (
                  <div className="mb-4 rounded border border-[var(--line)] bg-[var(--canvas)] p-3 text-xs">
                    <span className="font-bold text-[var(--ink)] block mb-1">
                      Quick Autofill from Saved Travellers:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sessionData.savedTravellers.map((st: any) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setPassengers((prev) => [
                              {
                                ...prev[0],
                                name: st.name,
                                gender: st.gender || "M",
                                berth: st.berthPreference || "Lower",
                                idNumber: st.idNumber || "",
                              },
                              ...prev.slice(1),
                            ]);
                          }}
                          className="flex items-center gap-1 rounded bg-white px-2 py-1 border border-[var(--line)] text-[11px] font-medium text-[var(--ink)] hover:border-[var(--brand)]"
                        >
                          <User size={11} className="text-[var(--accent)]" />
                          <span>{st.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passenger Inputs */}
                <div className="flex flex-col gap-4">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="rounded border border-[var(--line)] p-4 text-xs">
                      <span className="font-bold text-[var(--ink)] mb-2 block">
                        Passenger {idx + 1}
                      </span>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-[var(--ink-muted)] mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => {
                              const updated = [...passengers];
                              updated[idx].name = e.target.value;
                              setPassengers(updated);
                            }}
                            className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[var(--ink-muted)] mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={110}
                            value={p.age}
                            onChange={(e) => {
                              const updated = [...passengers];
                              updated[idx].age = e.target.value;
                              setPassengers(updated);
                            }}
                            className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-mono text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[var(--ink-muted)] mb-1">
                            Gender
                          </label>
                          <select
                            value={p.gender}
                            onChange={(e) => {
                              const updated = [...passengers];
                              updated[idx].gender = e.target.value;
                              setPassengers(updated);
                            }}
                            className="h-9 w-full rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                          >
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons Section */}
              <div className="border-t border-[var(--line)] pt-4">
                <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-3">
                  Optional Transit Add-ons
                </h3>
                <div className="flex flex-col gap-2.5 text-xs">
                  <label className="flex items-center justify-between rounded border border-[var(--line)] p-3 cursor-pointer hover:border-[var(--line)]">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addOns.insurance}
                        onChange={(e) => setAddOns({ ...addOns, insurance: e.target.checked })}
                        className="rounded border-[var(--line)] text-[var(--accent)]"
                      />
                      <div>
                        <span className="font-bold text-[var(--ink)]">Comprehensive Transit Insurance</span>
                        <div className="text-[11px] text-[var(--ink-muted)]">Medical cover, baggage loss, and flight cancellation protection</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[var(--ink)]">₹199 / traveller</span>
                  </label>

                  <label className="flex items-center justify-between rounded border border-[var(--line)] p-3 cursor-pointer hover:border-[var(--line)]">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addOns.meals > 0}
                        onChange={(e) => setAddOns({ ...addOns, meals: e.target.checked ? 1 : 0 })}
                        className="rounded border-[var(--line)] text-[var(--accent)]"
                      />
                      <div>
                        <span className="font-bold text-[var(--ink)]">Gourmet In-Transit Hot Meal</span>
                        <div className="text-[11px] text-[var(--ink-muted)]">Chef-crafted seasonal vegetarian or non-vegetarian platter</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[var(--ink)]">₹350</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[var(--line)] pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 rounded-md bg-[var(--brand)] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-ink)] shadow-sm"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Test Payment Gateway */}
          {step === 3 && (
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider mb-1">
                  3. Test Payment Gateway
                </h2>
                <p className="text-xs text-[var(--ink-muted)]">
                  Sandbox simulation environment. No real funds charged.
                </p>
              </div>

              {/* TEST SCENARIO SELECTOR (Section 2.2 E & Section 8.7) */}
              <div className="rounded-md border-2 border-[var(--brand)] bg-[#FFF4ED] p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-[var(--brand)] mb-1">
                  <ShieldCheck size={16} />
                  <span>Selectable Evaluator Test Scenario:</span>
                </div>
                <p className="text-[11px] text-[var(--ink-muted)] mb-3">
                  Choose an outcome to test error handling and pending queue logic.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`flex flex-col p-2.5 rounded border cursor-pointer ${testScenario === "success" ? "border-[var(--ok)] bg-white shadow-2xs" : "border-[var(--line)] bg-white/60"}`}>
                    <div className="flex items-center gap-1.5 font-bold text-[var(--ok)] text-xs">
                      <input
                        type="radio"
                        name="scenario"
                        checked={testScenario === "success"}
                        onChange={() => setTestScenario("success")}
                        className="text-[var(--ok)]"
                      />
                      <span>Success</span>
                    </div>
                    <span className="text-[10px] text-[var(--ink-muted)] mt-1">Instant confirmation and e-ticket generation</span>
                  </label>

                  <label className={`flex flex-col p-2.5 rounded border cursor-pointer ${testScenario === "failure" ? "border-[var(--danger)] bg-white shadow-2xs" : "border-[var(--line)] bg-white/60"}`}>
                    <div className="flex items-center gap-1.5 font-bold text-[var(--danger)] text-xs">
                      <input
                        type="radio"
                        name="scenario"
                        checked={testScenario === "failure"}
                        onChange={() => setTestScenario("failure")}
                        className="text-[var(--danger)]"
                      />
                      <span>Failure</span>
                    </div>
                    <span className="text-[10px] text-[var(--ink-muted)] mt-1">Simulate card/gateway decline with retry</span>
                  </label>

                  <label className={`flex flex-col p-2.5 rounded border cursor-pointer ${testScenario === "pending" ? "border-[var(--warn)] bg-white shadow-2xs" : "border-[var(--line)] bg-white/60"}`}>
                    <div className="flex items-center gap-1.5 font-bold text-[var(--warn)] text-xs">
                      <input
                        type="radio"
                        name="scenario"
                        checked={testScenario === "pending"}
                        onChange={() => setTestScenario("pending")}
                        className="text-[var(--warn)]"
                      />
                      <span>Pending</span>
                    </div>
                    <span className="text-[10px] text-[var(--ink-muted)] mt-1">Bank authorization pending with dev resolve</span>
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`flex flex-col items-center justify-center p-3 rounded border font-semibold ${
                      paymentMethod === "UPI"
                        ? "border-[var(--brand)] bg-[var(--canvas)] text-[var(--brand)] shadow-2xs"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line)]"
                    }`}
                  >
                    <QrCode size={18} className="mb-1" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`flex flex-col items-center justify-center p-3 rounded border font-semibold ${
                      paymentMethod === "CARD"
                        ? "border-[var(--brand)] bg-[var(--canvas)] text-[var(--brand)] shadow-2xs"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line)]"
                    }`}
                  >
                    <CreditCard size={18} className="mb-1" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("NETBANKING")}
                    className={`flex flex-col items-center justify-center p-3 rounded border font-semibold ${
                      paymentMethod === "NETBANKING"
                        ? "border-[var(--brand)] bg-[var(--canvas)] text-[var(--brand)] shadow-2xs"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line)]"
                    }`}
                  >
                    <Building size={18} className="mb-1" />
                    <span>Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("WALLET")}
                    className={`flex flex-col items-center justify-center p-3 rounded border font-semibold ${
                      paymentMethod === "WALLET"
                        ? "border-[var(--brand)] bg-[var(--canvas)] text-[var(--brand)] shadow-2xs"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line)]"
                    }`}
                  >
                    <Wallet size={18} className="mb-1" />
                    <span>Wallet ({formatINR(sessionData.walletBalance)})</span>
                  </button>
                </div>
              </div>

              {/* UPI input if selected */}
              {paymentMethod === "UPI" && (
                <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3 text-xs">
                  <label className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi"
                    className="h-9 w-full rounded border border-[var(--line)] bg-white px-2.5 font-mono text-xs text-[var(--ink)]"
                  />
                  <span className="text-[10px] text-[var(--ink-muted)] mt-1 block">
                    Supported: Google Pay, PhonePe, Paytm, BHIM
                  </span>
                </div>
              )}

              {paymentError && (
                <div className="rounded border border-[#FAD2CF] bg-[#FCE8E6] p-3 text-xs text-[var(--danger)]">
                  {paymentError}
                </div>
              )}

              <div className="flex justify-between items-center border-t border-[var(--line)] pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={processingPayment}
                  onClick={handleProcessPayment}
                  className="flex items-center gap-2 rounded-md bg-[var(--brand)] px-8 py-3 text-xs font-semibold text-white hover:bg-[var(--brand-ink)] shadow-md disabled:opacity-50"
                >
                  <span>{processingPayment ? "Processing Gateway..." : `Pay ${formatINR(currentFareBreakdown.total)}`}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Fare & Promo Summary (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <FareBreakdown
            breakdown={currentFareBreakdown}
            passengerCount={passengers.length}
          />

          {/* Promo Code Box */}
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[var(--ink)] mb-2">
              <Tag size={14} className="text-[var(--brand)]" />
              <span>Promo Code</span>
            </div>

            {appliedPromo ? (
              <div className="flex items-center justify-between rounded bg-[#E6F4EA] p-2 text-xs font-bold text-[var(--ok)] border border-[#CEEAD6]">
                <span>Code {appliedPromo} Applied!</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromo(null);
                    setPromoDiscount(0);
                  }}
                  className="text-[var(--danger)] text-xs font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      if (promoError) setPromoError("");
                    }}
                    placeholder="WAYFARE10 / FLYSAFE"
                    className="h-9 flex-1 rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 font-mono text-xs uppercase text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={validatingPromo}
                    onClick={handleApplyPromo}
                    className="rounded bg-[var(--ink)] px-3 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
                  >
                    {validatingPromo ? "..." : "Apply"}
                  </button>
                </div>
                {promoError && (
                  <span className="text-[11px] text-[var(--danger)]">{promoError}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

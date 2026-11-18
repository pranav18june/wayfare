import { describe, it, expect } from "vitest";
import { calculateFare } from "../pricing";
import { calculateRefund } from "../refunds";
import { estimateTrainConfirmationProbability } from "../availability";
import { formatINR, formatTime, formatDuration } from "@/lib/utils/formatters";

describe("Domain: Pricing & Fare Calculation", () => {
  it("calculates basic flight fare with taxes and convenience fee", () => {
    const res = calculateFare({
      mode: "FLIGHT",
      baseFare: 4000,
      passengerCount: 2,
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.value.baseFare).toBe(8000);
    expect(res.value.taxes).toBe(960); // 12% of 8000
    expect(res.value.convenienceFee).toBe(250);
    expect(res.value.total).toBe(8000 + 960 + 250);
  });

  it("applies valid percentage promo code up to max discount", () => {
    const res = calculateFare({
      mode: "FLIGHT",
      baseFare: 5000,
      passengerCount: 1,
      promoCode: {
        code: "FLYSAFE",
        type: "PERCENTAGE",
        value: 20, // 20% of 5000 = 1000, capped at 500
        minAmount: 3000,
        maxDiscount: 500,
        modes: ["FLIGHT"],
        validTo: new Date("2028-01-01"),
      },
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.discount).toBe(500);
    expect(res.value.promoCode).toBe("FLYSAFE");
  });

  it("rejects non-positive base fare and passenger counts", () => {
    const res1 = calculateFare({
      mode: "FLIGHT",
      baseFare: 0,
      passengerCount: 1,
    });
    expect(res1.ok).toBe(false);

    const res2 = calculateFare({
      mode: "TRAIN",
      baseFare: 1000,
      passengerCount: 0,
    });
    expect(res2.ok).toBe(false);
  });
});

describe("Domain: Refund Policy Engine", () => {
  const departure = new Date("2026-11-25T10:00:00Z");

  it("awards 90% refund for flights cancelled > 72 hours in advance", () => {
    const cancelTime = new Date("2026-11-21T10:00:00Z"); // 96 hours before
    const res = calculateRefund({
      bookingId: "BKG_01",
      mode: "FLIGHT",
      totalPaid: 6000,
      scheduledDeparture: departure,
      cancellationTime: cancelTime,
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.refundPercentage).toBe(90);
    expect(res.value.refundableAmount).toBe(5400);
    expect(res.value.cancellationFee).toBe(600);
  });

  it("awards 20% refund for flights cancelled < 24 hours in advance", () => {
    const cancelTime = new Date("2026-11-24T18:00:00Z"); // 16 hours before
    const res = calculateRefund({
      bookingId: "BKG_02",
      mode: "FLIGHT",
      totalPaid: 5000,
      scheduledDeparture: departure,
      cancellationTime: cancelTime,
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.refundPercentage).toBe(20);
    expect(res.value.refundableAmount).toBe(1000);
  });

  it("returns 0% refund for cancellation after scheduled departure", () => {
    const cancelTime = new Date("2026-11-25T11:00:00Z"); // 1 hour after
    const res = calculateRefund({
      bookingId: "BKG_03",
      mode: "TRAIN",
      totalPaid: 1500,
      scheduledDeparture: departure,
      cancellationTime: cancelTime,
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.refundPercentage).toBe(0);
    expect(res.value.refundableAmount).toBe(0);
  });
});

describe("Domain: Train WL Confirmation Probability", () => {
  it("gives 100% confirmation for AVL seats", () => {
    const p = estimateTrainConfirmationProbability("AVL", 25, 5, "RAJDHANI");
    expect(p.probabilityPercent).toBe(100);
    expect(p.rating).toBe("HIGH");
  });

  it("estimates high confirmation for low RAC", () => {
    const p = estimateTrainConfirmationProbability("RAC", 4, 10, "EXPRESS");
    expect(p.probabilityPercent).toBeGreaterThanOrEqual(75);
  });

  it("estimates low probability for high WL close to departure", () => {
    const p = estimateTrainConfirmationProbability("WL", 35, 1, "EXPRESS");
    expect(p.probabilityPercent).toBeLessThan(40);
    expect(p.rating).toBe("LOW");
  });
});

describe("Domain: Utilities & Indian Rupee Formatter", () => {
  it("formats Indian Rupees with proper comma grouping", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(500)).toBe("₹500");
    expect(formatINR(1250)).toBe("₹1,250");
    expect(formatINR(24500)).toBe("₹24,500");
    expect(formatINR(1234567)).toBe("₹12,34,567");
  });

  it("formats duration minutes to human readable string", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(155)).toBe("2h 35m");
  });

  it("formats 24h and 12h times", () => {
    expect(formatTime("14:30", false)).toBe("14:30");
    expect(formatTime("14:30", true)).toBe("2:30 PM");
    expect(formatTime("09:15", true)).toBe("9:15 AM");
  });
});

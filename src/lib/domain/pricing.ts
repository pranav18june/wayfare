import { FareBreakdown, Result, Ok, Err, TravelMode } from "./types";

export interface PricingInput {
  mode: TravelMode;
  baseFare: number;
  passengerCount: number;
  promoCode?: {
    code: string;
    type: "PERCENTAGE" | "FLAT";
    value: number;
    minAmount: number;
    maxDiscount?: number | null;
    modes: string[];
    validTo: Date;
  } | null;
  addOns?: {
    insurance?: boolean;
    meals?: number;
    extraBaggage?: number;
  };
}

export const CONVENIENCE_FEES: Record<TravelMode, number> = {
  FLIGHT: 250,
  TRAIN: 50,
  BUS: 40,
  HOTEL: 100,
};

export const TAX_RATES: Record<TravelMode, number> = {
  FLIGHT: 0.12, // 12% GST
  TRAIN: 0.05,  // 5% GST on AC classes
  BUS: 0.05,    // 5% GST
  HOTEL: 0.12,  // 12% GST standard
};

/**
 * Pure domain function to calculate fare breakdown with server-side authoritativeness.
 */
export function calculateFare(input: PricingInput): Result<FareBreakdown> {
  if (input.baseFare <= 0) {
    return Err("Base fare must be greater than zero");
  }
  if (input.passengerCount <= 0) {
    return Err("Passenger count must be at least 1");
  }

  const rawBase = input.baseFare * input.passengerCount;

  // Add-ons
  let addOnsCost = 0;
  if (input.addOns?.insurance) {
    addOnsCost += 199 * input.passengerCount;
  }
  if (input.addOns?.meals) {
    addOnsCost += input.addOns.meals * 350;
  }
  if (input.addOns?.extraBaggage) {
    addOnsCost += input.addOns.extraBaggage * 450;
  }

  const subtotal = rawBase + addOnsCost;
  const taxRate = TAX_RATES[input.mode] || 0.05;
  const taxes = Math.round(subtotal * taxRate);
  const convenienceFee = CONVENIENCE_FEES[input.mode] || 50;

  let discount = 0;
  let appliedCode: string | undefined = undefined;

  if (input.promoCode) {
    const promo = input.promoCode;
    const now = new Date();
    if (promo.validTo >= now && subtotal >= promo.minAmount && promo.modes.includes(input.mode)) {
      appliedCode = promo.code;
      if (promo.type === "PERCENTAGE") {
        discount = Math.round((subtotal * promo.value) / 100);
        if (promo.maxDiscount && discount > promo.maxDiscount) {
          discount = promo.maxDiscount;
        }
      } else {
        discount = Math.min(promo.value, subtotal);
      }
    }
  }

  const total = Math.max(0, subtotal + taxes + convenienceFee - discount);

  return Ok({
    baseFare: rawBase,
    taxes,
    convenienceFee,
    discount,
    total,
    promoCode: appliedCode,
  });
}

// Result<T, E> type pattern for centralized domain operations
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export type TravelMode = "FLIGHT" | "TRAIN" | "BUS" | "HOTEL";

export interface FareBreakdown {
  baseFare: number;
  taxes: number;
  convenienceFee: number;
  discount: number;
  total: number;
  promoCode?: string;
}

export interface RefundCalculation {
  bookingId: string;
  totalPaid: number;
  cancellationFee: number;
  refundableAmount: number;
  refundPercentage: number;
  policyApplied: string;
  destination: "WALLET" | "ORIGINAL_PAYMENT";
}

export interface WLProbabilityResult {
  probabilityPercent: number; // 0 - 100
  rating: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
}

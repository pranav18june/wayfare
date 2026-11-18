import { RefundCalculation, TravelMode, Result, Ok, Err } from "./types";

export interface RefundInput {
  bookingId: string;
  mode: TravelMode;
  totalPaid: number;
  scheduledDeparture: Date;
  cancellationTime?: Date;
  hotelFreeCancellationCutoffHours?: number;
}

/**
 * Refund calculation engine enforcing policy tiers defined in docs/POLICIES.md
 */
export function calculateRefund(input: RefundInput): Result<RefundCalculation> {
  const cancelTime = input.cancellationTime || new Date();
  const timeToDepartureMs = input.scheduledDeparture.getTime() - cancelTime.getTime();
  const hoursToDeparture = timeToDepartureMs / (1000 * 60 * 60);

  if (hoursToDeparture < 0) {
    return Ok({
      bookingId: input.bookingId,
      totalPaid: input.totalPaid,
      cancellationFee: input.totalPaid,
      refundableAmount: 0,
      refundPercentage: 0,
      policyApplied: "Cancellation requested after scheduled departure. 0% refund.",
      destination: "WALLET",
    });
  }

  let refundPercent = 0;
  let policyText = "";

  switch (input.mode) {
    case "FLIGHT":
      if (hoursToDeparture > 72) {
        refundPercent = 90;
        policyText = "More than 72h prior to departure: 90% refund (10% airline cancellation charge).";
      } else if (hoursToDeparture >= 24) {
        refundPercent = 60;
        policyText = "Between 24h and 72h prior to departure: 60% refund (40% cancellation charge).";
      } else {
        refundPercent = 20;
        policyText = "Less than 24h prior to departure: 20% refund (80% late cancellation penalty).";
      }
      break;

    case "TRAIN":
      // Indian Railways tier slabs
      if (hoursToDeparture > 48) {
        refundPercent = 90;
        policyText = "More than 48h prior to departure: Flat clerkage deduction applied (90% refund).";
      } else if (hoursToDeparture >= 12) {
        refundPercent = 75;
        policyText = "Between 12h and 48h prior to departure: 25% cancellation charge (75% refund).";
      } else if (hoursToDeparture >= 4) {
        refundPercent = 50;
        policyText = "Between 4h and 12h prior to chart preparation: 50% cancellation charge (50% refund).";
      } else {
        refundPercent = 0;
        policyText = "Less than 4 hours before departure / Chart prepared: No refund admissible.";
      }
      break;

    case "BUS":
      if (hoursToDeparture > 24) {
        refundPercent = 85;
        policyText = "More than 24h before boarding: 85% refund (15% operator fee).";
      } else if (hoursToDeparture >= 12) {
        refundPercent = 50;
        policyText = "Between 12h and 24h before boarding: 50% refund.";
      } else {
        refundPercent = 0;
        policyText = "Less than 12h before boarding: Non-refundable.";
      }
      break;

    case "HOTEL":
      const cutoff = input.hotelFreeCancellationCutoffHours || 24;
      if (hoursToDeparture >= cutoff) {
        refundPercent = 100;
        policyText = `Free cancellation window: Full 100% refund (> ${cutoff}h before standard 14:00 check-in).`;
      } else {
        refundPercent = 40;
        policyText = "Late cancellation (< 24h): First night charge retained. 40% refund.";
      }
      break;

    default:
      return Err(`Unsupported travel mode for refund: ${input.mode}`);
  }

  const refundableAmount = Math.round((input.totalPaid * refundPercent) / 100);
  const cancellationFee = input.totalPaid - refundableAmount;

  return Ok({
    bookingId: input.bookingId,
    totalPaid: input.totalPaid,
    cancellationFee,
    refundableAmount,
    refundPercentage: refundPercent,
    policyApplied: policyText,
    destination: "WALLET",
  });
}

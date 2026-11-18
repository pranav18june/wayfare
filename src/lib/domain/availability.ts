import { WLProbabilityResult } from "./types";

/**
 * Heuristic prediction model for Indian Railways WL / RAC confirmation probability.
 * Clearly presented to the user as an estimate based on days to departure, train type, and WL count.
 */
export function estimateTrainConfirmationProbability(
  status: "AVL" | "RAC" | "WL",
  currentCount: number,
  daysToDeparture: number,
  trainType: string
): WLProbabilityResult {
  if (status === "AVL") {
    return {
      probabilityPercent: 100,
      rating: "HIGH",
      explanation: "Seats are currently available for instant confirmed booking.",
    };
  }

  if (status === "RAC") {
    // RAC has very high probability of berth allotment
    const prob = Math.min(98, Math.max(70, 95 - currentCount * 2 + daysToDeparture));
    return {
      probabilityPercent: prob,
      rating: prob >= 80 ? "HIGH" : "MEDIUM",
      explanation: "RAC guarantees travel onboard; high chance of full berth allocation upon chart preparation.",
    };
  }

  // WL Heuristics
  let baseProb = 85;

  // Deduction based on waiting list number
  baseProb -= currentCount * 2.5;

  // Premium trains have higher turnover and quota releases
  if (trainType === "RAJDHANI" || trainType === "SHATABDI") {
    baseProb += 12;
  } else if (trainType === "DURONTO") {
    baseProb += 8;
  }

  // Days buffer allows more cancellations to accrue
  if (daysToDeparture > 7) {
    baseProb += 10;
  } else if (daysToDeparture < 2) {
    baseProb -= 15;
  }

  const finalProb = Math.min(95, Math.max(8, Math.round(baseProb)));

  let rating: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let explanation = "Low chance of confirmation. Consider Tatkal quota or alternative trains.";

  if (finalProb >= 75) {
    rating = "HIGH";
    explanation = "Strong historical clearing trend. High probability of confirmation before charting.";
  } else if (finalProb >= 45) {
    rating = "MEDIUM";
    explanation = "Moderate clearing rate. Likely to move into RAC by chart preparation.";
  }

  return {
    probabilityPercent: finalProb,
    rating,
    explanation,
  };
}

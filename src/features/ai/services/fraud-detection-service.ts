import "server-only";

import {
  evaluateListingFraud,
  type FraudAlert,
  type FraudAlertSeverity,
} from "@/features/plastic/services/fraud";

export type { FraudAlert, FraudAlertSeverity };

export interface FraudEvaluationInput {
  confidence: number;
  aiCount: number;
  userCount: number;
  isDuplicateImage: boolean;
  decision?: string;
  /** Future-ready hooks */
  estimatedWeightGrams?: number;
  claimedWeightGrams?: number;
  processingTimeMs?: number;
}

/**
 * Practical fraud rules + extension points for future detectors.
 */
export function evaluateFraud(input: FraudEvaluationInput): FraudAlert[] {
  const alerts = evaluateListingFraud({
    confidence: input.confidence,
    aiCount: input.aiCount,
    userCount: input.userCount,
    isDuplicateImage: input.isDuplicateImage,
    decision: input.decision,
  });

  // Weight discrepancy (preview AI vs user claim) — medium severity.
  if (
    input.estimatedWeightGrams != null &&
    input.claimedWeightGrams != null &&
    input.claimedWeightGrams > 0 &&
    input.estimatedWeightGrams > 0
  ) {
    const ratio =
      Math.abs(input.estimatedWeightGrams - input.claimedWeightGrams) /
      Math.max(input.estimatedWeightGrams, input.claimedWeightGrams);
    if (ratio >= 0.45) {
      alerts.push({
        code: "WEIGHT_DISCREPANCY",
        message: "AI weight preview differs significantly from the claimed weight.",
        severity: "medium",
      });
    }
  }

  // Extremely fast "detection" can indicate replayed/cached abuse (future queue).
  if (input.processingTimeMs != null && input.processingTimeMs < 5) {
    alerts.push({
      code: "SUSPICIOUS_LATENCY",
      message: "Detection completed unusually quickly — verify image authenticity.",
      severity: "low",
    });
  }

  return alerts;
}

export function riskLevelFromAlerts(
  alerts: FraudAlert[],
): "none" | "low" | "medium" | "high" {
  if (alerts.some((a) => a.severity === "high")) return "high";
  if (alerts.some((a) => a.severity === "medium")) return "medium";
  if (alerts.length > 0) return "low";
  return "none";
}

export const FraudDetectionService = {
  evaluate: evaluateFraud,
  riskLevel: riskLevelFromAlerts,
};

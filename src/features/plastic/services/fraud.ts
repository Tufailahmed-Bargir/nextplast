import "server-only";

export type FraudAlertSeverity = "low" | "medium" | "high";

export interface FraudAlert {
  code: string;
  message: string;
  severity: FraudAlertSeverity;
}

/**
 * Practical fraud checks for college-project scope.
 * Extensible: add rules without changing the sell workflow.
 */
export function evaluateListingFraud(input: {
  confidence: number;
  aiCount: number;
  userCount: number;
  isDuplicateImage: boolean;
  decision?: string;
}): FraudAlert[] {
  const alerts: FraudAlert[] = [];

  if (input.confidence < 0.55) {
    alerts.push({
      code: "LOW_CONFIDENCE",
      message: "AI confidence is low — this listing may need manual review.",
      severity: "medium",
    });
  }

  if (input.isDuplicateImage) {
    alerts.push({
      code: "DUPLICATE_IMAGE",
      message: "This image matches a photo already used on another listing.",
      severity: "high",
    });
  }

  if (input.aiCount > 0 && input.userCount > 0) {
    const ratio =
      Math.abs(input.aiCount - input.userCount) /
      Math.max(input.aiCount, input.userCount);
    if (ratio >= 0.35) {
      alerts.push({
        code: "QUANTITY_MISMATCH",
        message: "User quantity differs significantly from AI estimate.",
        severity: "medium",
      });
    }
  }

  if (input.decision === "REJECT") {
    alerts.push({
      code: "AI_REJECT",
      message: "AI flagged this image for rejection — confirm contents carefully.",
      severity: "high",
    });
  }

  return alerts;
}

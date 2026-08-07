import "server-only";

/**
 * Preview-only weight estimates. Collector verification always wins for rewards.
 */
export const AVG_WEIGHT_GRAMS: Record<string, number> = {
  "PET Bottle": 28,
  "HDPE Bottle": 45,
  "Plastic Bag": 8,
  "Milk Packet": 12,
  Container: 35,
  Cup: 10,
  "Bottle Cap": 2.5,
  Bucket: 180,
  PVC: 60,
  Can: 15,
  Other: 25,
  PET: 28,
  HDPE: 45,
  PP: 20,
  LDPE: 12,
  PS: 18,
};

export function estimatePlasticWeightGrams(input: {
  detectedClass: string;
  detectedCount: number;
  confidence: number;
  plasticTypes?: string[];
}): number {
  const count = Math.max(0, input.detectedCount);
  if (count === 0) return 0;

  const types =
    input.plasticTypes && input.plasticTypes.length > 0
      ? input.plasticTypes
      : [input.detectedClass];

  const avg =
    types.reduce((sum, t) => sum + (AVG_WEIGHT_GRAMS[t] ?? 25), 0) / types.length;
  const confidenceFactor = 0.7 + 0.3 * Math.min(1, Math.max(0, input.confidence));
  return Math.round(count * avg * confidenceFactor);
}

export const WeightEstimationService = {
  estimate: estimatePlasticWeightGrams,
  averages: AVG_WEIGHT_GRAMS,
};

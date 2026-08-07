import "server-only";

/**
 * Combines model confidence, image quality, fraud pressure, and category certainty.
 */
export function calculateOverallConfidence(input: {
  modelConfidence: number;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageBytes?: number | null;
  categoryCertainty?: number;
  fraudAlertCount?: number;
}): number {
  const model = clamp(input.modelConfidence);
  const megapixels =
    input.imageWidth && input.imageHeight
      ? (input.imageWidth * input.imageHeight) / 1_000_000
      : 0.5;

  let quality = 0.55;
  if (megapixels >= 1) quality += 0.2;
  else if (megapixels >= 0.4) quality += 0.1;
  if ((input.imageBytes ?? 0) >= 80_000) quality += 0.1;
  if ((input.imageWidth ?? 999) < 320 || (input.imageHeight ?? 999) < 320) {
    quality -= 0.2;
  }
  quality = clamp(quality);

  const category = clamp(input.categoryCertainty ?? 0.7);
  let score = 0.55 * model + 0.25 * quality + 0.2 * category;

  const fraudCount = input.fraudAlertCount ?? 0;
  if (fraudCount > 0) {
    score -= Math.min(0.25, fraudCount * 0.08);
  }

  return Math.round(clamp(score) * 10000) / 10000;
}

function clamp(n: number): number {
  return Math.min(0.99, Math.max(0.05, n));
}

export const ConfidenceEngine = {
  calculate: calculateOverallConfidence,
};

import "server-only";

/**
 * Facade used by API routes and server actions.
 */
export { detectPlasticInImage } from "@/features/ai/services/plastic-detector";
export { DetectionService, detectAndPersist } from "@/features/ai/services/detection-service";
export {
  FraudDetectionService,
  evaluateFraud,
  riskLevelFromAlerts,
} from "@/features/ai/services/fraud-detection-service";
export {
  RecommendationService,
  generateRecommendations,
} from "@/features/ai/services/recommendation-service";
export {
  WeightEstimationService,
  estimatePlasticWeightGrams,
} from "@/features/ai/services/weight-estimation-service";
export {
  ImageHashService,
  hashImageBuffer,
} from "@/features/ai/services/image-hash-service";
export {
  ImageProcessingService,
  validateImageBuffer,
} from "@/features/ai/services/image-processing-service";
export {
  ConfidenceEngine,
  calculateOverallConfidence,
} from "@/features/ai/services/confidence-engine";
export { getAiServiceStatus, callAiDetect } from "@/features/ai/services/ai-client";
export { getAiAnalytics } from "@/features/ai/services/ai-analytics";

export const AIService = {
  detect: async (
    ...args: Parameters<typeof import("./plastic-detector").detectPlasticInImage>
  ) => {
    const { detectPlasticInImage } = await import("./plastic-detector");
    return detectPlasticInImage(...args);
  },
  status: async () => {
    const { getAiServiceStatus } = await import("./ai-client");
    return getAiServiceStatus();
  },
  analytics: async () => {
    const { getAiAnalytics } = await import("./ai-analytics");
    return getAiAnalytics();
  },
};

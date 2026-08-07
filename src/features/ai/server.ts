import "server-only";

export { AIService } from "@/features/ai/services/ai-service";
export { detectPlasticInImage } from "@/features/ai/services/plastic-detector";
export { DetectionService } from "@/features/ai/services/detection-service";
export { FraudDetectionService } from "@/features/ai/services/fraud-detection-service";
export { RecommendationService } from "@/features/ai/services/recommendation-service";
export { WeightEstimationService } from "@/features/ai/services/weight-estimation-service";
export { ImageHashService } from "@/features/ai/services/image-hash-service";
export { ImageProcessingService } from "@/features/ai/services/image-processing-service";
export { ConfidenceEngine } from "@/features/ai/services/confidence-engine";
export { getAiAnalytics } from "@/features/ai/services/ai-analytics";
export { getAiServiceStatus } from "@/features/ai/services/ai-client";

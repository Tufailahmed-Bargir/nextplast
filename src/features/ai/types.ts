/**
 * Shared AI recommendation item shape (safe for UI imports — no server-only).
 */
export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category:
    | "wallet"
    | "recycling"
    | "marketplace"
    | "impact"
    | "campaign"
    | "plastic";
  priority: number;
}

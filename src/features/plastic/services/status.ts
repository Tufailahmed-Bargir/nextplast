/**
 * Display helpers for listing / pickup lifecycle status.
 */
import type { ListingStatus, PickupStatus } from "@prisma/client";

export type LifecycleLabel =
  | "Draft"
  | "Submitted"
  | "AI Reviewed"
  | "Collector Assigned"
  | "Scheduled"
  | "Collected"
  | "Verified"
  | "Coins Credited"
  | "Cancelled"
  | "Rejected";

export function getListingLifecycleLabel(input: {
  listingStatus: ListingStatus;
  pickupStatus?: PickupStatus | null;
  finalCoins?: number | null;
}): LifecycleLabel {
  const { listingStatus, pickupStatus, finalCoins } = input;

  if (listingStatus === "CANCELLED") return "Cancelled";
  if (listingStatus === "AI_REJECTED") return "Rejected";
  if (listingStatus === "DRAFT") return "Draft";
  if (finalCoins != null && finalCoins > 0) return "Coins Credited";
  if (listingStatus === "COMPLETED" || pickupStatus === "COMPLETED") {
    return "Verified";
  }
  if (
    pickupStatus === "IN_TRANSIT" ||
    pickupStatus === "IN_PROGRESS" ||
    pickupStatus === "AWAITING_VERIFICATION" ||
    pickupStatus === "AWAITING_SIGNATURE"
  ) {
    return "Collected";
  }
  if (pickupStatus === "SCHEDULED") return "Scheduled";
  if (pickupStatus === "ASSIGNED") return "Collector Assigned";
  if (listingStatus === "SUBMITTED") return "Submitted";
  // Submitted listings waiting on assignment/review have already completed AI.
  if (
    listingStatus === "APPROVED" ||
    listingStatus === "PENDING_REVIEW" ||
    listingStatus === "AI_PROCESSING" ||
    listingStatus === "AWAITING_COLLECTOR"
  ) {
    return "AI Reviewed";
  }
  return "Submitted";
}

export function buildStatusTimeline(input: {
  listingStatus: ListingStatus;
  pickupStatus?: PickupStatus | null;
  finalCoins?: number | null;
  createdAt: Date;
  scheduledAt?: Date | null;
  completedAt?: Date | null;
}): { label: LifecycleLabel; done: boolean; at?: Date | null }[] {
  const current = getListingLifecycleLabel(input);
  const order: LifecycleLabel[] = [
    "Submitted",
    "AI Reviewed",
    "Collector Assigned",
    "Scheduled",
    "Collected",
    "Verified",
    "Coins Credited",
  ];

  const currentIndex = order.indexOf(current);

  return order.map((label, index) => ({
    label,
    done: currentIndex >= 0 ? index <= currentIndex : false,
    at:
      label === "Submitted"
        ? input.createdAt
        : label === "Scheduled"
          ? input.scheduledAt
          : label === "Verified" || label === "Collected"
            ? input.completedAt
            : null,
  }));
}

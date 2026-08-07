"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  FileText,
  Scan,
  Truck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/features/plastic/components/image-uploader";
import { DetectionSummary } from "@/features/plastic/components/detection-summary";
import {
  PlasticDetailsForm,
  type CategoryOption,
  type PlasticDetailsValue,
} from "@/features/plastic/components/plastic-details-form";
import {
  PickupScheduler,
  type PickupDetailsValue,
} from "@/features/plastic/components/pickup-scheduler";
import { CoinPreviewCard } from "@/features/plastic/components/coin-preview-card";
import {
  getPlasticCategoriesAction,
  getSellListingAction,
  runAiDetectionAction,
  saveDetectionEditsAction,
  savePickupDetailsAction,
  savePlasticDetailsAction,
  startSellListingAction,
  submitListingAction,
} from "@/features/plastic/actions/sell-actions";
import { estimateNatureCoins } from "@/features/plastic/services/coin-estimate";
import { mapListingDetections } from "@/features/plastic/lib/map-detections";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "AI Detection", icon: Scan },
  { id: 3, label: "Review AI", icon: Scan },
  { id: 4, label: "Details", icon: FileText },
  { id: 5, label: "Pickup", icon: Truck },
  { id: 6, label: "Submit", icon: Check },
] as const;

type ListingPayload = NonNullable<
  Extract<
    Awaited<ReturnType<typeof getSellListingAction>>,
    { success: true }
  >["data"]
>;

/**
 * Six-step Sell Plastic wizard — upload → AI → review → details → pickup → submit.
 */
export function SellWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [listingId, setListingId] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingPayload | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [pending, startTransition] = useTransition();
  const [detectionEdits, setDetectionEdits] = useState<
    {
      detectionId: string;
      userConfirmedCount: number;
      userConfirmedClass: string;
    }[]
  >([]);
  const [details, setDetails] = useState<PlasticDetailsValue>({
    quality: "MIXED",
    claimedWeightGrams: 5000,
    categoryId: "",
    claimedQuantity: 10,
    notes: "",
  });
  const [pickup, setPickup] = useState<PickupDetailsValue>({
    address: "",
    scheduledAt: "",
    specialInstructions: "",
  });

  const hydrateFromListing = useCallback(
    (
      data: ListingPayload,
      cats: CategoryOption[],
      options?: { resumeStep?: boolean },
    ) => {
      setListing(data);
      const firstItem = data.items[0];
      setDetails((prev) => ({
        quality: data.quality,
        claimedWeightGrams: data.claimedWeightGrams ?? prev.claimedWeightGrams,
        categoryId: firstItem?.categoryId ?? cats[0]?.id ?? prev.categoryId,
        claimedQuantity: firstItem?.claimedQuantity ?? prev.claimedQuantity,
        notes: data.notes ?? "",
      }));
      if (data.pickupRequest) {
        setPickup({
          address: data.pickupRequest.address,
          scheduledAt: data.pickupRequest.scheduledAt
            ? new Date(data.pickupRequest.scheduledAt).toISOString()
            : "",
          specialInstructions: data.pickupRequest.notes ?? "",
        });
      } else if (data.pickupAddress) {
        setPickup((prev) => ({ ...prev, address: data.pickupAddress ?? "" }));
      }

      if (!options?.resumeStep) return;

      // Resume wizard progress for reused DRAFT listings (initial load only).
      if (data.pickupRequest && data.aiResults.length > 0 && data.items.length > 0) {
        setStep(6);
      } else if (data.pickupRequest) {
        setStep(5);
      } else if (data.items.length > 0) {
        setStep(4);
      } else if (data.aiResults.length > 0) {
        setStep(3);
      } else if (data.images.length > 0) {
        setStep(2);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    startTransition(async () => {
      const [started, cats] = await Promise.all([
        startSellListingAction(),
        getPlasticCategoriesAction(),
      ]);
      if (!active) return;
      setCategories(cats);
      if (!started.success) {
        toast.error(started.error);
        return;
      }
      setListingId(started.data.listingId);
      const result = await getSellListingAction(started.data.listingId);
      if (!active || !result.success || !result.data) return;
      hydrateFromListing(result.data, cats, { resumeStep: true });
    });
    return () => {
      active = false;
    };
  }, [hydrateFromListing]);

  const refreshListing = useCallback(
    async (id: string) => {
      const result = await getSellListingAction(id);
      if (result.success && result.data) {
        hydrateFromListing(result.data, categories);
      }
    },
    [categories, hydrateFromListing],
  );

  const estimatedCoins = useMemo(
    () =>
      estimateNatureCoins({
        weightGrams: details.claimedWeightGrams,
        quality: details.quality,
      }),
    [details.claimedWeightGrams, details.quality],
  );

  const detections = listing
    ? mapListingDetections(listing.aiResults, listing.images)
    : [];

  function goNext() {
    setStep((s) => Math.min(6, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function runAi() {
    if (!listingId) return;
    if (!listing?.images.length) {
      toast.error("Upload at least one image first.");
      return;
    }
    startTransition(async () => {
      const result = await runAiDetectionAction(listingId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "AI detection complete");
      await refreshListing(listingId);
      goNext();
    });
  }

  function saveReviews() {
    if (!listingId) return;
    startTransition(async () => {
      if (detectionEdits.length > 0) {
        const result = await saveDetectionEditsAction({
          listingId,
          edits: detectionEdits,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
      }
      await refreshListing(listingId);
      goNext();
    });
  }

  function saveDetails() {
    if (!listingId || !details.categoryId) {
      toast.error("Select a plastic type.");
      return;
    }
    startTransition(async () => {
      const result = await savePlasticDetailsAction({
        listingId,
        quality: details.quality,
        claimedWeightGrams: details.claimedWeightGrams,
        notes: details.notes,
        items: [
          {
            categoryId: details.categoryId,
            claimedQuantity: details.claimedQuantity,
            claimedWeightGrams: details.claimedWeightGrams,
          },
        ],
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      await refreshListing(listingId);
      goNext();
    });
  }

  function savePickup() {
    if (!listingId) return;
    if (!pickup.address || !pickup.scheduledAt) {
      toast.error("Add address and pickup time.");
      return;
    }
    startTransition(async () => {
      const result = await savePickupDetailsAction({
        listingId,
        address: pickup.address,
        scheduledAt: pickup.scheduledAt,
        specialInstructions: pickup.specialInstructions || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      await refreshListing(listingId);
      goNext();
    });
  }

  function submit() {
    if (!listingId) return;
    startTransition(async () => {
      const result = await submitListingAction(listingId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Submitted");
      router.push(`/sell/${listingId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Sell Plastic</h2>
        <p className="text-sm text-muted-foreground">
          Upload photos, verify with AI, schedule pickup, and earn Nature Coins.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const active = step === item.id;
          const done = step > item.id;
          return (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  active && "bg-emerald-600 text-white shadow-glow",
                  done && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                  !active && !done && "bg-muted text-muted-foreground",
                )}
                title={item.label}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "hidden h-px w-6 sm:block",
                    done ? "bg-emerald-400" : "bg-border",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1]?.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && listingId ? (
            <>
              <ImageUploader
                listingId={listingId}
                images={(listing?.images ?? []).map((img) => ({
                  id: img.id,
                  url: img.url,
                  sortOrder: img.sortOrder,
                }))}
                onChanged={() => refreshListing(listingId)}
                disabled={pending}
              />
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Tip: Use good lighting and keep items spread out. Clean, sorted
                PET can earn a quality bonus.
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                AI analyzes your photos for plastic type, quantity estimates, and
                confidence. Results vary by image quality — not fixed demo data.
              </p>
              {detections.length > 0 ? (
                <DetectionSummary detections={detections} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click below to run detection on your uploaded photos.
                </p>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <DetectionSummary
              detections={detections}
              editable
              onEditChange={setDetectionEdits}
            />
          ) : null}

          {step === 4 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PlasticDetailsForm
                  categories={categories}
                  value={details}
                  onChange={setDetails}
                />
              </div>
              <CoinPreviewCard estimatedCoins={estimatedCoins} />
            </div>
          ) : null}

          {step === 5 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PickupScheduler value={pickup} onChange={setPickup} />
              </div>
              <CoinPreviewCard estimatedCoins={estimatedCoins} />
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-4">
              <CoinPreviewCard estimatedCoins={estimatedCoins} />
              <div className="rounded-xl border border-border p-4 text-sm">
                <p>
                  <strong>Weight:</strong>{" "}
                  {(details.claimedWeightGrams / 1000).toFixed(1)} kg ·{" "}
                  <strong>Quality:</strong> {details.quality}
                </p>
                <p className="mt-2">
                  <strong>Address:</strong> {pickup.address || listing?.pickupAddress}
                </p>
                <p className="mt-2 text-muted-foreground">
                  Submitting notifies admins for collector assignment. Final coins
                  are credited after Phase 6 verification.
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 1 ? () => router.push("/dashboard") : goBack}
              disabled={pending}
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            {step === 1 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={pending || !listing?.images.length}
              >
                Continue to AI <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
            {step === 2 ? (
              <Button type="button" onClick={runAi} disabled={pending}>
                {detections.length ? "Re-run AI" : "Run AI Detection"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
            {step === 2 && detections.length > 0 ? (
              <Button type="button" variant="outline" onClick={goNext} disabled={pending}>
                Review results
              </Button>
            ) : null}
            {step === 3 ? (
              <Button type="button" onClick={saveReviews} disabled={pending}>
                Save & continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
            {step === 4 ? (
              <Button type="button" onClick={saveDetails} disabled={pending}>
                Schedule pickup <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
            {step === 5 ? (
              <Button type="button" onClick={savePickup} disabled={pending}>
                Review submission <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
            {step === 6 ? (
              <Button type="button" onClick={submit} disabled={pending}>
                Confirm & submit <Check className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

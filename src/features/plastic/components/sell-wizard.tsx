"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  FileText,
  Loader2,
  Scan,
  Truck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/features/plastic/components/image-uploader";
import { DetectionSummary } from "@/features/plastic/components/detection-summary";
import { AiAnalyzingPanel } from "@/features/plastic/components/ai-analyzing-panel";
import {
  PlasticDetailsForm,
  type CategoryOption,
  type PlasticDetailsValue,
} from "@/features/plastic/components/plastic-details-form";
import {
  PickupScheduler,
  validatePickupAddress,
  type PickupAddressErrors,
  type PickupDetailsValue,
} from "@/features/plastic/components/pickup-scheduler";
import {
  EMPTY_ADDRESS_PARTS,
  composeAddress,
  parseComposedAddress,
} from "@/features/geo/lib/address";
import type { AddressParts } from "@/features/geo/types";
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

/** Category for the plastic type with the most confirmed items in the AI review. */
/** Typical resin for each detection label, used when an item has no resin code. */
const LABEL_RESIN: Record<string, string> = {
  "PET BOTTLE": "PET",
  "HDPE BOTTLE": "HDPE",
  "PLASTIC BAG": "LDPE",
  "MILK PACKET": "LDPE",
  CONTAINER: "PP",
  "BOTTLE CAP": "PP",
  BUCKET: "HDPE",
  CUP: "PS",
  PVC: "PVC",
};

function dominantCategoryId(
  aiResults: ListingPayload["aiResults"],
  cats: CategoryOption[],
): string | undefined {
  const totals = new Map<string, number>();
  const add = (resin: string, count: number) =>
    totals.set(resin, (totals.get(resin) ?? 0) + count);
  for (const row of aiResults) {
    const boxes =
      (row.rawPayload as { boxes?: { label: string; resin?: string }[] } | null)
        ?.boxes ?? [];
    if (boxes.length > 0) {
      for (const box of boxes) {
        const label = box.label.toUpperCase();
        add(box.resin ?? LABEL_RESIN[label] ?? label, 1);
      }
      continue;
    }
    const label = (row.userConfirmedClass ?? row.detectedClass).toUpperCase();
    add(
      LABEL_RESIN[label] ?? label,
      row.userConfirmedCount ?? row.detectedCount,
    );
  }
  let dominant: string | undefined;
  let best = -1;
  for (const [resin, count] of totals) {
    if (count > best) {
      dominant = resin;
      best = count;
    }
  }
  return cats.find((c) => c.resinType.toUpperCase() === dominant)?.id;
}

/**
 * Six-step Sell Plastic wizard — upload → AI → review → details → pickup → submit.
 */
export function SellWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [listingId, setListingId] = useState<string | null>(null);
  const [startFailed, setStartFailed] = useState(false);
  const [startAttempt, setStartAttempt] = useState(0);
  const [listing, setListing] = useState<ListingPayload | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [pending, startTransition] = useTransition();
  const [aiRunning, setAiRunning] = useState(false);
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
    addressParts: { ...EMPTY_ADDRESS_PARTS },
    latitude: null,
    longitude: null,
    pinLookup: null,
    scheduledAt: "",
    specialInstructions: "",
  });
  const [pickupErrors, setPickupErrors] = useState<PickupAddressErrors>({});
  const clearPickupErrors = useCallback((keys: (keyof AddressParts)[]) => {
    setPickupErrors((prev) => {
      if (!keys.some((k) => prev[k])) return prev;
      const next = { ...prev };
      for (const k of keys) delete next[k];
      return next;
    });
  }, []);

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
        categoryId:
          firstItem?.categoryId ??
          dominantCategoryId(data.aiResults, cats) ??
          cats[0]?.id ??
          prev.categoryId,
        claimedQuantity: firstItem?.claimedQuantity ?? prev.claimedQuantity,
        notes: data.notes ?? "",
      }));
      if (data.pickupRequest) {
        setPickup({
          addressParts: parseComposedAddress(data.pickupRequest.address),
          latitude: data.pickupRequest.latitude,
          longitude: data.pickupRequest.longitude,
          pinLookup: null,
          scheduledAt: data.pickupRequest.scheduledAt
            ? new Date(data.pickupRequest.scheduledAt).toISOString()
            : "",
          specialInstructions: data.pickupRequest.notes ?? "",
        });
      } else if (data.pickupAddress) {
        setPickup((prev) => ({
          ...prev,
          addressParts: parseComposedAddress(data.pickupAddress),
        }));
      }

      if (!options?.resumeStep) return;

      // Resume wizard progress for reused DRAFT listings (initial load only).
      if (
        data.pickupRequest &&
        data.aiResults.length > 0 &&
        data.items.length > 0
      ) {
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
        setStartFailed(true);
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
  }, [hydrateFromListing, startAttempt]);

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
  // Item quantity follows the confirmed review so the two never disagree.
  // A confirmed total of 0 is a real answer, so only the absence of a review falls back.
  const hasReview = detections.length > 0;
  const confirmedQuantity = detections.reduce(
    (sum, d) => sum + (d.userConfirmedCount ?? d.detectedCount),
    0,
  );
  const itemQuantity = hasReview ? confirmedQuantity : details.claimedQuantity;

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
    setAiRunning(true);
    startTransition(async () => {
      try {
        const result = await runAiDetectionAction(listingId);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(result.message ?? "AI detection complete");
        await refreshListing(listingId);
        goNext();
      } finally {
        setAiRunning(false);
      }
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
            claimedQuantity: itemQuantity,
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
    if (!pickup.scheduledAt) {
      toast.error("Choose a pickup date.");
      return;
    }
    const addressErrors = validatePickupAddress(pickup);
    setPickupErrors(addressErrors);
    if (Object.keys(addressErrors).length > 0) {
      toast.error("Please fix the highlighted address fields.");
      return;
    }
    startTransition(async () => {
      const result = await savePickupDetailsAction({
        listingId,
        addressParts: pickup.addressParts,
        latitude: pickup.latitude,
        longitude: pickup.longitude,
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
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Sell Plastic</h2>
        <p className="text-muted-foreground text-sm">
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
                  active && "shadow-glow bg-emerald-600 text-white",
                  done &&
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                  !active && !done && "bg-muted text-muted-foreground",
                )}
                title={item.label}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
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
          {step === 1 && !listingId ? (
            startFailed ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-muted-foreground text-sm">
                  We couldn&apos;t start your listing.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStartFailed(false);
                    setStartAttempt((n) => n + 1);
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : (
              <div
                role="status"
                className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm"
              >
                <Loader2 className="text-primary h-5 w-5 animate-spin" />
                Preparing your listing…
              </div>
            )
          ) : null}

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
              <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border p-4 text-sm">
                Tip: Use good lighting and keep items spread out. Clean, sorted
                PET can earn a quality bonus.
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                AI analyzes your photos for plastic type, quantity estimates,
                and confidence. Results vary by image quality — not fixed demo
                data.
              </p>
              {aiRunning ? (
                <AiAnalyzingPanel imageCount={listing?.images.length ?? 0} />
              ) : detections.length > 0 ? (
                <DetectionSummary detections={detections} />
              ) : (
                <p className="text-muted-foreground text-sm">
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
                  confirmedQuantity={hasReview ? confirmedQuantity : undefined}
                />
              </div>
              <CoinPreviewCard estimatedCoins={estimatedCoins} />
            </div>
          ) : null}

          {step === 5 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PickupScheduler
                  value={pickup}
                  onChange={setPickup}
                  addressErrors={pickupErrors}
                  onAddressFieldsEdited={clearPickupErrors}
                />
              </div>
              <CoinPreviewCard estimatedCoins={estimatedCoins} />
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-4">
              <CoinPreviewCard estimatedCoins={estimatedCoins} />
              <div className="border-border rounded-xl border p-4 text-sm">
                <p>
                  <strong>Weight:</strong>{" "}
                  {(details.claimedWeightGrams / 1000).toFixed(1)} kg ·{" "}
                  <strong>Quality:</strong> {details.quality}
                </p>
                <p className="mt-2">
                  <strong>Address:</strong>{" "}
                  {composeAddress(pickup.addressParts) ||
                    listing?.pickupAddress}
                </p>
                <p className="text-muted-foreground mt-2">
                  Submitting notifies admins for collector assignment. Final
                  coins are credited after Phase 6 verification.
                </p>
              </div>
            </div>
          ) : null}

          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
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
              <Button
                type="button"
                onClick={runAi}
                disabled={pending}
                aria-busy={aiRunning}
              >
                {aiRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    {detections.length ? "Re-run AI" : "Run AI Detection"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : null}
            {step === 2 && detections.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goNext}
                disabled={pending}
              >
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

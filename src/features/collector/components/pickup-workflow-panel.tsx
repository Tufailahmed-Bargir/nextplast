"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OtpVerification } from "@/features/collector/components/otp-verification";
import {
  WeightEntryForm,
  type WeightEntryValue,
} from "@/features/collector/components/weight-entry-form";
import {
  QualityGradeCard,
  type VerifiedQuality,
} from "@/features/collector/components/quality-grade-card";
import { ProofUploader } from "@/features/collector/components/proof-uploader";
import { CoinPreviewCard } from "@/features/plastic/components/coin-preview-card";
import { estimateNatureCoins } from "@/features/plastic/services/coin-estimate";
import {
  acceptPickupAction,
  completeVerificationAction,
  markArrivedAction,
} from "@/features/collector/actions/collector-actions";
import type { PickupStatus } from "@prisma/client";

interface PickupWorkflowPanelProps {
  pickupId: string;
  status: PickupStatus;
  claimedWeightGrams?: number | null;
  claimedQuantity?: number | null;
  claimedQuality?: string | null;
}

/**
 * Stepwise collector workflow: accept → arrive → OTP → verify → complete.
 */
export function PickupWorkflowPanel({
  pickupId,
  status,
  claimedWeightGrams,
  claimedQuantity,
  claimedQuality,
}: PickupWorkflowPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [weight, setWeight] = useState<WeightEntryValue>({
    actualWeightGrams: claimedWeightGrams ?? 5000,
    actualQuantity: claimedQuantity ?? 1,
  });
  const [quality, setQuality] = useState<VerifiedQuality>(
    (claimedQuality as VerifiedQuality) || "MIXED",
  );
  const [notes, setNotes] = useState("");
  const [customerConfirmed, setCustomerConfirmed] = useState(false);
  const [proof, setProof] = useState<{ url: string; publicId: string } | null>(
    null,
  );

  const otpVerified =
    status === "AWAITING_VERIFICATION" ||
    status === "AWAITING_SIGNATURE" ||
    status === "COMPLETED";

  const canVerifyDetails = status === "AWAITING_VERIFICATION";

  const estimatedCoins = useMemo(
    () =>
      estimateNatureCoins({
        weightGrams: weight.actualWeightGrams,
        quality,
      }),
    [weight.actualWeightGrams, quality],
  );

  function run(
    action: () => Promise<{
      success: boolean;
      error?: string;
      message?: string;
    }>,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        toast.error(result.error ?? "Action failed");
        return;
      }
      toast.success(result.message ?? "Updated");
      router.refresh();
    });
  }

  if (status === "COMPLETED") {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-emerald-700 dark:text-emerald-300">
          This pickup is completed. Wallet credit and inventory handoff are
          already recorded.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Collector workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(status === "ASSIGNED" || status === "SCHEDULED") && (
            <div className="flex flex-wrap gap-2">
              {status === "ASSIGNED" ? (
                <Button
                  type="button"
                  loading={pending}
                  onClick={() => run(() => acceptPickupAction(pickupId))}
                >
                  Accept pickup
                </Button>
              ) : null}
              {status === "SCHEDULED" ? (
                <Button
                  type="button"
                  variant="secondary"
                  loading={pending}
                  onClick={() => run(() => markArrivedAction(pickupId))}
                >
                  Verify arrival
                </Button>
              ) : null}
            </div>
          )}

          {(status === "IN_PROGRESS" || otpVerified) && (
            <OtpVerification
              pickupId={pickupId}
              verified={otpVerified}
              disabled={pending || status !== "IN_PROGRESS"}
              onVerified={() => router.refresh()}
            />
          )}
        </CardContent>
      </Card>

      {canVerifyDetails ? (
        <Card>
          <CardHeader>
            <CardTitle>Verification & complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <WeightEntryForm
                  value={weight}
                  onChange={setWeight}
                  claimedWeightGrams={claimedWeightGrams}
                  claimedQuantity={claimedQuantity}
                />
                <QualityGradeCard
                  value={quality}
                  onChange={setQuality}
                  claimedQuality={claimedQuality}
                />
                <ProofUploader
                  pickupId={pickupId}
                  proofUrl={proof?.url}
                  onUploaded={setProof}
                  disabled={pending}
                />
                <div className="space-y-2">
                  <Label htmlFor="collector-notes">Collector notes</Label>
                  <Textarea
                    id="collector-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Condition, sorting notes, discrepancies…"
                  />
                </div>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={customerConfirmed}
                    onChange={(e) => setCustomerConfirmed(e.target.checked)}
                  />
                  <span>
                    Customer confirmed handover of the plastic waste (required).
                  </span>
                </label>
              </div>
              <CoinPreviewCard estimatedCoins={estimatedCoins} />
            </div>

            <Button
              type="button"
              loading={pending}
              onClick={() =>
                run(async () => {
                  const result = await completeVerificationAction({
                    pickupId,
                    actualQuantity: weight.actualQuantity,
                    actualWeightGrams: weight.actualWeightGrams,
                    verifiedQuality: quality,
                    notes: notes || undefined,
                    customerConfirmed,
                    proofImageUrl: proof?.url,
                    proofPublicId: proof?.publicId,
                  });
                  return result;
                })
              }
            >
              Complete pickup & credit coins
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

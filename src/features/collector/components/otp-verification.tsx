"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOtpAction } from "@/features/collector/actions/collector-actions";
import { COLLECTOR_OTP_LENGTH } from "@/validations/collector";

interface OtpVerificationProps {
  pickupId: string;
  verified: boolean;
  onVerified: () => void;
  disabled?: boolean;
  locked?: boolean;
}

/**
 * Customer OTP entry for collector arrival confirmation.
 */
export function OtpVerification({
  pickupId,
  verified,
  onVerified,
  disabled,
  locked = false,
}: OtpVerificationProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await verifyOtpAction({ pickupId, otp });
      if (!result.success) {
        toast.error(result.error);
        // Re-sync so the lockout state appears as soon as the limit is hit.
        router.refresh();
        return;
      }
      toast.success(result.message ?? "OTP verified");
      onVerified();
    });
  }

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-emerald-600">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-semibold">
          OTP verified — continue verification
        </span>
      </div>
    );
  }

  if (locked) {
    return (
      <p className="text-destructive text-sm">
        Too many incorrect OTP attempts. Contact an admin to continue this
        pickup.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-1">
        <KeyRound className="h-3.5 w-3.5" /> Customer OTP
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value.replace(/\D/g, "").slice(0, COLLECTOR_OTP_LENGTH),
            )
          }
          placeholder={`${COLLECTOR_OTP_LENGTH}-digit OTP`}
          maxLength={COLLECTOR_OTP_LENGTH}
          className="font-mono tracking-widest"
          disabled={disabled || pending}
        />
        <Button
          type="button"
          onClick={submit}
          disabled={disabled || otp.length !== COLLECTOR_OTP_LENGTH}
          loading={pending}
        >
          {pending ? "Verifying…" : "Verify OTP"}
        </Button>
      </div>
    </div>
  );
}

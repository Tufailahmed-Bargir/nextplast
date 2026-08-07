import "server-only";

import { createHash, randomInt, timingSafeEqual } from "crypto";
import {
  COLLECTOR_OTP_LENGTH,
  MAX_OTP_ATTEMPTS,
} from "@/validations/collector";
import { env } from "@/config/env";

export function hashPickupOtp(otp: string): string {
  return createHash("sha256")
    .update(`${env.NEXTAUTH_SECRET}:pickup-otp:${otp.trim()}`)
    .digest("hex");
}

export function generatePickupOtp(): string {
  const max = 10 ** COLLECTOR_OTP_LENGTH;
  const value = randomInt(0, max);
  return value.toString().padStart(COLLECTOR_OTP_LENGTH, "0");
}

export function verifyPickupOtp(
  rawOtp: string,
  otpHash: string | null,
): boolean {
  if (!otpHash) return false;
  const hashed = hashPickupOtp(rawOtp);
  try {
    const a = Buffer.from(hashed, "hex");
    const b = Buffer.from(otpHash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isOtpLocked(failCount: number): boolean {
  return failCount >= MAX_OTP_ATTEMPTS;
}

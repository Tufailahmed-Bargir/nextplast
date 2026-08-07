-- Phase 6 stabilize: OTP fail counter for rate limiting
ALTER TABLE "pickup_requests"
ADD COLUMN IF NOT EXISTS "otpFailCount" INTEGER NOT NULL DEFAULT 0;

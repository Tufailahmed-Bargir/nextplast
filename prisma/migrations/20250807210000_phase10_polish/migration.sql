-- Phase 10: soft-delete + referral codes
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "users_deletedAt_idx" ON "users"("deletedAt");

ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_referralCode_key" ON "user_profiles"("referralCode");
CREATE INDEX IF NOT EXISTS "user_profiles_referralCode_idx" ON "user_profiles"("referralCode");

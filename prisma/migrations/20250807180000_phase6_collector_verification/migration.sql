-- Phase 6: collector verification quality + customer confirmation
ALTER TABLE "collector_verifications"
ADD COLUMN IF NOT EXISTS "verifiedQuality" "PlasticQuality" NOT NULL DEFAULT 'MIXED';

ALTER TABLE "collector_verifications"
ADD COLUMN IF NOT EXISTS "customerConfirmed" BOOLEAN NOT NULL DEFAULT false;

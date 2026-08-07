-- DropForeignKey
ALTER TABLE "collector_verifications" DROP CONSTRAINT "collector_verifications_pickupRequestId_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_recyclerId_fkey";

-- DropForeignKey
ALTER TABLE "listing_images" DROP CONSTRAINT "listing_images_categoryId_fkey";

-- DropIndex
DROP INDEX "listing_images_listingId_idx";

-- DropIndex
DROP INDEX "listing_items_listingId_idx";

-- DropIndex
DROP INDEX "user_profiles_deletedAt_idx";

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "ownerKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "listing_images" ALTER COLUMN "categoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "deletedAt";

-- CreateIndex
CREATE UNIQUE INDEX "inventory_ownerKey_categoryId_grade_key" ON "inventory"("ownerKey", "categoryId", "grade");

-- CreateIndex
CREATE INDEX "listing_images_categoryId_idx" ON "listing_images"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_items_listingId_categoryId_key" ON "listing_items"("listingId", "categoryId");

-- CreateIndex
CREATE INDEX "pickup_requests_status_createdAt_idx" ON "pickup_requests"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "plastic_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collector_verifications" ADD CONSTRAINT "collector_verifications_pickupRequestId_fkey" FOREIGN KEY ("pickupRequestId") REFERENCES "pickup_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_recyclerId_fkey" FOREIGN KEY ("recyclerId") REFERENCES "recyclers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- DropForeignKey
ALTER TABLE "listing_images" DROP CONSTRAINT "listing_images_categoryId_fkey";

-- DropIndex
DROP INDEX "listing_images_listingId_categoryId_key";

-- AlterTable
ALTER TABLE "ai_detection_results" ADD COLUMN     "userConfirmedClass" TEXT,
ADD COLUMN     "userConfirmedCount" INTEGER;

-- AlterTable
ALTER TABLE "listing_images" ADD COLUMN     "bytes" INTEGER,
ADD COLUMN     "contentHash" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "listing_images_listingId_idx" ON "listing_images"("listingId");

-- CreateIndex
CREATE INDEX "listing_images_contentHash_idx" ON "listing_images"("contentHash");

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "plastic_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;


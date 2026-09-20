-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable: add both new columns nullable first, backfill, then enforce NOT NULL below.
ALTER TABLE "Advertisement" ADD COLUMN "assetType" "AssetType";
ALTER TABLE "AdPlacement" ADD COLUMN "adType" "AdType";

-- Backfill: an existing ad's old fixed adType tells us what kind of file it is (banners were
-- always uploaded as images, pre/mid-roll always as video - enforced by the old create-time check).
UPDATE "Advertisement"
SET "assetType" = CASE WHEN "adType" = 'BANNER_OVERLAY' THEN 'IMAGE' ELSE 'VIDEO' END::"AssetType";

-- Backfill: every existing placement inherits the adType its advertisement used to carry.
UPDATE "AdPlacement" AS placement
SET "adType" = advertisement."adType"
FROM "Advertisement" AS advertisement
WHERE advertisement.id = placement."advertisementId";

-- AlterTable: now that every row has a value, enforce NOT NULL and drop the old column.
ALTER TABLE "Advertisement" ALTER COLUMN "assetType" SET NOT NULL;
ALTER TABLE "AdPlacement" ALTER COLUMN "adType" SET NOT NULL;
ALTER TABLE "Advertisement" DROP COLUMN "adType";

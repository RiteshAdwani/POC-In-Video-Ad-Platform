-- DropForeignKey
ALTER TABLE "DailyCount" DROP CONSTRAINT "DailyCount_adPlacementId_fkey";

-- DropForeignKey
ALTER TABLE "PlaybackEvent" DROP CONSTRAINT "PlaybackEvent_adPlacementId_fkey";

-- AddForeignKey
ALTER TABLE "PlaybackEvent" ADD CONSTRAINT "PlaybackEvent_adPlacementId_fkey" FOREIGN KEY ("adPlacementId") REFERENCES "AdPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCount" ADD CONSTRAINT "DailyCount_adPlacementId_fkey" FOREIGN KEY ("adPlacementId") REFERENCES "AdPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

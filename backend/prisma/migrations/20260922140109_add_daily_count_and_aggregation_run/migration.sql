-- CreateEnum
CREATE TYPE "AggregationRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "DailyCount" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "adPlacementId" TEXT,
    "eventType" "PlaybackEventType" NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregationRun" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "status" "AggregationRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "rowsUpserted" INTEGER,
    "error" TEXT,

    CONSTRAINT "AggregationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCount_ad_scoped_key" ON "DailyCount"("videoId", "adPlacementId", "eventType", "day") WHERE ("adPlacementId" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCount_video_scoped_key" ON "DailyCount"("videoId", "eventType", "day") WHERE ("adPlacementId" IS NULL);

-- CreateIndex
CREATE INDEX "AggregationRun_day_idx" ON "AggregationRun"("day");

-- CreateIndex
CREATE INDEX "AggregationRun_status_idx" ON "AggregationRun"("status");

-- CreateIndex
CREATE INDEX "PlaybackEvent_videoId_eventType_occurredAt_idx" ON "PlaybackEvent"("videoId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "PlaybackEvent_adPlacementId_eventType_occurredAt_idx" ON "PlaybackEvent"("adPlacementId", "eventType", "occurredAt");

-- AddForeignKey
ALTER TABLE "DailyCount" ADD CONSTRAINT "DailyCount_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCount" ADD CONSTRAINT "DailyCount_adPlacementId_fkey" FOREIGN KEY ("adPlacementId") REFERENCES "AdPlacement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

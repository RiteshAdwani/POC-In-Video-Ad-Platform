-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('PRE_ROLL', 'MID_ROLL', 'BANNER_OVERLAY');

-- CreateEnum
CREATE TYPE "PlaybackEventType" AS ENUM ('VIDEO_STARTED', 'VIDEO_FINISHED', 'AD_SHOWN', 'AD_SKIPPED', 'AD_COMPLETED', 'AD_CLICKED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING',
    "externalId" TEXT,
    "playbackUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCreative" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "adType" "AdType" NOT NULL,
    "assetUrl" TEXT NOT NULL,
    "clickThroughUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "AdCreative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdPlacement" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "adCreativeId" TEXT NOT NULL,
    "startOffsetSeconds" INTEGER NOT NULL,
    "durationSeconds" INTEGER,
    "skipAfterSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybackEvent" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "adPlacementId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" "PlaybackEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaybackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdCreative" ADD CONSTRAINT "AdCreative_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdPlacement" ADD CONSTRAINT "AdPlacement_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdPlacement" ADD CONSTRAINT "AdPlacement_adCreativeId_fkey" FOREIGN KEY ("adCreativeId") REFERENCES "AdCreative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybackEvent" ADD CONSTRAINT "PlaybackEvent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybackEvent" ADD CONSTRAINT "PlaybackEvent_adPlacementId_fkey" FOREIGN KEY ("adPlacementId") REFERENCES "AdPlacement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Event dedup, part 1: ad-scoped events (AD_SHOWN, AD_SKIPPED, AD_COMPLETED, AD_CLICKED).
-- The same ad placement, in the same session, for the same event type, is one fact.
CREATE UNIQUE INDEX "PlaybackEvent_session_ad_event_dedup"
    ON "PlaybackEvent" ("sessionId", "eventType", "adPlacementId")
    WHERE "adPlacementId" IS NOT NULL;

-- Event dedup, part 2: video-level events (VIDEO_STARTED, VIDEO_FINISHED) - adPlacementId is
-- always NULL here, and NULL is never equal to NULL in a standard unique index, so this needs
-- its own rule scoped to just (sessionId, eventType) rather than relying on the index above.
CREATE UNIQUE INDEX "PlaybackEvent_session_video_event_dedup"
    ON "PlaybackEvent" ("sessionId", "eventType")
    WHERE "adPlacementId" IS NULL;

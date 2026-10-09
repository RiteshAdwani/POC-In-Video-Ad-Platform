-- Aligns every database identifier with the snake_case naming standard. Renames only - no data
-- moves, so every row, index, and constraint is kept as-is.

-- Enum types
ALTER TYPE "VideoStatus" RENAME TO video_status;
ALTER TYPE "AdType" RENAME TO ad_type;
ALTER TYPE "AssetType" RENAME TO asset_type;
ALTER TYPE "PlaybackEventType" RENAME TO playback_event_type;
ALTER TYPE "AggregationRunStatus" RENAME TO aggregation_run_status;

-- Tables
ALTER TABLE "Admin" RENAME TO admins;
ALTER TABLE "Video" RENAME TO videos;
ALTER TABLE "Advertisement" RENAME TO advertisements;
ALTER TABLE "AdPlacement" RENAME TO ad_placements;
ALTER TABLE "PlaybackEvent" RENAME TO playback_events;
ALTER TABLE "DailyCount" RENAME TO daily_counts;
ALTER TABLE "AggregationRun" RENAME TO aggregation_runs;

-- Columns
ALTER TABLE admins RENAME COLUMN "passwordHash" TO password_hash;
ALTER TABLE admins RENAME COLUMN "firstName" TO first_name;
ALTER TABLE admins RENAME COLUMN "lastName" TO last_name;
ALTER TABLE admins RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE admins RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE videos RENAME COLUMN "externalId" TO external_id;
ALTER TABLE videos RENAME COLUMN "playbackUrl" TO playback_url;
ALTER TABLE videos RENAME COLUMN "durationSeconds" TO duration_seconds;
ALTER TABLE videos RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE videos RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE videos RENAME COLUMN "deletedAt" TO deleted_at;
ALTER TABLE videos RENAME COLUMN "authorId" TO admin_id;
ALTER TABLE advertisements RENAME COLUMN "assetType" TO asset_type;
ALTER TABLE advertisements RENAME COLUMN "assetUrl" TO asset_url;
ALTER TABLE advertisements RENAME COLUMN "clickThroughUrl" TO click_through_url;
ALTER TABLE advertisements RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE advertisements RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE advertisements RENAME COLUMN "deletedAt" TO deleted_at;
ALTER TABLE advertisements RENAME COLUMN "authorId" TO admin_id;
ALTER TABLE ad_placements RENAME COLUMN "adType" TO ad_type;
ALTER TABLE ad_placements RENAME COLUMN "startOffsetSeconds" TO start_offset_seconds;
ALTER TABLE ad_placements RENAME COLUMN "durationSeconds" TO duration_seconds;
ALTER TABLE ad_placements RENAME COLUMN "skipAfterSeconds" TO skip_after_seconds;
ALTER TABLE ad_placements RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE ad_placements RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE ad_placements RENAME COLUMN "deletedAt" TO deleted_at;
ALTER TABLE ad_placements RENAME COLUMN "videoId" TO video_id;
ALTER TABLE ad_placements RENAME COLUMN "advertisementId" TO advertisement_id;
ALTER TABLE playback_events RENAME COLUMN "videoId" TO video_id;
ALTER TABLE playback_events RENAME COLUMN "adPlacementId" TO ad_placement_id;
ALTER TABLE playback_events RENAME COLUMN "sessionId" TO session_id;
ALTER TABLE playback_events RENAME COLUMN "eventType" TO event_type;
ALTER TABLE playback_events RENAME COLUMN "occurredAt" TO occurred_at;
ALTER TABLE playback_events RENAME COLUMN "receivedAt" TO received_at;
ALTER TABLE daily_counts RENAME COLUMN "videoId" TO video_id;
ALTER TABLE daily_counts RENAME COLUMN "adPlacementId" TO ad_placement_id;
ALTER TABLE daily_counts RENAME COLUMN "eventType" TO event_type;
ALTER TABLE daily_counts RENAME COLUMN "day" TO event_date;
ALTER TABLE daily_counts RENAME COLUMN "count" TO event_count;
ALTER TABLE daily_counts RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE aggregation_runs RENAME COLUMN "day" TO event_date;
ALTER TABLE aggregation_runs RENAME COLUMN "startedAt" TO started_at;
ALTER TABLE aggregation_runs RENAME COLUMN "completedAt" TO completed_at;
ALTER TABLE aggregation_runs RENAME COLUMN "rowsUpserted" TO rows_upserted;

-- Primary keys
ALTER TABLE admins RENAME CONSTRAINT "Admin_pkey" TO admins_pkey;
ALTER TABLE videos RENAME CONSTRAINT "Video_pkey" TO videos_pkey;
ALTER TABLE advertisements RENAME CONSTRAINT "Advertisement_pkey" TO advertisements_pkey;
ALTER TABLE ad_placements RENAME CONSTRAINT "AdPlacement_pkey" TO ad_placements_pkey;
ALTER TABLE playback_events RENAME CONSTRAINT "PlaybackEvent_pkey" TO playback_events_pkey;
ALTER TABLE daily_counts RENAME CONSTRAINT "DailyCount_pkey" TO daily_counts_pkey;
ALTER TABLE aggregation_runs RENAME CONSTRAINT "AggregationRun_pkey" TO aggregation_runs_pkey;

-- Foreign keys
ALTER TABLE videos RENAME CONSTRAINT "Video_authorId_fkey" TO videos_admin_id_fkey;
ALTER TABLE advertisements RENAME CONSTRAINT "Advertisement_authorId_fkey" TO advertisements_admin_id_fkey;
ALTER TABLE ad_placements RENAME CONSTRAINT "AdPlacement_videoId_fkey" TO ad_placements_video_id_fkey;
ALTER TABLE ad_placements RENAME CONSTRAINT "AdPlacement_advertisementId_fkey" TO ad_placements_advertisement_id_fkey;
ALTER TABLE playback_events RENAME CONSTRAINT "PlaybackEvent_videoId_fkey" TO playback_events_video_id_fkey;
ALTER TABLE playback_events RENAME CONSTRAINT "PlaybackEvent_adPlacementId_fkey" TO playback_events_ad_placement_id_fkey;
ALTER TABLE daily_counts RENAME CONSTRAINT "DailyCount_videoId_fkey" TO daily_counts_video_id_fkey;
ALTER TABLE daily_counts RENAME CONSTRAINT "DailyCount_adPlacementId_fkey" TO daily_counts_ad_placement_id_fkey;

-- Unique and plain indexes
ALTER INDEX "Admin_email_key" RENAME TO admins_email_key;
ALTER INDEX "PlaybackEvent_session_ad_event_dedup" RENAME TO playback_events_ad_event_dedup_key;
ALTER INDEX "PlaybackEvent_session_video_event_dedup" RENAME TO playback_events_video_event_dedup_key;
ALTER INDEX "DailyCount_ad_scoped_key" RENAME TO daily_counts_ad_scoped_key;
ALTER INDEX "DailyCount_video_scoped_key" RENAME TO daily_counts_video_scoped_key;
ALTER INDEX "PlaybackEvent_occurredAt_idx" RENAME TO playback_events_occurred_at_idx;
ALTER INDEX "PlaybackEvent_videoId_eventType_occurredAt_idx" RENAME TO playback_events_video_id_event_type_occurred_at_idx;
ALTER INDEX "PlaybackEvent_adPlacementId_eventType_occurredAt_idx" RENAME TO playback_events_ad_placement_id_event_type_occurred_at_idx;
ALTER INDEX "AggregationRun_day_idx" RENAME TO aggregation_runs_event_date_idx;
ALTER INDEX "AggregationRun_status_idx" RENAME TO aggregation_runs_status_idx;

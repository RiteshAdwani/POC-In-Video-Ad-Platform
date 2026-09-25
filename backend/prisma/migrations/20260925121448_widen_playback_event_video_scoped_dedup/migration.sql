-- Widen the video-level dedup rule to also scope by videoId - as written, it only checked
-- (sessionId, eventType), which doesn't actually pin the rule to one video at all.
DROP INDEX "PlaybackEvent_session_video_event_dedup";

CREATE UNIQUE INDEX "PlaybackEvent_session_video_event_dedup"
    ON "PlaybackEvent" ("sessionId", "videoId", "eventType")
    WHERE "adPlacementId" IS NULL;

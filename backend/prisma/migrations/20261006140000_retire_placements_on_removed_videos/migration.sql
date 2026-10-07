-- Retire any still-live placement on an already-removed video, stamped with the video's own removal time.
UPDATE "AdPlacement" AS p
SET "deletedAt" = v."deletedAt"
FROM "Video" AS v
WHERE p."videoId" = v."id"
  AND p."deletedAt" IS NULL
  AND v."deletedAt" IS NOT NULL;

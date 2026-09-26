-- AlterEnum: drop the unused UPLOADING value (no code path ever set it; every Video is created
-- with an explicit PROCESSING or FAILED status, never left to the schema default).
BEGIN;
CREATE TYPE "VideoStatus_new" AS ENUM ('PROCESSING', 'READY', 'FAILED');
ALTER TABLE "Video" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Video" ALTER COLUMN "status" TYPE "VideoStatus_new" USING ("status"::text::"VideoStatus_new");
ALTER TYPE "VideoStatus" RENAME TO "VideoStatus_old";
ALTER TYPE "VideoStatus_new" RENAME TO "VideoStatus";
DROP TYPE "VideoStatus_old";
ALTER TABLE "Video" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
COMMIT;

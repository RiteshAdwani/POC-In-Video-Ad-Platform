-- Rename, not drop+recreate - preserves data and existing constraints/relations.

-- RenameTable
ALTER TABLE "AdCreative" RENAME TO "Advertisement";

-- RenameColumn
ALTER TABLE "AdPlacement" RENAME COLUMN "adCreativeId" TO "advertisementId";

-- Rename constraints to match what Prisma's naming convention would generate fresh, so a
-- future `prisma migrate dev` diff doesn't see a mismatch and propose renaming them itself.
ALTER TABLE "Advertisement" RENAME CONSTRAINT "AdCreative_pkey" TO "Advertisement_pkey";
ALTER TABLE "Advertisement" RENAME CONSTRAINT "AdCreative_authorId_fkey" TO "Advertisement_authorId_fkey";
ALTER TABLE "AdPlacement" RENAME CONSTRAINT "AdPlacement_adCreativeId_fkey" TO "AdPlacement_advertisementId_fkey";

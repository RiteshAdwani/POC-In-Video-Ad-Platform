import { afterAll, beforeAll, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { APP_SCHEMA, PRISMA_MIGRATIONS_TABLE } from './test.constants';

/**
 * @description Call at the top of an integration test file: every test starts from empty tables,
 * and the connection pool closes once the file is done.
 */
export const resetDatabaseBeforeEachTest = () => {
  let truncateStatement = '';

  // Read the table list from the migrated schema, so a new table is emptied without a code change.
  beforeAll(async () => {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = ${APP_SCHEMA} AND tablename <> ${PRISMA_MIGRATIONS_TABLE}`;
    const tableList = tables.map(({ tablename }) => `"${APP_SCHEMA}"."${tablename}"`).join(', ');
    truncateStatement = `TRUNCATE TABLE ${tableList} CASCADE`;
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(truncateStatement);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
};

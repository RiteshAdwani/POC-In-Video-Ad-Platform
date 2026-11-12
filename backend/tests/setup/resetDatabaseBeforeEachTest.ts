import { afterAll, beforeAll, beforeEach } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { TEST_DATABASE_SCHEMA, TEST_MIGRATIONS_TABLE } from '../helpers/test.constants';

/**
 * @description Call first inside an integration file's describe block: every test starts from
 * empty tables, and the connection pool closes once the file is done.
 */
export const resetDatabaseBeforeEachTest = () => {
  let truncateStatement = '';

  // Read the table list from the migrated schema, so a new table is emptied without a code change.
  beforeAll(async () => {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = ${TEST_DATABASE_SCHEMA} AND tablename <> ${TEST_MIGRATIONS_TABLE}`;
    const tableList = tables
      .map(({ tablename }) => `"${TEST_DATABASE_SCHEMA}"."${tablename}"`)
      .join(', ');
    truncateStatement = `TRUNCATE TABLE ${tableList} CASCADE`;
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(truncateStatement);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
};

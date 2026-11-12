import { describe, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { createAdmin, createVideo } from '../support/factories';
import { resetDatabaseBeforeEachTest } from '../support/resetDatabaseBeforeEachTest';
import { TEST_DATABASE_SUFFIX } from '../support/test.constants';

resetDatabaseBeforeEachTest();

describe('test database harness', () => {
  it('connects to the dedicated test database, never the dev one', async () => {
    const [{ current_database: databaseName }] = await prisma.$queryRaw<
      { current_database: string }[]
    >`SELECT current_database()`;

    expect(databaseName.endsWith(TEST_DATABASE_SUFFIX)).toBe(true);
  });

  it('has every migration applied, so factories can write rows', async () => {
    const admin = await createAdmin();
    await createVideo(admin);

    expect(await prisma.video.count()).toBe(1);
  });

  // Runs after the test above inserted rows - proves truncation between tests.
  it('starts each test from empty tables', async () => {
    expect(await prisma.admin.count()).toBe(0);
    expect(await prisma.video.count()).toBe(0);
  });
});

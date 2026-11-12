import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { Client } from 'pg';
import { getTestDatabaseUrl } from './testDatabase';
import { TEST_PRISMA_CLI_ENTRY, TEST_MIGRATE_DEPLOY_ARGS } from '../helpers/test.constants';

/**
 * @description Runs once before the whole suite: creates the test database if it doesn't exist
 * yet, then applies every migration to it - the same `migrate deploy` the container runs on start.
 */
const setupTestDatabase = async () => {
  const testDatabaseUrl = getTestDatabaseUrl();
  const testDatabaseName = new URL(testDatabaseUrl).pathname.slice(1);

  // CREATE DATABASE can't run inside the database it creates - connect to the server's default one.
  const maintenanceUrl = new URL(testDatabaseUrl);
  maintenanceUrl.pathname = '/postgres';
  const client = new Client({ connectionString: maintenanceUrl.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      testDatabaseName,
    ]);
    if (!rowCount) {
      await client.query(`CREATE DATABASE "${testDatabaseName}"`);
    }
  } finally {
    await client.end();
  }

  execFileSync(
    process.execPath,
    [require.resolve(TEST_PRISMA_CLI_ENTRY), ...TEST_MIGRATE_DEPLOY_ARGS],
    {
      cwd: path.resolve(__dirname, '../..'),
      env: { ...process.env, DATABASE_URL: testDatabaseUrl },
      stdio: 'ignore',
    },
  );
};

export default setupTestDatabase;

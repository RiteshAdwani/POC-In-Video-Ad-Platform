import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';
import { prisma } from '../src/lib/prisma';
import { SEED_PASSWORD, SeedMessages } from '../src/constants/seed.constants';

/**
 * @description Seeds 2 dev admins with a known password. Refuses to run against production.
 */
const main = async () => {
  // This creates admins with a hardcoded, publicly-known password - fine for a disposable local
  // database, never acceptable against a real one. Nothing in this repo wires `npm run seed`
  // into any deploy step, but this guard makes that mistake structurally impossible too.
  if (env.NODE_ENV === 'production') {
    console.error(SeedMessages.CANNOT_SEED_PROD_DB);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const admins = [
    { email: 'alice@example.com', firstName: 'Alice', lastName: 'Anderson' },
    { email: 'bob@example.com', firstName: 'Bob', lastName: 'Brooks' },
  ];

  for (const admin of admins) {
    // upsert, not create - re-running the seed shouldn't fail on a unique constraint.
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: { ...admin, passwordHash },
    });
  }

  console.log(`Seeded ${admins.length} admins`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

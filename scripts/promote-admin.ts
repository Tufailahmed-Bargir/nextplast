/**
 * Ops helper: promote a user to ADMIN by email.
 * Usage: bun run scripts/promote-admin.ts user@example.com
 *
 * Public registration always creates USER accounts.
 * Collector/Recycler roles are assigned in /admin/users after you have an Admin.
 */
import { PrismaClient, UserRole } from "@prisma/client";

const email = process.argv[2]?.toLowerCase().trim();

if (!email) {
  console.error("Usage: bun run scripts/promote-admin.ts <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: UserRole.ADMIN },
  });

  console.log(`Promoted ${updated.email} → ${updated.role}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

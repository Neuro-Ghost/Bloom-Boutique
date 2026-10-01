import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  const existing = await prisma.adminUser.findFirst();
  if (!existing) {
    throw new Error("No admin user found in the database");
  }

  await prisma.adminUser.update({
    where: { id: existing.id },
    data: {
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  console.log(`Admin credentials updated for ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

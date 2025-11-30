import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function getHashedPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function main() {
  console.log("Seeding database...");
  /**
  await prisma.refreshToken.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.user.deleteMany({});
  */
  const user = await prisma.user.create({
    data: {
      username: "user",
      email: "user@example.com",
      password: await getHashedPassword("userpass"),
      role: "USER",
    },
  });
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@example.com",
      password: await getHashedPassword("adminpass"),
      role: "ADMIN",
    },
  });
  await prisma.note.create({
    data: {
      title: "Hello world note 1",
      content: "This belongs to USER account",
      userId: user.id,
    },
  });
  await prisma.note.create({
    data: {
      title: "Hello world note2",
      content: "This belongs to USER account",
      userId: user.id,
    },
  });
  await prisma.note.create({
    data: {
      title: "Admin note 1",
      content: "This one belongs to the admin",
      userId: admin.id,
    },
  });
  await prisma.note.create({
    data: {
      title: "Admin note 2",
      content: "This one belongs to the admin",
      userId: admin.id,
    },
  });
  console.log("Done seeding");
}

try {
  await main();
} catch (err) {
  if (err instanceof Error) {
    console.error("Encountered error while seeding\n" + err.message + "\n" + err.stack);
  }
} finally {
  await prisma.$disconnect();
}

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function main() {}

try {
  await main();
} catch (err) {
  if (err instanceof Error) {
    console.error(`Encountered error while seeding\n${err.message}\n${err.stack}`);
  }
} finally {
  await prisma.$disconnect();
}

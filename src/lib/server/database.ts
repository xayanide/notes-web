import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { dev } from "$app/environment";
import { DATABASE_URL } from "$env/static/private";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// In development, frameworks like Vite or SvelteKit hot-reload modules constantly.
// If you just export const prisma = new PrismaClient(), you could create multiple PrismaClient instances.
// So as a solution we reuse the instance when needed
if (dev) {
    globalForPrisma.prisma = prisma;
    console.warn("Running in development environment, reusing prisma instance");
}

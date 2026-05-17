import { PrismaClient } from "@prisma/client";

// We create ONE shared Prisma instance for the whole app.
// In development, nodemon restarts the server on every file save,
// which would create hundreds of DB connections without this pattern.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

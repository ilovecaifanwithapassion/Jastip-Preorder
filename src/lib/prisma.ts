import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// In Vercel serverless environment, filesystem is read-only except /tmp
if (process.env.VERCEL) {
  const tmpDbPath = "/tmp/dev.db";
  const projectDbPath = path.join(process.cwd(), "prisma", "dev.db");
  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(projectDbPath)) {
      fs.copyFileSync(projectDbPath, tmpDbPath);
    }
  } catch (err) {
    console.warn("Failed copying sqlite db to /tmp on Vercel:", err);
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const dbUrl = process.env.VERCEL ? "file:/tmp/dev.db" : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import { PrismaClient } from "./generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const DATABASE_PROVIDER = (process.env.DATABASE_PROVIDER || "postgresql").toLowerCase();

function buildDatabaseUrl(): string {
  // Priority: Use DATABASE_URL if provided directly
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Build from individual components
  const protocol = DATABASE_PROVIDER === "mysql" ? "mysql" : "postgresql";

  // MySQL variables
  const host = process.env.DB_HOST || "localhost";
  const port = DATABASE_PROVIDER === "mysql"
    ? (process.env.DB_PORT || "3306")
    : (process.env.DB_PORT || "5432");
  const user = process.env.DB_USER || process.env.DB_USERNAME || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || process.env.DB_DATABASE || "test";

  return `${protocol}://${user}:${password}@${host}:${port}/${database}`;
}

export const prisma = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const log = isDevelopment
    ? ["error", "warn"]
    : ["error"];

  let client: PrismaClient;

  if (DATABASE_PROVIDER === "mysql") {
    // MySQL / MariaDB adapter - use individual config
    const dbUrl = new URL(buildDatabaseUrl());
    const adapter = new PrismaMariaDb({
      host: dbUrl.hostname || "localhost",
      port: parseInt(dbUrl.port || "3306"),
      user: dbUrl.username || "root",
      password: dbUrl.password || "",
      database: dbUrl.pathname.replace("/", "") || "test",
      connectionLimit: isDevelopment ? 1 : 10,
    });

    client = new PrismaClient({ adapter, log: log as never });

    if (isDevelopment) {
      console.log("Database: MySQL/MariaDB connected");
    }
  } else {
    // PostgreSQL adapter (default)
    // Neon: use pgbouncer-compatible settings (no prepared statements, short idle timeout)
    const isNeon = buildDatabaseUrl().includes("neon.tech");
    const pool = new Pool({
      connectionString: buildDatabaseUrl(),
      max: isDevelopment ? 5 : isNeon ? 10 : 20,
      min: 0,
      idleTimeoutMillis: isNeon ? 30000 : (isProduction ? 60000 : 5000),
      connectionTimeoutMillis: 15000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      allowExitOnIdle: true,
    });

    pool.on("error", (err) => {
      console.error("PostgreSQL pool error:", err.message);
      // Don't crash on connection errors — pool will reconnect
    });
    if (isDevelopment) {
      console.log("Database: PostgreSQL connected");
    }

    const adapter = new PrismaPg(pool);
    client = new PrismaClient({ adapter, log: log as never });

    if (!isProduction) {
      globalForPrisma.pgPool = pool;
    }
  }

  const shutdown = async () => {
    console.log("Shutting down database...");
    await client.$disconnect();
    console.log("Database closed");
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  if (!isProduction) {
    globalForPrisma.prisma = client;
  }

  return client;
})();

export default prisma;

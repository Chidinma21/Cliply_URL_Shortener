import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const requiredEnvs = [
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DB",
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "PORT",
  "HOST_URL",
  "REDIS_HOST",
  "REDIS_PORT",
];

const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

if (missingEnvs.length > 0) {
  console.error(
    "CONFIG ERROR: The following environment variables are missing:",
  );
  console.error(missingEnvs.join(", "));
  process.exit(1);
}

const config = {
  db: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    url:
      process.env.DATABASE_URL ||
      `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?sslmode=disable`,
  },
  server: {
    port: parseInt(process.env.PORT, 10),
    hostUrl: process.env.HOST_URL,
  },
  cache: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    ttl: parseInt(process.env.REDIS_TTL, 10) || 86400,
  },
};

export default config;

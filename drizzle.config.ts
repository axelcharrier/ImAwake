import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations need a session-mode connection; the app itself can use the transaction pooler.
  dbCredentials: { url: (process.env.DIRECT_URL || process.env.DATABASE_URL)! },
});

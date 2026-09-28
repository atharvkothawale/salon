import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

async function applyMigrations() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
  const dbUrl = process.env.DATABASE_URL || process.argv[3];

  let connectionString = dbUrl;
  if (!connectionString && dbPassword) {
    connectionString = `postgres://postgres:${encodeURIComponent(dbPassword)}@db.rjirqofvknwxefbtotni.supabase.co:5432/postgres`;
  }

  if (!connectionString) {
    console.error("ERROR: No DB password or connection string provided.");
    console.error("Usage: npx tsx scratch_apply_migration.ts <DB_PASSWORD> [CONNECTION_STRING]");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully to PostgreSQL!");

    // 1. Run Migration 1
    const mig1Path = path.join(process.cwd(), "supabase", "migrations", "20260927000000_init_salon_schema.sql");
    console.log(`Applying migration: ${mig1Path}`);
    const mig1Sql = fs.readFileSync(mig1Path, "utf8");
    await client.query(mig1Sql);
    console.log("✓ Migration 20260927000000_init_salon_schema.sql applied successfully!");

    // 2. Run Migration 2 (Storage bucket)
    const mig2Path = path.join(process.cwd(), "supabase", "migrations", "20260927000001_create_avatars_bucket.sql");
    if (fs.existsSync(mig2Path)) {
      console.log(`Applying migration: ${mig2Path}`);
      const mig2Sql = fs.readFileSync(mig2Path, "utf8");
      await client.query(mig2Sql);
      console.log("✓ Migration 20260927000001_create_avatars_bucket.sql applied successfully!");
    }

    // 3. Run Seed SQL
    const seedPath = path.join(process.cwd(), "supabase", "seed.sql");
    if (fs.existsSync(seedPath)) {
      console.log(`Applying seed data: ${seedPath}`);
      const seedSql = fs.readFileSync(seedPath, "utf8");
      await client.query(seedSql);
      console.log("✓ Seed data applied successfully!");
    }

    console.log("=== ALL MIGRATIONS AND SEED DATA APPLIED SUCCESSFULLY ===");
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();

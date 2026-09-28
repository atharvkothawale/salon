import { Client } from "pg";

const pass = "Qja@sa10n";

const configurations = [
  // 1. Direct connection with postgres user
  { host: "db.rjirqofvknwxefbtotni.supabase.co", port: 5432, user: "postgres" },
  // 2. Direct connection with postgres.rjirqofvknwxefbtotni user
  { host: "db.rjirqofvknwxefbtotni.supabase.co", port: 5432, user: "postgres.rjirqofvknwxefbtotni" },
  // 3. Pooler session mode
  { host: "aws-0-us-east-1.pooler.supabase.com", port: 5432, user: "postgres.rjirqofvknwxefbtotni" },
  // 4. Pooler transaction mode
  { host: "aws-0-us-east-1.pooler.supabase.com", port: 6543, user: "postgres.rjirqofvknwxefbtotni" },
  // 5. ap-south-1 pooler (India)
  { host: "aws-0-ap-south-1.pooler.supabase.com", port: 5432, user: "postgres.rjirqofvknwxefbtotni" },
  { host: "aws-0-ap-south-1.pooler.supabase.com", port: 6543, user: "postgres.rjirqofvknwxefbtotni" },
  // 6. eu-central-1 pooler
  { host: "aws-0-eu-central-1.pooler.supabase.com", port: 5432, user: "postgres.rjirqofvknwxefbtotni" },
  { host: "aws-0-eu-central-1.pooler.supabase.com", port: 6543, user: "postgres.rjirqofvknwxefbtotni" },
];

async function testConfig() {
  for (const cfg of configurations) {
    console.log(`Testing host=${cfg.host}:${cfg.port} user=${cfg.user}`);
    const client = new Client({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: pass,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    try {
      await client.connect();
      console.log(`\n🎉 SUCCESS! Connected to ${cfg.host}:${cfg.port} with user=${cfg.user}!`);
      await client.end();
      return cfg;
    } catch (err: unknown) {
      const error = err as Error;
      console.log(`Failed: ${error.message}`);
    }
  }
}

testConfig();

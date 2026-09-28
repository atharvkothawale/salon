import { Client } from "pg";

const regions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-south-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "sa-east-1",
  "ca-central-1",
];

const pass = "Qja@sa10n";
const projectRef = "rjirqofvknwxefbtotni";

async function findPooler() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const user = `postgres.${projectRef}`;
    console.log(`Checking region [${region}] (${host})...`);
    
    const client = new Client({
      host,
      port: 6543,
      user,
      password: pass,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000,
    });

    try {
      await client.connect();
      console.log(`\n==========================================`);
      console.log(`🎉 MATCH FOUND! Region is: ${region}`);
      console.log(`Connection host: ${host}`);
      console.log(`==========================================\n`);
      await client.end();
      return { host, region };
    } catch (err: unknown) {
      const error = err as Error;
      if (!error.message.includes("ENOTFOUND")) {
        console.log(`   --> ${region} response:`, error.message);
      }
    }
  }
}

findPooler();

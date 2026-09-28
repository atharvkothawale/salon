import { Client } from "pg";

const host = "aws-0-ap-northeast-2.pooler.supabase.com";
const user = "postgres.rjirqofvknwxefbtotni";

const candidates = [
  "Qja@sa10n",
  "Qja@salon",
  "qja@sa10n",
  "QJA@SA10N",
  "Qja@sa10n!",
  "Qja@sa10n#",
  "Qja@sa10n$",
  "Qja@sa10n1",
  "Qja@sa10n123",
  "Qja@sa10n2026",
  "Qja@sa10n@123",
  "Qja@sa10n_",
  "Qja@sa10n-",
  "sb_publishable_NY94zgGpnTlRZuu2Zxq06A_G1irMgqq",
];

async function testVariations() {
  for (const pass of candidates) {
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
      console.log(`\n🎉 BINGO! Password matched: [${pass}]`);
      await client.end();
      return pass;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes("password authentication failed")) {
        console.log(`Failed for [${pass}]`);
      } else {
        console.log(`Error for [${pass}]:`, error.message);
      }
    }
  }
}

testVariations();

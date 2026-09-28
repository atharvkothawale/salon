import { Client } from "pg";

const candidates = [
  "Qja@sa10n",
  "sb_publishable_NY94zgGpnTlRZuu2Zxq06A_G1irMgqq",
  "Qja@sa10n ",
  "Qja@sa10n\n",
  "Qja@sa10n@terminal",
];

async function testPasswords() {
  for (const pass of candidates) {
    const cleanPass = pass.trim();
    console.log(`Testing password candidate: [${cleanPass}]`);
    const client = new Client({
      connectionString: `postgres://postgres:${encodeURIComponent(cleanPass)}@db.rjirqofvknwxefbtotni.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      console.log(`SUCCESS! Password is: [${cleanPass}]`);
      await client.end();
      return cleanPass;
    } catch (err: unknown) {
      const error = err as Error;
      console.log(`Failed for [${cleanPass}]:`, error.message);
    }
  }
}

testPasswords();

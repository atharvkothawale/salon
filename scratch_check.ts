import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const envVars: Record<string, string> = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log("--- Checking Supabase DB state using Anon Key ---");

  const tables = [
    "service_categories",
    "services",
    "staff",
    "staff_services",
    "business_hours",
    "salon_settings",
    "profiles",
    "appointments",
    "reviews",
    "appointment_events"
  ];

  for (const table of tables) {
    const { data, count, error } = await supabase
      .from(table)
      .select("*", { count: "exact" });

    if (error) {
      console.log(`[${table}] ERROR:`, error.message, "| Code:", error.code);
    } else {
      console.log(`[${table}] Exact count:`, count, "| Rows returned:", data?.length);
      if (data && data.length > 0) {
        console.log(`   Sample item:`, JSON.stringify(data[0]).slice(0, 100));
      }
    }
  }
}

checkTables();

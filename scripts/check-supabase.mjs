import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log("Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL);

  const tables = ["profiles", "venues", "courts", "bookings", "games", "game_participants", "friendships", "player_ratings", "notifications"];
  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`Table ${table}: ERROR -> ${error.message} (code: ${error.code})`);
    } else {
      console.log(`Table ${table}: OK -> row count: ${count}`);
    }
  }
}

check();

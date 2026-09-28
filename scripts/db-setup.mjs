// Applies supabase/schema.sql through the Supabase Management API (uses SUPABASE_ACCESS_TOKEN).
import { readFile } from "node:fs/promises";

const ref = process.env.SUPABASE_PROJECT_REF;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!ref || !token) {
  console.error("Missing SUPABASE_PROJECT_REF or SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

const sql = await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`✖ Schema failed (${res.status}):`, body);
  process.exit(1);
}
console.log("✔ Schema applied");

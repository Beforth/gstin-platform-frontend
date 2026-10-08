// Point vercel.json at your backend:  npm run set-backend -- https://api.example.com
// The destination must be a literal in vercel.json (Vercel cannot read env vars there), so this edits it for you.
import fs from "node:fs";

const arg = process.argv[2];
let origin;
try {
  const u = new URL(arg);
  if (u.protocol !== "https:") throw new Error("must be https");
  if (u.pathname !== "/" || u.search || u.hash) throw new Error("give the host only, with no path");
  origin = u.origin;
} catch (e) {
  console.error(`Usage: npm run set-backend -- https://your-backend-host\n${arg ? `Problem: "${arg}" ${e.message}` : ""}`);
  process.exit(1);
}

const file = new URL("../vercel.json", import.meta.url);
const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
let n = 0;
for (const r of cfg.rewrites) {
  if (/^https?:\/\//.test(r.destination)) {
    r.destination = r.destination.replace(/^https?:\/\/[^/]+/, origin);
    n++;
  }
}
fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
console.log(`Updated ${n} API rewrites to ${origin}`);
console.log(`Backend must allow this dashboard: ALLOWED_ORIGINS=https://<your-vercel-domain> and TRUST_PROXY=2 (see README).`);

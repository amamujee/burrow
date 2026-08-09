import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const packId = args.includes("--pack") ? args[args.indexOf("--pack") + 1] : args.find((arg) => !arg.startsWith("-"));

if (!packId) {
  console.error("Usage: npm run check:category -- --pack <pack-id>");
  process.exit(1);
}

const packFile = path.join("content", "packs", packId, "pack.json");
if (!fs.existsSync(packFile)) {
  console.error(`No category pack found at ${packFile}`);
  process.exit(1);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const steps = [
  { label: `Validate ${packId}`, command: process.execPath, args: ["scripts/validate-packs.mjs", "--pack", packId] },
  { label: "Check local images", command: process.execPath, args: ["scripts/check-images.mjs"] },
  { label: "Audit content", command: process.execPath, args: ["scripts/qa-content.mjs"] },
  { label: "Lint", command: npm, args: ["run", "lint"] },
  { label: "Run logic and integration coverage", command: npm, args: ["run", "test:logic"] },
];

for (const step of steps) {
  console.log(`\n==> ${step.label}`);
  const result = spawnSync(step.command, step.args, { stdio: "inherit" });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`\nCategory preflight passed for ${packId}. Run npm run verify before publishing.`);

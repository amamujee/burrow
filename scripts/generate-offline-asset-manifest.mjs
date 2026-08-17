import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const publicRoot = path.join(process.cwd(), "public");
const assetsRoot = path.join(publicRoot, "burrow-assets");
const manifestPath = path.join(publicRoot, "offline-assets.json");
const supportedExtensions = new Set([".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const checkOnly = process.argv.includes("--check");

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});

if (!fs.existsSync(assetsRoot)) {
  console.error(`Missing offline asset directory: ${assetsRoot}`);
  process.exit(1);
}

const assets = {};
const versionHash = crypto.createHash("sha256");
let totalBytes = 0;

for (const filePath of walk(assetsRoot).filter((file) => supportedExtensions.has(path.extname(file).toLowerCase())).sort()) {
  const contents = fs.readFileSync(filePath);
  const url = `/${path.relative(publicRoot, filePath).split(path.sep).join("/")}`;
  const revision = crypto.createHash("sha256").update(contents).digest("hex").slice(0, 20);
  const bytes = contents.byteLength;
  assets[url] = { bytes, revision };
  totalBytes += bytes;
  versionHash.update(`${url}:${bytes}:${revision}\n`);
}

const manifest = {
  schemaVersion: 1,
  version: versionHash.digest("hex").slice(0, 20),
  assetCount: Object.keys(assets).length,
  totalBytes,
  assets,
};
const output = `${JSON.stringify(manifest, null, 2)}\n`;
const current = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "";

if (checkOnly) {
  if (current !== output) {
    console.error("public/offline-assets.json is stale. Run npm run generate:offline-manifest.");
    process.exit(1);
  }
  console.log(`Offline asset manifest is current: ${manifest.assetCount} full-quality images, ${manifest.totalBytes} bytes.`);
} else {
  if (current !== output) fs.writeFileSync(manifestPath, output);
  console.log(`Generated offline asset manifest: ${manifest.assetCount} full-quality images, ${manifest.totalBytes} bytes.`);
}

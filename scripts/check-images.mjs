import fs from "node:fs";
import path from "node:path";

const dataFile = "src/lib/game-data.ts";
const source = fs.readFileSync(dataFile, "utf8");

const remoteImageReferences = [...source.matchAll(/image:\s*["']https?:\/\//g)];
const assets = [...source.matchAll(/contentImage\("([^"]+)", "([^"]+)", "([^"]+)"\)/g)].map((match) => ({
  topic: match[1],
  id: match[2],
  sourceFile: match[3],
  target: path.join("public", "burrow-assets", match[1], `${match[2]}.jpg`),
}));

const missing = assets.filter((asset) => !fs.existsSync(asset.target));
const tiny = assets.filter((asset) => fs.existsSync(asset.target) && fs.statSync(asset.target).size < 1024);
const duplicateTargets = assets
  .map((asset) => asset.target)
  .filter((target, index, targets) => targets.indexOf(target) !== index);

if (!assets.length || remoteImageReferences.length || missing.length || tiny.length || duplicateTargets.length) {
  console.error(
    JSON.stringify(
      {
        total: assets.length,
        remoteImageReferences: remoteImageReferences.length,
        missing,
        tiny,
        duplicateTargets: Array.from(new Set(duplicateTargets)),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(`All ${assets.length} Burrow content images are local and present.`);

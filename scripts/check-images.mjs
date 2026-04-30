import fs from "node:fs";
import path from "node:path";

const dataFile = "src/lib/game-data.ts";
const source = fs.readFileSync(dataFile, "utf8");

const remoteImageReferences = [...source.matchAll(/image:\s*["']https?:\/\//g)];
const externalImageReferences = [...source.matchAll(/externalImage\(/g)];
const assets = [...source.matchAll(/contentImage\("([^"]+)", "([^"]+)", "([^"]+)"\)/g)].map((match) => ({
  topic: match[1],
  id: match[2],
  sourceFile: match[3],
  target: path.join("public", "burrow-assets", match[1], `${match[2]}.jpg`),
}));

const isImageFile = (target) => {
  const buffer = fs.readFileSync(target);
  const textStart = buffer.subarray(0, 120).toString("utf8").trimStart().toLowerCase();
  return (
    (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
    (buffer[0] === 0x89 && buffer.subarray(1, 4).toString("ascii") === "PNG") ||
    buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
    buffer.subarray(0, 6).toString("ascii") === "GIF89a" ||
    (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") ||
    textStart.startsWith("<svg")
  );
};

const missing = assets.filter((asset) => !fs.existsSync(asset.target));
const tiny = assets.filter((asset) => fs.existsSync(asset.target) && fs.statSync(asset.target).size < 1024);
const invalid = assets.filter((asset) => fs.existsSync(asset.target) && fs.statSync(asset.target).size >= 1024 && !isImageFile(asset.target));
const duplicateTargets = assets
  .map((asset) => asset.target)
  .filter((target, index, targets) => targets.indexOf(target) !== index);

if (!assets.length || remoteImageReferences.length || externalImageReferences.length || missing.length || tiny.length || invalid.length || duplicateTargets.length) {
  console.error(
    JSON.stringify(
      {
        total: assets.length,
        remoteImageReferences: remoteImageReferences.length,
        externalImageReferences: externalImageReferences.length,
        missing,
        tiny,
        invalid,
        duplicateTargets: Array.from(new Set(duplicateTargets)),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(`All ${assets.length} Burrow content images are local and present.`);

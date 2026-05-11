import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const dataFile = "src/lib/game-data.ts";
const source = fs.readFileSync(dataFile, "utf8");

const remoteImageReferences = [...source.matchAll(/image:\s*["']https?:\/\//g)];
const externalImageReferences = [...source.matchAll(/externalImage\(/g)];
const coreAssets = [...source.matchAll(/contentImage\("([^"]+)", "([^"]+)", "([^"]+)"\)/g)].map((match) => ({
  topic: match[1],
  id: match[2],
  sourceFile: match[3],
  target: path.join("public", "burrow-assets", match[1], `${match[2]}.jpg`),
}));

const packAssets = () => {
  const packsRoot = "content/packs";
  if (!fs.existsSync(packsRoot)) return [];

  return fs.readdirSync(packsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("_"))
    .map((entry) => path.join(packsRoot, entry.name, "pack.json"))
    .filter((packFile) => fs.existsSync(packFile))
    .flatMap((packFile) => {
      const pack = JSON.parse(fs.readFileSync(packFile, "utf8"));
      if (pack.status !== "playable" || !Array.isArray(pack.cards)) return [];

      return pack.cards.map((card) => ({
        topic: pack.id,
        id: card.id,
        sourceFile: card.imageSourceUrl,
        target: path.join("public", card.image.replace(/^\//, "")),
      }));
    });
};

const assets = [...coreAssets, ...packAssets()];

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

const hashImage = (target) => crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
const assetsWithHashes = assets
  .filter((asset) => fs.existsSync(asset.target) && fs.statSync(asset.target).size >= 1024 && isImageFile(asset.target))
  .map((asset) => ({ ...asset, hash: hashImage(asset.target) }));
const contentGroups = new Map();
for (const asset of assetsWithHashes) {
  const group = contentGroups.get(asset.hash) ?? [];
  group.push(asset);
  contentGroups.set(asset.hash, group);
}
const duplicateContents = Array.from(contentGroups.values())
  .filter((group) => group.length > 1)
  .map((group) =>
    group.map((asset) => ({
      topic: asset.topic,
      id: asset.id,
      sourceFile: asset.sourceFile,
      target: asset.target,
    })),
  );

const fatalFailure = !assets.length || remoteImageReferences.length || missing.length || tiny.length || invalid.length || duplicateTargets.length;

if (fatalFailure) {
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
        duplicateContents,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

if (duplicateContents.length) {
  console.warn(
    JSON.stringify(
      {
        total: assets.length,
        externalImageReferences: externalImageReferences.length,
        duplicateContentsWarning: duplicateContents,
      },
      null,
      2,
    ),
  );
}

console.log(
  `All ${assets.length} local Burrow content images are present and valid. External image references: ${externalImageReferences.length}. Duplicate-content warnings: ${duplicateContents.length}.`,
);

import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const dataFile = "src/lib/game-data.ts";
const outputRoot = "public/burrow-assets";
const width = 900;
const batchSize = 25;
const force = process.argv.includes("--force");
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg?.replace("--only=", "");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const source = fs.readFileSync(dataFile, "utf8");
const assets = [...source.matchAll(/contentImage\("([^"]+)", "([^"]+)", "([^"]+)"\)/g)]
  .map((match) => ({
    topic: match[1],
    id: match[2],
    sourceFile: match[3],
    target: path.join(outputRoot, match[1], `${match[2]}.jpg`),
  }))
  .filter((asset) => !only || `${asset.topic}/${asset.id}` === only);

if (!assets.length) {
  throw new Error("No contentImage(...) assets found in game-data.ts.");
}

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "BurrowContentSync/1.0" } }, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error(`JSON request failed ${response.statusCode}: ${body.slice(0, 300)}`));
          }
        });
      })
      .on("error", reject);
  });

const resolveUrls = async () => {
  const byFile = new Map();

  for (let index = 0; index < assets.length; index += batchSize) {
    const batch = assets.slice(index, index + batchSize);
    const titles = batch.map((asset) => `File:${asset.sourceFile}`).join("|");
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=" +
      width +
      "&titles=" +
      encodeURIComponent(titles);
    const result = await fetchJson(url);
    const pages = Object.values(result.query?.pages ?? {});
    for (const page of pages) {
      const sourceFile = page.title?.replace(/^File:/, "");
      const imageInfo = page.imageinfo?.[0];
      if (sourceFile && imageInfo) {
        byFile.set(sourceFile, imageInfo.thumburl ?? imageInfo.url);
      }
    }
    await sleep(500);
  }

  return assets.map((asset) => {
    const url = byFile.get(asset.sourceFile);
    if (!url) throw new Error(`Could not resolve ${asset.sourceFile}`);
    return { ...asset, url };
  });
};

const download = (asset, attempt = 1) =>
  new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(asset.target), { recursive: true });

    const request = (url, redirectsLeft = 4) => {
      https
        .get(url, { headers: { "User-Agent": "BurrowContentSync/1.0" } }, (response) => {
          if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirectsLeft > 0) {
            response.resume();
            request(response.headers.location, redirectsLeft - 1);
            return;
          }

          if (response.statusCode !== 200) {
            response.resume();
            if ((response.statusCode === 429 || response.statusCode === 503) && attempt < 2) {
              const retryAfter = Number(response.headers["retry-after"]);
              const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 2000) : 2000;
              sleep(waitMs).then(() => download(asset, attempt + 1).then(resolve).catch(reject));
              return;
            }
            reject(new Error(`${asset.topic}/${asset.id}: ${response.statusCode} for ${asset.sourceFile}`));
            return;
          }

          const tempTarget = `${asset.target}.tmp`;
          const file = fs.createWriteStream(tempTarget);
          response.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              fs.renameSync(tempTarget, asset.target);
              resolve();
            });
          });
          file.on("error", reject);
        })
        .on("error", reject);
    };

    request(asset.url);
  });

const resolvedAssets = await resolveUrls();
const failed = [];

for (const asset of resolvedAssets) {
  if (!force && fs.existsSync(asset.target) && fs.statSync(asset.target).size > 1024) {
    continue;
  }
  try {
    await download(asset);
  } catch (error) {
    failed.push({ topic: asset.topic, id: asset.id, sourceFile: asset.sourceFile, error: error.message });
  }
  await sleep(750);
}

if (failed.length) {
  console.error(JSON.stringify({ synced: assets.length - failed.length, failed }, null, 2));
  process.exit(1);
}

console.log(`Synced ${assets.length} Burrow content images into ${outputRoot}.`);

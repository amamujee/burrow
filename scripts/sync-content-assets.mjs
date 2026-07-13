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
const topicArg = process.argv.find((arg) => arg.startsWith("--topic="));
const topic = topicArg?.replace("--topic=", "");
const idsArg = process.argv.find((arg) => arg.startsWith("--ids="));
const ids = idsArg ? new Set(idsArg.replace("--ids=", "").split(",").filter(Boolean)) : null;
const delayArg = process.argv.find((arg) => arg.startsWith("--delay="));
const downloadDelay = Number(delayArg?.replace("--delay=", "") ?? 750);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const source = fs.readFileSync(dataFile, "utf8");
const assets = [...source.matchAll(/contentImage\("([^"]+)", "([^"]+)", "([^"]+)"\)/g)]
  .map((match) => ({
    topic: match[1],
    id: match[2],
    sourceFile: match[3],
    target: path.join(outputRoot, match[1], `${match[2]}.jpg`),
  }))
  .filter((asset) => !only || `${asset.topic}/${asset.id}` === only)
  .filter((asset) => !topic || asset.topic === topic)
  .filter((asset) => !ids || ids.has(asset.id));

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
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&redirects=1&prop=imageinfo&iiprop=url&iiurlwidth=" +
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
    for (const redirect of result.query?.redirects ?? []) {
      const from = redirect.from?.replace(/^File:/, "");
      const to = redirect.to?.replace(/^File:/, "");
      if (from && to && byFile.has(to)) byFile.set(from, byFile.get(to));
    }
    await sleep(500);
  }

  const unresolved = assets.filter((asset) => !byFile.has(asset.sourceFile));
  if (unresolved.length) {
    console.warn(`Skipping unresolved Wikimedia files:\n${unresolved.map((asset) => `- ${asset.topic}/${asset.id}: ${asset.sourceFile}`).join("\n")}`);
  }

  return assets.filter((asset) => byFile.has(asset.sourceFile)).map((asset) => {
    const url = byFile.get(asset.sourceFile);
    return { ...asset, url };
  });
};

const download = (asset) =>
  new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(asset.target), { recursive: true });

    const request = (url, redirectsLeft = 4, allowProxy = true) => {
      https
        .get(url, { headers: { "User-Agent": "BurrowContentSync/1.0" } }, (response) => {
          if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirectsLeft > 0) {
            response.resume();
            request(response.headers.location, redirectsLeft - 1);
            return;
          }

          if (response.statusCode !== 200) {
            response.resume();
            if ((response.statusCode === 429 || response.statusCode === 503) && allowProxy) {
              const commonsRedirect = `commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(asset.sourceFile)}?width=${width}`;
              const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(commonsRedirect)}&w=${width}&output=jpg`;
              request(proxyUrl, 4, false);
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
  await sleep(downloadDelay);
}

if (failed.length) {
  console.error(JSON.stringify({ synced: assets.length - failed.length, failed }, null, 2));
  process.exit(1);
}

console.log(`Synced ${assets.length} Burrow content images into ${outputRoot}.`);

import fs from "node:fs";
import https from "node:https";

const dataFile = "src/lib/game-data.ts";
const batchSize = 10;

const source = fs.readFileSync(dataFile, "utf8");
const assets = [];

for (const block of source.split(/\n  \{/).slice(1)) {
  const id = block.match(/id: "([^"]+)"/)?.[1];
  const file = block.match(/image: wm\("([^"]+)"\)/)?.[1];
  if (id && file) {
    assets.push({ id, file });
  }
}

const requestBatch = (batch) =>
  new Promise((resolve, reject) => {
    const titles = batch.map((asset) => `File:${asset.file}`).join("|");
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=" +
      encodeURIComponent(titles);

    https
      .get(url, { headers: { "User-Agent": "RabbitHoleImageAudit/1.0" } }, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error(`Commons API returned ${response.statusCode}: ${body.slice(0, 300)}`));
          }
        });
      })
      .on("error", reject);
  });

const missing = [];
const noInfo = [];
const badRuntimeUrl = [];

for (let index = 0; index < assets.length; index += batchSize) {
  const batch = assets.slice(index, index + batchSize);
  const result = await requestBatch(batch);

  if (!result.query?.pages) {
    throw new Error(`Unexpected Commons API response: ${JSON.stringify(result).slice(0, 300)}`);
  }

  const pages = Object.values(result.query.pages);
  const byTitle = new Map(pages.map((page) => [page.title.replace(/^File:/, ""), page]));

  for (const asset of batch) {
    const page = byTitle.get(asset.file);
    if (page?.missing !== undefined) {
      missing.push(asset);
    } else if (!page?.imageinfo?.[0]?.url) {
      noInfo.push(asset);
    }
  }
}

const checkRuntimeUrl = (asset) =>
  new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(asset.file)}?width=1200`;
    https
      .request(url, { method: "HEAD", headers: { "User-Agent": "RabbitHoleImageAudit/1.0" } }, (response) => {
        const location = response.headers.location;
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && location) {
          https
            .request(location, { method: "HEAD", headers: { "User-Agent": "RabbitHoleImageAudit/1.0" } }, (redirectResponse) => {
              resolve({
                ok: redirectResponse.statusCode === 200 || (redirectResponse.statusCode && redirectResponse.statusCode >= 300 && redirectResponse.statusCode < 400),
                status: redirectResponse.statusCode,
              });
            })
            .on("error", () => resolve({ ok: false, status: "redirect-error" }))
            .end();
          return;
        }

        resolve({ ok: response.statusCode === 200, status: response.statusCode });
      })
      .on("error", () => resolve({ ok: false, status: "request-error" }))
      .end();
  });

for (const asset of assets) {
  const result = await checkRuntimeUrl(asset);
  if (!result.ok) {
    badRuntimeUrl.push({ ...asset, status: result.status });
  }
}

if (missing.length || noInfo.length || badRuntimeUrl.length) {
  console.error(JSON.stringify({ total: assets.length, missing, noInfo, badRuntimeUrl }, null, 2));
  process.exit(1);
}

console.log(`All ${assets.length} Rabbit Hole image files exist and resolve through Special:FilePath.`);
process.exit(0);

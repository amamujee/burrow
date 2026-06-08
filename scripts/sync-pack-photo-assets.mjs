import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const userAgent = "BurrowPackPhotoSync/1.0 (https://github.com/amamujee/burrow)";
const width = 900;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const packIds = process.argv.slice(2);
const manualPhotoFiles = new Map(
  Object.entries({
    "bridges-and-tunnels/loetschberg-base-tunnel": "Lötschberg Basistunnel Nordportal.jpg",
    "bridges-and-tunnels/tokyo-bay-aqua-line": "Tokyo Wan Aqua-Line.jpg",
    "tallest-mountains/gasherbrum-ii": "Gasherbrum2.jpg",
    "tallest-mountains/distaghil-sar": "Distaghil ISS.JPG",
    "tallest-mountains/khunyang-chhish": "Khunyang Chhish and Pumari Chhish.jpg",
    "tallest-mountains/dhaulagiri-ii": "Dhaulagiri II (3to4-1).jpg",
  }),
);

if (!packIds.length) {
  console.error("Usage: node scripts/sync-pack-photo-assets.mjs <pack-id> [pack-id...]");
  process.exit(1);
}

const requestBuffer = (url, redirectsLeft = 4) =>
  new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": userAgent } }, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirectsLeft > 0) {
          response.resume();
          requestBuffer(new URL(response.headers.location, url).toString(), redirectsLeft - 1).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`${response.statusCode} for ${url}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: response.headers["content-type"] ?? "" }));
      })
      .on("error", reject);
  });

const requestJson = async (url) => {
  const { buffer } = await requestBuffer(url);
  return JSON.parse(buffer.toString("utf8"));
};

const pageTitleFromUrl = (url) => {
  const parsed = new URL(url);
  return decodeURIComponent(parsed.pathname.replace(/^\/wiki\//, ""));
};

const imageExtension = (contentType, url) => {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const cleanPath = new URL(url).pathname.toLowerCase();
  if (cleanPath.endsWith(".png")) return "png";
  if (cleanPath.endsWith(".webp")) return "webp";
  if (cleanPath.endsWith(".gif")) return "gif";
  if (cleanPath.endsWith(".svg")) return "svg";
  return "jpg";
};

const commonsFilePageFromImageUrl = (thumbUrl) => {
  const match = thumbUrl.match(/\/commons\/(?:thumb\/)?[a-z0-9]\/[a-z0-9]{2}\/([^/]+)(?:\/|$)/i);
  if (!match) return undefined;
  return `https://commons.wikimedia.org/wiki/File:${decodeURIComponent(match[1])}`;
};

const resolvePageImage = async (sourceUrl) => {
  const title = pageTitleFromUrl(sourceUrl);
  const apiUrl =
    "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageprops&piprop=thumbnail%7Coriginal&pithumbsize=" +
    width +
    "&redirects=1&titles=" +
    encodeURIComponent(title);
  const data = await requestJson(apiUrl);
  const page = Object.values(data.query?.pages ?? {})[0];
  const imageUrl = page?.thumbnail?.source ?? page?.original?.source;
  if (!imageUrl) throw new Error(`No page image found for ${sourceUrl}`);
  return {
    imageUrl,
    sourcePage: commonsFilePageFromImageUrl(imageUrl) ?? sourceUrl,
  };
};

const resolveCommonsFile = async (fileName) => {
  const fileTitle = `File:${fileName}`;
  const apiUrl =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=" +
    width +
    "&titles=" +
    encodeURIComponent(fileTitle);
  const data = await requestJson(apiUrl);
  const page = Object.values(data.query?.pages ?? {})[0];
  const imageUrl = page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url;
  if (!imageUrl) throw new Error(`No Commons image URL found for ${fileTitle}`);
  return {
    imageUrl,
    sourcePage: `https://commons.wikimedia.org/wiki/${fileTitle.replaceAll(" ", "_")}`,
  };
};

for (const packId of packIds) {
  const packPath = path.join("content", "packs", packId, "pack.json");
  const assetDir = path.join("public", "burrow-assets", packId);
  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  const failures = [];

  fs.mkdirSync(assetDir, { recursive: true });

  for (const card of pack.cards) {
    try {
      const manualPhotoFile = manualPhotoFiles.get(`${packId}/${card.id}`);
      const { imageUrl, sourcePage } = manualPhotoFile ? await resolveCommonsFile(manualPhotoFile) : await resolvePageImage(card.imageSourceUrl);
      await sleep(350);

      const { buffer, contentType } = await requestBuffer(imageUrl);
      const ext = imageExtension(contentType, imageUrl);
      const target = path.join(assetDir, `${card.id}.${ext}`);
      fs.writeFileSync(target, buffer);

      card.image = `/burrow-assets/${packId}/${card.id}.${ext}`;
      card.imageAlt = `${card.name} photo`;
      card.imageCredit = "Wikimedia Commons";
      card.imageSourceUrl = sourcePage;
      await sleep(350);
    } catch (error) {
      failures.push({ id: card.id, name: card.name, error: error.message });
    }
  }

  fs.writeFileSync(packPath, `${JSON.stringify(pack, null, 2)}\n`);

  if (failures.length) {
    console.error(JSON.stringify({ packId, failures }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Synced photo assets for ${pack.cards.length} ${packId} cards.`);
  }
}

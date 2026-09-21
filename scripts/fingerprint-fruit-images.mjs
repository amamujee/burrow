import fs from "node:fs";
import crypto from "node:crypto";

const sourcePath = "scripts/data/fruits.json";
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

// Both the image optimizer and installed app cache by URL. Changing the filename
// ensures a refreshed photograph cannot reuse an older cached response.
for (const card of source.cards) {
  if (!/^[a-z0-9-]+$/.test(card.id) || !/^\/burrow-assets\/fruits\/[^/]+\.jpg$/.test(card.image)) {
    throw new Error(`Unexpected fruit image path: ${card.id}`);
  }
  const currentPath = `public${card.image}`;
  const data = fs.readFileSync(currentPath);
  const revision = crypto.createHash("sha256").update(data).digest("hex").slice(0, 12);
  const nextImage = `/burrow-assets/fruits/${card.id}-${revision}.jpg`;
  if (card.image !== nextImage) {
    const nextPath = `public${nextImage}`;
    if (fs.existsSync(nextPath) && !fs.readFileSync(nextPath).equals(data)) {
      throw new Error(`Conflicting fruit image: ${nextImage}`);
    }
    fs.renameSync(currentPath, nextPath);
    card.image = nextImage;
  }
}

fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
console.log(`Versioned ${source.cards.length} fruit photograph paths.`);

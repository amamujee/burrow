import fs from "node:fs";
import path from "node:path";

const packsRoot = "content/packs";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const worldContinents = new Set(["Africa", "Antarctica", "Asia", "Europe", "North America", "South America", "Oceania"]);
const gameModes = new Set(["quiz", "versus", "trumps", "sort", "fact", "peek", "number", "odd", "geo"]);
const args = process.argv.slice(2);
const packArg = args.includes("--pack") ? args[args.indexOf("--pack") + 1] : undefined;
const includeTemplate = args.includes("--include-template");

const errors = [];
const warnings = [];

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const hasText = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const isUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

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
const isSvgFile = (target) => fs.readFileSync(target).subarray(0, 120).toString("utf8").trimStart().toLowerCase().startsWith("<svg");

const addError = (packId, message) => errors.push(`${packId}: ${message}`);
const addWarning = (packId, message) => warnings.push(`${packId}: ${message}`);

const readPack = (packFile) => {
  try {
    return JSON.parse(fs.readFileSync(packFile, "utf8"));
  } catch (error) {
    addError(path.dirname(packFile), `invalid JSON (${error.message})`);
    return null;
  }
};

const uniqueCheck = (packId, values, label) => {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) addError(packId, `duplicate ${label} "${value}"`);
    seen.add(value);
  }
};

const validateStats = (packId, card, cardLabel) => {
  if (!Array.isArray(card.stats) || card.stats.length < 2) {
    addError(packId, `${cardLabel} needs at least 2 numeric stats`);
    return [];
  }

  uniqueCheck(packId, card.stats.map((stat) => stat?.id).filter(Boolean), `${cardLabel} stat id`);

  return card.stats.filter((stat, index) => {
    const label = `${cardLabel} stats[${index}]`;
    if (!isObject(stat)) {
      addError(packId, `${label} must be an object`);
      return false;
    }
    if (!hasText(stat.id) || !slugPattern.test(stat.id)) addError(packId, `${label} needs a slug id`);
    if (!hasText(stat.label, 2)) addError(packId, `${label} needs a label`);
    if (typeof stat.value !== "number" || !Number.isFinite(stat.value) || stat.value < 0) addError(packId, `${label} needs a finite numeric value >= 0`);
    if (stat.display !== undefined && !hasText(stat.display)) addError(packId, `${label} display needs text`);
    if (typeof stat.value === "number" && stat.value > 0 && !hasText(stat.unit) && !hasText(stat.display)) addWarning(packId, `${label} has a value but no unit or display`);
    if (stat.direction && !["higher", "lower"].includes(stat.direction)) addError(packId, `${label} direction must be higher or lower`);
    return isObject(stat) && hasText(stat.id) && typeof stat.value === "number" && Number.isFinite(stat.value);
  });
};

const validateCardMetadata = (packId, card, cardLabel) => {
  if (card.tags !== undefined) {
    if (!Array.isArray(card.tags)) {
      addError(packId, `${cardLabel}: tags must be an array`);
    } else {
      uniqueCheck(packId, card.tags.filter(Boolean), `${cardLabel} tag`);
      for (const tag of card.tags) {
        if (!hasText(tag) || !slugPattern.test(tag)) addError(packId, `${cardLabel}: tag "${tag}" must be a lowercase slug`);
      }
    }
  }

  if (card.metadata !== undefined) {
    if (!isObject(card.metadata)) {
      addError(packId, `${cardLabel}: metadata must be an object`);
      return;
    }
    const allowedKeys = new Set(["difficultyBand", "recognition", "rarity", "flavorGrade", "pepperTypes", "taxonomyGroup", "accuracyNote", "sources", "imageDistinctGroup", "location"]);
    for (const key of Object.keys(card.metadata)) {
      if (!allowedKeys.has(key)) addError(packId, `${cardLabel}: metadata.${key} is not supported`);
    }
    if (card.metadata.difficultyBand !== undefined && !["easy", "medium", "hard"].includes(card.metadata.difficultyBand)) addError(packId, `${cardLabel}: metadata.difficultyBand must be easy, medium, or hard`);
    if (card.metadata.recognition !== undefined && (!Number.isInteger(card.metadata.recognition) || card.metadata.recognition < 1 || card.metadata.recognition > 5)) addError(packId, `${cardLabel}: metadata.recognition must be an integer from 1 to 5`);
    if (card.metadata.rarity !== undefined && !["common", "uncommon", "rare", "epic"].includes(card.metadata.rarity)) addError(packId, `${cardLabel}: metadata.rarity must be common, uncommon, rare, or epic`);
    if (card.metadata.flavorGrade !== undefined && !["A", "B", "C", "D"].includes(card.metadata.flavorGrade)) addError(packId, `${cardLabel}: metadata.flavorGrade must be A, B, C, or D`);
    if (card.metadata.pepperTypes !== undefined && (!Array.isArray(card.metadata.pepperTypes) || card.metadata.pepperTypes.length < 1 || card.metadata.pepperTypes.some((pepper) => !hasText(pepper, 2)))) addError(packId, `${cardLabel}: metadata.pepperTypes needs at least one named pepper`);
    if (card.metadata.taxonomyGroup !== undefined && !hasText(card.metadata.taxonomyGroup, 2)) addError(packId, `${cardLabel}: metadata.taxonomyGroup needs text`);
    if (card.metadata.accuracyNote !== undefined && !hasText(card.metadata.accuracyNote, 8)) addError(packId, `${cardLabel}: metadata.accuracyNote needs text`);
    if (card.metadata.sources !== undefined) {
      if (!Array.isArray(card.metadata.sources) || !card.metadata.sources.length) {
        addError(packId, `${cardLabel}: metadata.sources needs factual references`);
      } else {
        for (const source of card.metadata.sources) {
          if (!isObject(source) || !hasText(source.label, 2) || !isUrl(source.url) || (source.note !== undefined && !hasText(source.note))) {
            addError(packId, `${cardLabel}: metadata.sources needs a label, HTTP(S) URL, and nonempty optional note`);
          }
        }
        uniqueCheck(packId, card.metadata.sources.map((source) => source?.url), `${cardLabel} factual source URL`);
      }
    }
    if (card.metadata.imageDistinctGroup !== undefined && (!hasText(card.metadata.imageDistinctGroup) || !slugPattern.test(card.metadata.imageDistinctGroup))) addError(packId, `${cardLabel}: metadata.imageDistinctGroup must be a lowercase slug`);
    if (card.metadata.location !== undefined) {
      const location = card.metadata.location;
      if (!isObject(location)) {
        addError(packId, `${cardLabel}: metadata.location must be an object`);
      } else {
        if (!hasText(location.label, 2)) addError(packId, `${cardLabel}: metadata.location.label needs text`);
        if (!Array.isArray(location.countries) || location.countries.length < 1 || location.countries.some((country) => !hasText(country, 2))) {
          addError(packId, `${cardLabel}: metadata.location.countries needs at least one country`);
        } else {
          uniqueCheck(packId, location.countries, `${cardLabel} metadata.location country`);
        }
        if (!Array.isArray(location.continents) || location.continents.length < 1 || location.continents.some((continent) => !worldContinents.has(continent))) {
          addError(packId, `${cardLabel}: metadata.location.continents contains an invalid continent`);
        } else {
          uniqueCheck(packId, location.continents, `${cardLabel} metadata.location continent`);
        }
        if (location.coordinates !== undefined && (!Array.isArray(location.coordinates) || location.coordinates.length !== 2
          || !Number.isFinite(location.coordinates[0]) || Math.abs(location.coordinates[0]) > 90
          || !Number.isFinite(location.coordinates[1]) || Math.abs(location.coordinates[1]) > 180)) {
          addError(packId, `${cardLabel}: metadata.location.coordinates must be [latitude, longitude] in range`);
        }
        if (location.states !== undefined) {
          if (!Array.isArray(location.states) || !location.states.length || location.states.some((state) => !hasText(state, 2))) {
            addError(packId, `${cardLabel}: metadata.location.states needs named states`);
          } else uniqueCheck(packId, location.states, `${cardLabel} metadata.location state`);
        }
      }
    }
  }
};

const validateLanding = (packId, pack) => {
  if (pack.landing === undefined) {
    if (pack.status === "playable") addError(packId, "playable packs need landing metadata so the category appears on the homepage");
    return;
  }
  if (!isObject(pack.landing)) {
    addError(packId, "landing must be an object");
    return;
  }

  if (pack.landing.title !== undefined && (!hasText(pack.landing.title, 2) || pack.landing.title.trim().length > 32)) {
    addError(packId, "landing.title must be 2-32 characters");
  }
  if (!hasText(pack.landing.detail, 2) || pack.landing.detail.trim().length > 48) {
    addError(packId, "landing.detail must be 2-48 characters so it fits the responsive category card");
  }
  if (!hasText(pack.landing.image) || !pack.landing.image.startsWith(`/burrow-assets/${packId}/`)) {
    addError(packId, `landing.image must be a local image under /burrow-assets/${packId}/`);
  }
  if (pack.landing.imageFit !== undefined && !["cover", "contain"].includes(pack.landing.imageFit)) {
    addError(packId, "landing.imageFit must be cover or contain");
  }
  if (!Number.isInteger(pack.landing.order) || pack.landing.order < 1 || pack.landing.order > 999) {
    addError(packId, "landing.order must be an integer from 1 to 999");
  }
};

const validateImage = (packId, card, allowMissing = false) => {
  if (!hasText(card.image)) {
    addError(packId, `${card.id}: missing image`);
    return;
  }
  if (!card.image.startsWith(`/burrow-assets/${packId}/`)) {
    addWarning(packId, `${card.id}: image should live under /burrow-assets/${packId}/`);
  }
  if (card.image.startsWith("http")) {
    addError(packId, `${card.id}: runtime images must be local, not remote URLs`);
    return;
  }
  if (!card.image.startsWith("/")) {
    addError(packId, `${card.id}: image path should start with /`);
    return;
  }

  const target = path.join("public", card.image.replace(/^\//, ""));
  if (!fs.existsSync(target)) {
    if (allowMissing) return;
    addError(packId, `${card.id}: missing local image ${target}`);
    return;
  }
  if (fs.statSync(target).size < 1024 && !isSvgFile(target)) {
    addError(packId, `${card.id}: image is too small`);
    return;
  }
  if (!isImageFile(target)) addError(packId, `${card.id}: image file does not look like an image`);
};

const validatePack = (packFile) => {
  const pack = readPack(packFile);
  if (!pack) return;

  const dirId = path.basename(path.dirname(packFile));
  const packId = hasText(pack.id) ? pack.id : dirId;
  const isTemplate = dirId.startsWith("_");

  if (!isObject(pack)) addError(packId, "pack must be an object");
  if (!hasText(pack.id) || !slugPattern.test(pack.id)) addError(packId, "id must be a lowercase slug");
  if (pack.id !== dirId && !dirId.startsWith("_")) addError(packId, `id must match folder name "${dirId}"`);
  if (!hasText(pack.title, 2)) addError(packId, "title is required");
  if (!hasText(pack.summary, 20)) addError(packId, "summary should explain the pack in at least 20 characters");
  if (pack.status !== undefined && !["draft", "needs-review", "playable"].includes(pack.status)) addError(packId, "status must be draft, needs-review, or playable");

  if (!isObject(pack.audience)) {
    addError(packId, "audience is required");
  } else {
    if (!Number.isInteger(pack.audience.minAge) || pack.audience.minAge < 2) addError(packId, "audience.minAge must be an integer >= 2");
    if (!Number.isInteger(pack.audience.maxAge) || pack.audience.maxAge < pack.audience.minAge) addError(packId, "audience.maxAge must be >= minAge");
  }

  if (pack.recommendedModes === undefined) {
    if (pack.status === "playable") addError(packId, "playable packs need recommendedModes");
  } else if (!Array.isArray(pack.recommendedModes) || pack.recommendedModes.length < 1) {
    addError(packId, "recommendedModes must contain at least one game mode");
  } else {
    uniqueCheck(packId, pack.recommendedModes, "recommended mode");
    for (const mode of pack.recommendedModes) {
      if (!gameModes.has(mode)) addError(packId, `recommendedModes contains unsupported mode "${mode}"`);
    }
  }

  validateLanding(packId, pack);

  if (!Array.isArray(pack.sources) || pack.sources.length < 1) {
    addError(packId, "at least one source is required");
  } else {
    pack.sources.forEach((source, index) => {
      if (!isObject(source)) addError(packId, `sources[${index}] must be an object`);
      if (!hasText(source?.label, 2)) addError(packId, `sources[${index}] needs a label`);
      if (!isUrl(source?.url)) addError(packId, `sources[${index}] needs an http(s) URL`);
    });
  }

  const minimumCards = isTemplate ? 1 : 8;
  if (!Array.isArray(pack.cards) || pack.cards.length < minimumCards) {
    addError(packId, "at least 8 cards are required; 16+ is better for repeated play");
    return;
  }
  if (!isTemplate && pack.cards.length < 16) addWarning(packId, "16+ cards is recommended so sessions do not feel repetitive");

  uniqueCheck(packId, pack.cards.map((card) => card?.id).filter(Boolean), "card id");

  const commonStatIds = new Map();
  const categoryCounts = new Map();

  pack.cards.forEach((card, index) => {
    const cardLabel = card?.id ?? `cards[${index}]`;
    if (!isObject(card)) {
      addError(packId, `cards[${index}] must be an object`);
      return;
    }
    if (!hasText(card.id) || !slugPattern.test(card.id)) addError(packId, `${cardLabel}: id must be a lowercase slug`);
    if (!hasText(card.name, 2)) addError(packId, `${cardLabel}: name is required`);
    if (!hasText(card.imageAlt, 2)) addError(packId, `${cardLabel}: imageAlt is required`);
    if (!hasText(card.imageCredit, 2)) addError(packId, `${cardLabel}: imageCredit is required`);
    if (!isUrl(card.imageSourceUrl)) addError(packId, `${cardLabel}: imageSourceUrl needs an http(s) URL`);
    if (!hasText(card.fact, 32)) addError(packId, `${cardLabel}: fact should be at least 32 characters`);
    validateImage(packId, card, isTemplate);

    const stats = validateStats(packId, card, cardLabel);
    validateCardMetadata(packId, card, cardLabel);
    for (const stat of stats) {
      if (stat.value > 0) commonStatIds.set(stat.id, (commonStatIds.get(stat.id) ?? 0) + 1);
    }

    if (!Array.isArray(card.categories) || card.categories.length < 1) {
      addError(packId, `${cardLabel}: categories are required`);
    } else {
      for (const category of card.categories) {
        if (!hasText(category, 2)) addError(packId, `${cardLabel}: category names need text`);
        categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
      }
    }
  });

  if (hasText(pack.landing?.image) && !pack.cards.some((card) => card?.image === pack.landing.image)) {
    addError(packId, "landing.image must reuse a credited card image from this pack");
  }
  const landingCount = hasText(pack.landing?.detail) ? pack.landing.detail.trim().match(/^(\d+)\b/) : null;
  if (landingCount && Number(landingCount[1]) !== pack.cards.length) {
    addError(packId, `landing.detail says ${landingCount[1]} cards but the pack contains ${pack.cards.length}`);
  }

  const reusableStats = [...commonStatIds.entries()].filter(([, count]) => count >= Math.min(pack.cards.length, 8));
  if (!isTemplate && reusableStats.length < 2) addWarning(packId, "add at least 2 stat ids reused across most cards for number, sort, and Top Trumps modes");
  if (!isTemplate && categoryCounts.size < 3) addWarning(packId, "3+ categories helps Odd One questions work well");
};

const packFiles = () => {
  if (!fs.existsSync(packsRoot)) return [];
  const dirs = fs.readdirSync(packsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => includeTemplate || !entry.name.startsWith("_"))
    .filter((entry) => !packArg || entry.name === packArg)
    .map((entry) => path.join(packsRoot, entry.name, "pack.json"))
    .filter((packFile) => fs.existsSync(packFile));
  return dirs;
};

const files = packFiles();

if (!files.length) {
  const scope = packArg ? ` for "${packArg}"` : "";
  console.log(`No active Burrow pack files found${scope}. Copy content/packs/_template to start one.`);
  process.exit(packArg ? 1 : 0);
}

for (const file of files) validatePack(file);

if (warnings.length) {
  console.warn("Pack warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error("Pack validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${files.length} Burrow pack${files.length === 1 ? "" : "s"}.`);

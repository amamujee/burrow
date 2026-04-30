import fs from "node:fs";

const outputFile = "src/lib/content-library.ts";
const userAgent = "BurrowContentResearch/1.0 (educational app; contact: local)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchText = async (url) => {
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json, application/json",
      "User-Agent": userAgent,
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};

const sparql = async (query) =>
  fetchJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`);

const decodeHtml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

const toId = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const uniqueBy = (items, keyFor) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFor(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const extractPepperLinks = (html) =>
  [...html.matchAll(/href="\/pepper\/([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((match) => ({
    slug: match[1],
    name: decodeHtml(match[2]).trim(),
  }));

const pepperDetail = async ({ slug, name }) => {
  const sourceUrl = `https://wikipepper.org/pepper/${slug}`;
  try {
    const html = await fetchText(sourceUrl);
    const descriptions = [...html.matchAll(/"description":"([^"]+)"/g)].map((match) => decodeHtml(match[1]));
    const description = descriptions.find((item) => item.startsWith("Species:")) ?? descriptions[0] ?? "";
    const species = description.match(/Species:\s*(.*?)\.\s*Heat:/)?.[1]?.trim() ?? "Capsicum";
    const heatRange = description.match(/Heat:\s*([^.]+?SHU)/)?.[1]?.replaceAll("–", "-").trim() ?? "varies";
    const heatLevel = description.match(/Heat level:\s*([^.]+)/)?.[1]?.trim() ?? "varied heat";

    return { id: toId(name), name, species, heatRange, heatLevel, sourceUrl };
  } catch {
    return { id: toId(name), name, species: "Capsicum", heatRange: "varies", heatLevel: "varied heat", sourceUrl };
  }
};

const buildPeppers = async () => {
  const pageUrls = ["https://wikipepper.org/peppers", ...Array.from({ length: 5 }, (_, index) => `https://wikipepper.org/peppers?page=${index + 2}`)];
  const pages = [];
  for (const url of pageUrls) {
    pages.push(await fetchText(url));
    await sleep(120);
  }

  const links = uniqueBy(pages.flatMap(extractPepperLinks), (item) => item.slug).slice(0, 520);
  const peppers = [];
  for (let index = 0; index < links.length; index += 20) {
    peppers.push(...(await Promise.all(links.slice(index, index + 20).map(pepperDetail))));
    await sleep(200);
  }
  return uniqueBy(peppers, (item) => item.id).slice(0, 500);
};

const buildSharks = async () => {
  const query = `
SELECT ?item ?itemLabel ?taxonName ?parentLabel ?conservationLabel WHERE {
  ?item wdt:P171* wd:Q7372;
        wdt:P105 wd:Q7432.
  OPTIONAL { ?item wdt:P225 ?taxonName. }
  OPTIONAL { ?item wdt:P171 ?parent. }
  OPTIONAL { ?item wdt:P141 ?conservation. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY LCASE(STR(?itemLabel))
LIMIT 650`;
  const result = await sparql(query);
  return uniqueBy(
    result.results.bindings.map((item) => {
      const entityId = item.item.value.split("/").pop();
      const name = item.itemLabel.value;
      return {
        id: toId(name || item.taxonName?.value || entityId),
        name,
        scientificName: item.taxonName?.value ?? name,
        genus: item.parentLabel?.value ?? "unlisted genus",
        conservationStatus: item.conservationLabel?.value ?? "not listed",
        sourceUrl: `https://www.wikidata.org/wiki/${entityId}`,
      };
    }),
    (item) => item.id,
  ).slice(0, 600);
};

const normalizeHeightMeters = (height, unit) => {
  const value = Number(height);
  if (!Number.isFinite(value)) return 0;
  if (unit === "foot") return Math.round(value * 0.3048 * 10) / 10;
  return Math.round(value * 10) / 10;
};

const buildBuildings = async () => {
  const query = `
SELECT ?item ?itemLabel ?height ?unitLabel ?cityLabel ?countryLabel WHERE {
  ?item wdt:P31/wdt:P279* wd:Q11303;
        p:P2048 ?heightStatement.
  ?heightStatement ps:P2048 ?height;
                   psv:P2048/wikibase:quantityUnit ?unit.
  OPTIONAL { ?item wdt:P131 ?city. }
  OPTIONAL { ?item wdt:P17 ?country. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 1200`;
  const result = await sparql(query);
  const byEntity = new Map();

  for (const binding of result.results.bindings) {
    const entityId = binding.item.value.split("/").pop();
    const name = binding.itemLabel.value;
    if (!name || /^Q\d+$/.test(name)) continue;
    const heightMeters = normalizeHeightMeters(binding.height.value, binding.unitLabel?.value);
    if (heightMeters < 150 || heightMeters > 900) continue;
    const existing = byEntity.get(entityId);
    if (existing && existing.heightMeters >= heightMeters) continue;
    byEntity.set(entityId, {
      id: toId(name),
      name,
      city: binding.cityLabel?.value ?? "unknown city",
      country: binding.countryLabel?.value ?? "unknown country",
      heightMeters,
      heightFeet: Math.round(heightMeters * 3.28084),
      sourceUrl: `https://www.wikidata.org/wiki/${entityId}`,
    });
  }

  return uniqueBy(
    [...byEntity.values()].sort((a, b) => b.heightMeters - a.heightMeters),
    (item) => item.id,
  ).slice(0, 350);
};

const toTs = (name, value) => `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;

const peppers = await buildPeppers();
const sharks = await buildSharks();
const buildings = await buildBuildings();

const source = `export type LibrarySource = {
  id: string;
  label: string;
  url: string;
  note: string;
};

export type PepperLibraryEntry = {
  id: string;
  name: string;
  species: string;
  heatRange: string;
  heatLevel: string;
  sourceUrl: string;
};

export type SharkLibraryEntry = {
  id: string;
  name: string;
  scientificName: string;
  genus: string;
  conservationStatus: string;
  sourceUrl: string;
};

export type BuildingLibraryEntry = {
  id: string;
  name: string;
  city: string;
  country: string;
  heightMeters: number;
  heightFeet: number;
  sourceUrl: string;
};

export const contentLibrarySources: LibrarySource[] = [
  {
    id: "wikipepper",
    label: "WikiPepper pepper database",
    url: "https://wikipepper.org/peppers",
    note: "Community pepper encyclopedia listing 5,500+ named Capsicum varieties with species and heat metadata.",
  },
  {
    id: "wikidata-sharks",
    label: "Wikidata shark taxonomy",
    url: "https://query.wikidata.org/",
    note: "Structured taxon records under the shark clade, including species labels, taxon names, parent genera, and conservation links when present.",
  },
  {
    id: "wikidata-buildings",
    label: "Wikidata skyscraper records",
    url: "https://query.wikidata.org/",
    note: "Structured skyscraper records with normalized height statements, city, country, and entity source pages.",
  },
  {
    id: "ctbuh",
    label: "CTBUH tall-building criteria",
    url: "https://www.ctbuh.org/HighRiseInfo/TallestDatabase/Criteria/tabid/446/language/en-US/Default.aspx",
    note: "The Council on Tall Buildings and Urban Habitat defines tall, supertall, and megatall building measurement standards.",
  },
];

${toTs("pepperLibrary", peppers)}
${toTs("sharkLibrary", sharks)}
${toTs("buildingLibrary", buildings)}
export const contentLibraryStats = {
  peppers: pepperLibrary.length,
  sharks: sharkLibrary.length,
  buildings: buildingLibrary.length,
  total: pepperLibrary.length + sharkLibrary.length + buildingLibrary.length,
} as const;
`;

fs.writeFileSync(outputFile, source);
console.log(`Wrote ${outputFile}: ${peppers.length} peppers, ${sharks.length} sharks, ${buildings.length} buildings.`);

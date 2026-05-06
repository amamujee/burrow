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
  const pageUrls = ["https://wikipepper.org/peppers", ...Array.from({ length: 8 }, (_, index) => `https://wikipepper.org/peppers?page=${index + 2}`)];
  const pages = [];
  for (const url of pageUrls) {
    pages.push(await fetchText(url));
    await sleep(120);
  }

  const links = uniqueBy(pages.flatMap(extractPepperLinks), (item) => item.slug).slice(0, 760);
  const peppers = [];
  for (let index = 0; index < links.length; index += 20) {
    peppers.push(...(await Promise.all(links.slice(index, index + 20).map(pepperDetail))));
    await sleep(200);
  }
  return uniqueBy(peppers, (item) => item.id)
    .filter((item) => item.heatRange !== "varies" && item.species !== "Capsicum")
    .slice(0, 500);
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

const jets = [
  { id: "f-35-lightning-ii", name: "F-35 Lightning II", country: "United States", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q167811" },
  { id: "f-22-raptor", name: "F-22 Raptor", country: "United States", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q182048" },
  { id: "su-57", name: "Sukhoi Su-57", country: "Russia", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q753410" },
  { id: "j-20", name: "Chengdu J-20", country: "China", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q1072516" },
  { id: "b-2-spirit", name: "B-2 Spirit", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q179388" },
  { id: "b-21-raider", name: "B-21 Raider", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q1649200" },
  { id: "f-117-nighthawk", name: "F-117 Nighthawk", country: "United States", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q216713" },
  { id: "sr-71-blackbird", name: "SR-71 Blackbird", country: "United States", category: "recon", sourceUrl: "https://www.wikidata.org/wiki/Q214581" },
  { id: "u-2", name: "Lockheed U-2", country: "United States", category: "recon", sourceUrl: "https://www.wikidata.org/wiki/Q218416" },
  { id: "f-15-eagle", name: "F-15 Eagle", country: "United States", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q207556" },
  { id: "f-a-18-hornet", name: "F/A-18 Hornet", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188155" },
  { id: "f-a-18-super-hornet", name: "F/A-18E/F Super Hornet", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q182878" },
  { id: "f-16-fighting-falcon", name: "F-16 Fighting Falcon", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188153" },
  { id: "f-14-tomcat", name: "F-14 Tomcat", country: "United States", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q182979" },
  { id: "a-10-thunderbolt-ii", name: "A-10 Thunderbolt II", country: "United States", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q183550" },
  { id: "rafale", name: "Dassault Rafale", country: "France", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188163" },
  { id: "eurofighter-typhoon", name: "Eurofighter Typhoon", country: "United Kingdom/Germany/Italy/Spain", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q187961" },
  { id: "jas-39-gripen", name: "Saab JAS 39 Gripen", country: "Sweden", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188158" },
  { id: "mig-29", name: "Mikoyan MiG-29", country: "Russia", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q184905" },
  { id: "su-27", name: "Sukhoi Su-27", country: "Russia", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q184907" },
  { id: "su-35", name: "Sukhoi Su-35", country: "Russia", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q752099" },
  { id: "su-34", name: "Sukhoi Su-34", country: "Russia", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q753392" },
  { id: "mig-31", name: "Mikoyan MiG-31", country: "Russia", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q184910" },
  { id: "tu-160", name: "Tupolev Tu-160", country: "Russia", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q183754" },
  { id: "tu-22m", name: "Tupolev Tu-22M", country: "Russia", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q218247" },
  { id: "b-1-lancer", name: "B-1 Lancer", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q193598" },
  { id: "b-52-stratofortress", name: "B-52 Stratofortress", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q179391" },
  { id: "mirage-2000", name: "Dassault Mirage 2000", country: "France", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188167" },
  { id: "mirage-f1", name: "Dassault Mirage F1", country: "France", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q465786" },
  { id: "sepecat-jaguar", name: "SEPECAT Jaguar", country: "United Kingdom/France", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q213778" },
  { id: "panavia-tornado", name: "Panavia Tornado", country: "United Kingdom/Germany/Italy", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q161062" },
  { id: "av-8b-harrier-ii", name: "AV-8B Harrier II", country: "United States/United Kingdom", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q747709" },
  { id: "hawker-harrier", name: "Hawker Siddeley Harrier", country: "United Kingdom", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q383342" },
  { id: "l-39-albatros", name: "Aero L-39 Albatros", country: "Czechoslovakia", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q217457" },
  { id: "t-50-golden-eagle", name: "T-50 Golden Eagle", country: "South Korea", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q489410" },
  { id: "yak-130", name: "Yakovlev Yak-130", country: "Russia", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q4514" },
  { id: "hongdu-l-15", name: "Hongdu L-15", country: "China", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q740536" },
  { id: "j-10", name: "Chengdu J-10", country: "China", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q620300" },
  { id: "j-11", name: "Shenyang J-11", country: "China", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q625850" },
  { id: "j-16", name: "Shenyang J-16", country: "China", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q3897132" },
  { id: "fc-31", name: "Shenyang FC-31", country: "China", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q131176348" },
  { id: "hal-tejas", name: "HAL Tejas", country: "India", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q319131" },
  { id: "mitsubishi-f-2", name: "Mitsubishi F-2", country: "Japan", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q592814" },
  { id: "f-15j", name: "Mitsubishi F-15J", country: "Japan", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q1140645" },
  { id: "f-ck-1", name: "AIDC F-CK-1 Ching-kuo", country: "Taiwan", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q465819" },
  { id: "iai-kfir", name: "IAI Kfir", country: "Israel", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q610877" },
  { id: "f-5", name: "Northrop F-5", country: "United States", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q192440" },
  { id: "f-4-phantom-ii", name: "F-4 Phantom II", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q206734" },
  { id: "english-electric-lightning", name: "English Electric Lightning", country: "United Kingdom", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q844935" },
  { id: "mig-21", name: "MiG-21", country: "Soviet Union", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q182478" },
];

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

export type JetLibraryEntry = {
  id: string;
  name: string;
  country: string;
  category: string;
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
  {
    id: "wikidata-aircraft",
    label: "Wikidata military aircraft records",
    url: "https://query.wikidata.org/",
    note: "Structured aircraft records with country, manufacturer, aircraft role, and source pages.",
  },
  {
    id: "wikimedia-aircraft",
    label: "Wikimedia Commons aircraft media",
    url: "https://commons.wikimedia.org/wiki/Category:Military_aircraft",
    note: "Open aircraft photography used for the playable jet cards.",
  },
];

${toTs("pepperLibrary", peppers)}
${toTs("sharkLibrary", sharks)}
${toTs("buildingLibrary", buildings)}
${toTs("jetLibrary", jets)}
export const contentLibraryStats = {
  peppers: pepperLibrary.length,
  sharks: sharkLibrary.length,
  buildings: buildingLibrary.length,
  jets: jetLibrary.length,
  total: pepperLibrary.length + sharkLibrary.length + buildingLibrary.length + jetLibrary.length,
} as const;
`;

fs.writeFileSync(outputFile, source);
console.log(`Wrote ${outputFile}: ${peppers.length} peppers, ${sharks.length} sharks, ${buildings.length} buildings, ${jets.length} jets.`);

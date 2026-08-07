import fs from "node:fs/promises";
import path from "node:path";

const countriesUrl = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
const populationUrl = "https://raw.githubusercontent.com/datasets/population/main/data/population.csv";
const flagsBaseUrl = "https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3";
const flagLicenseUrl = "https://raw.githubusercontent.com/lipis/flag-icons/main/LICENSE";

const repoRoot = process.cwd();
const outputFile = path.join(repoRoot, "src/lib/countries-data.ts");
const flagDirectory = path.join(repoRoot, "public/burrow-assets/countries");
const physicalStatsFile = path.join(repoRoot, "scripts/data/country-physical-stats.json");

const specialCountryCodes = new Set(["PS", "XK", "TW", "CK", "NU", "EH"]);
const easyCodes = new Set([
  "AR", "AU", "BR", "CA", "CN", "DE", "EG", "ES", "FR", "GB", "GR", "ID", "IE", "IN", "IT", "JP", "KE", "KR", "MX", "NG", "NL", "NO", "NZ", "PE", "PL", "PT", "RU", "SA", "SE", "TH", "TR", "UA", "US", "VA", "VN", "ZA",
]);
const hardCodes = new Set([
  "AD", "AG", "BB", "BI", "BJ", "BT", "BW", "BZ", "CF", "CK", "KM", "CV", "DJ", "DM", "EH", "ER", "FM", "GA", "GD", "GM", "GN", "GQ", "GW", "KI", "KN", "LC", "LI", "LS", "MH", "MR", "MU", "MW", "NR", "NU", "PW", "SB", "SC", "SL", "SM", "SR", "ST", "SZ", "TD", "TG", "TL", "TO", "TV", "VC", "VU", "WS",
]);

const populationSupplements = {
  TW: { value: 23400220, year: 2024, status: "estimate", note: "2024 national estimate" },
  VA: { value: 882, year: 2024, status: "estimate", note: "Recent resident estimate" },
  CK: { value: 15040, year: 2021, status: "census", note: "2021 census" },
  NU: { value: 1681, year: 2022, status: "census", note: "2022 census" },
  EH: { value: 600904, year: 2024, status: "estimate", note: "2024 UN-style estimate" },
};

const displayNameOverrides = {
  CD: "Democratic Republic of the Congo",
  CG: "Republic of the Congo",
  CI: "Côte d’Ivoire",
  CV: "Cabo Verde",
  FM: "Federated States of Micronesia",
};

const continentOverrides = {
  RU: ["Europe", "Asia"],
  TR: ["Europe", "Asia"],
  KZ: ["Europe", "Asia"],
  EG: ["Africa", "Asia"],
};

const populationCodeOverrides = {
  XK: "XKX",
};

const readUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch ${url}: ${response.status}`);
  return response;
};

const populationRows = (csv) => {
  const latest = new Map();
  for (const line of csv.trim().split(/\r?\n/).slice(1)) {
    const parts = line.split(",");
    const value = Number(parts.pop());
    const year = Number(parts.pop());
    const code = parts.pop();
    if (!code || !Number.isFinite(value) || !Number.isFinite(year)) continue;
    const existing = latest.get(code);
    if (!existing || year > existing.year) latest.set(code, { value, year, status: "world-bank", note: `World Bank ${year}` });
  }
  return latest;
};

const worldContinents = (country) => {
  const override = continentOverrides[country.cca2];
  if (override) return override;
  if (country.region === "Americas") return country.subregion === "South America" ? ["South America"] : ["North America"];
  if (country.region === "Antarctic") return ["Antarctica"];
  return [country.region];
};

const slug = (name) => name
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const tsString = (value) => JSON.stringify(value);

const main = async () => {
  const [countriesResponse, populationResponse, physicalStatsJson] = await Promise.all([
    readUrl(countriesUrl),
    readUrl(populationUrl),
    fs.readFile(physicalStatsFile, "utf8"),
  ]);
  const [sourceCountries, populationCsv] = await Promise.all([countriesResponse.json(), populationResponse.text()]);
  const populations = populationRows(populationCsv);
  const physicalStats = JSON.parse(physicalStatsJson);
  const selected = sourceCountries
    .filter((country) => country.unMember || specialCountryCodes.has(country.cca2))
    .sort((first, second) => (displayNameOverrides[first.cca2] ?? first.name.common).localeCompare(displayNameOverrides[second.cca2] ?? second.name.common));

  if (selected.length !== 200) throw new Error(`Expected 200 countries, found ${selected.length}`);
  await fs.mkdir(flagDirectory, { recursive: true });

  const records = [];
  for (const country of selected) {
    const code = country.cca2;
    const lowerCode = code.toLowerCase();
    const flagFile = path.join(flagDirectory, `${lowerCode}.svg`);
    try {
      await fs.access(flagFile);
    } catch {
      const flag = await readUrl(`${flagsBaseUrl}/${lowerCode}.svg`);
      await fs.writeFile(flagFile, await flag.text());
    }

    const name = displayNameOverrides[code] ?? country.name.common;
    const capital = country.capital?.length ? country.capital.join(" / ") : "No official capital";
    const population = populations.get(populationCodeOverrides[code] ?? country.cca3) ?? populationSupplements[code];
    if (!population) throw new Error(`Missing population for ${name} (${country.cca3})`);
    const physical = physicalStats[code];
    if (!physical || !Number.isInteger(physical.landNeighborCount) || !Number.isFinite(physical.highestPointM) || !physical.highestPointName) {
      throw new Error(`Missing physical stats for ${name} (${code})`);
    }
    const continents = worldContinents(country);
    const difficultyBand = easyCodes.has(code) ? "easy" : hardCodes.has(code) ? "hard" : "medium";
    const recognition = difficultyBand === "easy" ? 5 : difficultyBand === "hard" ? 1 : 3;
    const fact = `${name} is in ${country.subregion || continents.join(" and ")}. Its capital is ${capital}, and its land area is ${country.area.toLocaleString("en-US", { maximumFractionDigits: 2 })} square kilometres.`;

    records.push({
      id: `country-${slug(name)}`,
      code,
      code3: country.cca3,
      name,
      officialName: country.name.official,
      capital,
      population: population.value,
      populationYear: population.year,
      populationStatus: population.status,
      populationNote: population.note,
      areaKm2: country.area,
      landNeighborCount: physical.landNeighborCount,
      highestPointName: physical.highestPointName,
      highestPointM: physical.highestPointM,
      continents,
      subregion: country.subregion || continents.join(" and "),
      latitude: country.latlng?.[0] ?? 0,
      longitude: country.latlng?.[1] ?? 0,
      flagEmoji: country.flag,
      difficultyBand,
      recognition,
      fact,
    });
  }

  const lines = [
    "import type { CardMetadata, WorldContinent } from \"./card-metadata\";",
    "",
    "export type CountryPopulationStatus = \"world-bank\" | \"estimate\" | \"census\";",
    "",
    "export type Country = {",
    "  id: string;",
    "  code: string;",
    "  code3: string;",
    "  name: string;",
    "  officialName: string;",
    "  capital: string;",
    "  population: number;",
    "  populationYear: number;",
    "  populationStatus: CountryPopulationStatus;",
    "  populationNote: string;",
    "  areaKm2: number;",
    "  landNeighborCount: number;",
    "  highestPointName: string;",
    "  highestPointM: number;",
    "  continents: WorldContinent[];",
    "  subregion: string;",
    "  latitude: number;",
    "  longitude: number;",
    "  flagEmoji: string;",
    "  image: string;",
    "  imageSourceUrl: string;",
    "  imageCredit: string;",
    "  fact: string;",
    "  metadata: CardMetadata;",
    "};",
    "",
    "// Generated from mledoze/countries, the World Bank population series, and the final public-domain CIA World Factbook snapshot.",
    "// The catalog intentionally contains the 193 UN members, Vatican City, Palestine, Kosovo, Taiwan, Cook Islands, Niue, and Western Sahara: 200 cards total.",
    "export const countries: Country[] = [",
    ...records.map((country) => `  { id: ${tsString(country.id)}, code: ${tsString(country.code)}, code3: ${tsString(country.code3)}, name: ${tsString(country.name)}, officialName: ${tsString(country.officialName)}, capital: ${tsString(country.capital)}, population: ${country.population}, populationYear: ${country.populationYear}, populationStatus: ${tsString(country.populationStatus)}, populationNote: ${tsString(country.populationNote)}, areaKm2: ${country.areaKm2}, landNeighborCount: ${country.landNeighborCount}, highestPointName: ${tsString(country.highestPointName)}, highestPointM: ${country.highestPointM}, continents: ${JSON.stringify(country.continents)}, subregion: ${tsString(country.subregion)}, latitude: ${country.latitude}, longitude: ${country.longitude}, flagEmoji: ${tsString(country.flagEmoji)}, image: ${tsString(`/burrow-assets/countries/${country.code.toLowerCase()}.svg`)}, imageSourceUrl: ${tsString(`https://github.com/lipis/flag-icons/blob/main/flags/4x3/${country.code.toLowerCase()}.svg`)}, imageCredit: \"National flag · flag-icons (MIT)\", fact: ${tsString(country.fact)}, metadata: { difficultyBand: ${tsString(country.difficultyBand)}, recognition: ${country.recognition}, taxonomyGroup: ${tsString(country.subregion)}, accuracyNote: ${tsString(`Population: ${country.populationNote}. Area, capital, borders, and map position use the mledoze countries snapshot. Highest point uses the final public-domain CIA World Factbook snapshot.`)}, location: { label: ${tsString(country.name)}, countries: [${tsString(country.name)}], continents: ${JSON.stringify(country.continents)}, coordinates: [${country.latitude}, ${country.longitude}] } } },`),
    "];",
    "",
  ];

  await fs.writeFile(outputFile, lines.join("\n"));
  const license = await readUrl(flagLicenseUrl);
  await fs.writeFile(path.join(flagDirectory, "LICENSE-flag-icons.txt"), await license.text());
  console.log(`Generated ${records.length} country records and local flag assets.`);
};

await main();

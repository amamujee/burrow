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
  "TW": {
    "value": 23400220,
    "year": 2024,
    "status": "estimate",
    "note": "End-of-December 2024 household-registration population",
    "source": {
      "label": "Taiwan Ministry of the Interior: December 2024 population",
      "url": "https://www.ris.gov.tw/info-liferay/app/channel/newsEnglishDetail/25010859"
    }
  },
  "VA": {
    "value": 882,
    "year": 2024,
    "status": "estimate",
    "note": "Residents at 31 December 2024",
    "source": {
      "label": "Vatican City: residents at 31 December 2024",
      "url": "https://www.vaticanstate.va/en/state-and-government/general-informations/population.html"
    }
  },
  "CK": {
    "value": 15040,
    "year": 2021,
    "status": "census",
    "note": "2021 census-night count, including visitors",
    "source": {
      "label": "Cook Islands Statistics Office: 2021 census",
      "url": "https://stats.gov.ck/2021-census-of-population-and-dwellings/"
    }
  },
  "NU": {
    "value": 1681,
    "year": 2022,
    "status": "census",
    "note": "2022 census-night count, including visitors",
    "source": {
      "label": "Niue Statistics Office: 2022 census",
      "url": "https://niuestatistics.nu/population/niue-census-of-population-and-housing-2022/"
    }
  },
  "EH": {
    "value": 601000,
    "year": 2025,
    "status": "estimate",
    "note": "UN 2025 medium-variant projection, rounded to the nearest thousand",
    "source": {
      "label": "UNdata Western Sahara profile",
      "url": "https://data.un.org/en/iso/eh.html"
    }
  }
};

const displayNameOverrides = {
  CD: "Democratic Republic of the Congo",
  CG: "Republic of the Congo",
  CI: "Côte d’Ivoire",
  CV: "Cabo Verde",
  FM: "Federated States of Micronesia",
};

// Explicit roles prevent an upstream city list from flattening disputed or shared capitals.
const capitalOverrides = {
  GQ: {
    capital: "Ciudad de la Paz",
    clause: "Its capital is Ciudad de la Paz",
    note: "Ciudad de la Paz was declared the capital on 2 January 2026; the decree allows one year for government offices to move from Malabo.",
    sources: [{ label: "Equatorial Guinea government: Decree 1/2026", url: "https://www.guineaecuatorialpress.com/noticias/decreto_ley_por_el_que_se_declara_la_ciudad_de_la_paz_djibloho_capital_de_la_republica_de_guinea_ecuatorial" }],
  },
  LK: {
    capital: "Sri Jayewardenepura Kotte",
    clause: "Its administrative capital is Sri Jayewardenepura Kotte",
    note: "Sri Jayewardenepura Kotte is the administrative capital and the location of Parliament.",
    sources: [{ label: "Sri Jayewardenepura Kotte Municipal Council", url: "https://www.kotte.mc.gov.lk/index.php?Itemid=175&id=25&lang=en&option=com_content&view=article" }],
  },
  NR: {
    capital: "No official capital",
    clause: "It has no official capital; government offices are in Yaren",
    note: "Yaren is a government district, not an officially designated capital.",
    sources: [{ label: "Commonwealth: Naoero country profile", url: "https://thecommonwealth.org/our-member-countries/naeoro" }],
  },
  SZ: {
    capital: "Mbabane and Lobamba",
    clause: "Mbabane is its administrative capital; Lobamba is its royal and legislative capital",
    note: "Capital functions are shared between Mbabane and Lobamba.",
    sources: [
      { label: "Government of Eswatini: country description", url: "https://www.gov.sz/images/Bank-of-Eswatini-Information-Statement-Executed.pdf" },
      { label: "Eswatini Tourism Authority: Lobamba", url: "https://www.thekingdomofeswatini.com/news-blogs/lobamba-walking-tour-with-all-out-africa-now-on-offer/" },
    ],
  },
  ZA: {
    capital: "Pretoria, Bloemfontein, and Cape Town",
    clause: "Its three capitals are Pretoria, Bloemfontein, and Cape Town",
    note: "Pretoria is the administrative capital, Bloemfontein the judicial capital, and Cape Town the legislative capital.",
    sources: [{ label: "South African government: three capitals", url: "https://www.gov.za/ts/about-sa/south-africas-provinces" }],
  },
  PS: {
    capital: "East Jerusalem (claimed); Ramallah (administrative)",
    clause: "Palestine claims East Jerusalem as its capital; Ramallah is its administrative center",
    note: "East Jerusalem is the claimed capital; Ramallah hosts Palestinian Authority institutions. Jerusalem's final status remains disputed.",
    sources: [
      { label: "Palestinian Ministry of Foreign Affairs: Jerusalem claim", url: "https://www.mfae.gov.ps/en-us/fundamentalissues/jerusalem" },
      { label: "Ramallah Municipality: administrative center", url: "https://www.ramallah.ps/en/Category/61/international-partnerships-and-relations" },
    ],
  },
  IL: {
    capital: "Jerusalem (disputed status)",
    clause: "Israel names Jerusalem as its capital; the city's status is disputed",
    note: "Israel declares Jerusalem its capital. The city's final status and sovereignty are disputed internationally.",
    sources: [{ label: "United Nations: Jerusalem status", url: "https://www.un.org/unispal/permanent-status-issues/" }],
  },
  EH: {
    capital: "Disputed",
    officialName: "Western Sahara",
    clause: "Its political status is disputed",
    note: "The UN lists Western Sahara as a Non-Self-Governing Territory. A capital or claimant's state name is not presented as an agreed sovereign status.",
    sources: [{ label: "United Nations: Western Sahara status", url: "https://www.un.org/dppa/decolonization/en/node/703" }],
  },
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

const naturalList = (items) => {
  if (items.length < 2) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

const namesWithLeadingArticle = new Set([
  "Bahamas", "Central African Republic", "Democratic Republic of the Congo",
  "Dominican Republic", "Federated States of Micronesia", "Gambia", "Maldives",
  "Marshall Islands", "Netherlands", "Philippines", "Republic of the Congo",
  "Seychelles", "Solomon Islands", "United Arab Emirates", "United Kingdom", "United States",
]);
const sentence = (text) => `${text.replace(/[.!?]+$/, "")}.`;

const main = async () => {
  const [countriesResponse, populationResponse, physicalStatsJson, areaStatsJson] = await Promise.all([
    readUrl(countriesUrl),
    readUrl(populationUrl),
    fs.readFile(physicalStatsFile, "utf8"),
    fs.readFile(path.join(repoRoot, "scripts/data/country-area-stats.json"), "utf8"),
  ]);
  const [sourceCountries, populationCsv] = await Promise.all([countriesResponse.json(), populationResponse.text()]);
  const populations = populationRows(populationCsv);
  const physicalStats = JSON.parse(physicalStatsJson);
  const areaStats = JSON.parse(areaStatsJson);
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
    const capitalDetail = capitalOverrides[code];
    const capital = capitalDetail?.capital ?? (code === "US" ? "Washington, D.C." : country.capital?.length ? naturalList(country.capital) : "No official capital");
    const population = populations.get(populationCodeOverrides[code] ?? country.cca3) ?? populationSupplements[code];
    if (!population) throw new Error(`Missing population for ${name} (${country.cca3})`);
    const physical = physicalStats[code];
    if (!physical || !Number.isInteger(physical.landNeighborCount) || !Number.isFinite(physical.highestPointM) || !physical.highestPointName) {
      throw new Error(`Missing physical stats for ${name} (${code})`);
    }
    const continents = worldContinents(country);
    const difficultyBand = easyCodes.has(code) ? "easy" : hardCodes.has(code) ? "hard" : "medium";
    const recognition = difficultyBand === "easy" ? 5 : difficultyBand === "hard" ? 1 : 3;
    const capitalClause = capitalDetail?.clause ?? (capital === "No official capital" ? "It has no official capital" : `Its ${country.capital?.length > 1 ? "capitals are" : "capital is"} ${capital}`);
    const area = areaStats.countries[code];
    if (!area) throw new Error(`Missing audited area for ${code}`);
    const areaSource = area.source ?? areaStats.source;
    const subject = namesWithLeadingArticle.has(name) ? `The ${name}` : name;
    const fact = `${subject} is in ${naturalList(continents)}. ${sentence(capitalClause)} Its reported area is ${area.value.toLocaleString("en-US", { maximumFractionDigits: 2 })} square kilometers.`;

    records.push({
      id: `country-${slug(name)}`,
      code,
      code3: country.cca3,
      name,
      officialName: capitalDetail?.officialName ?? country.name.official,
      capital,
      population: population.value,
      populationYear: population.year,
      populationStatus: population.status,
      populationNote: population.note,
      areaKm2: area.value,
      areaNote: area.note,
      areaSource,
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
    "// Generated from mledoze/countries, World Bank population, UN surface areas, the archived CIA physical snapshot, and cited exceptions.",
    "// The catalog intentionally contains the 193 UN members, Vatican City, Palestine, Kosovo, Taiwan, Cook Islands, Niue, and Western Sahara: 200 cards total.",
    "export const countries: Country[] = [",
    ...records.map(({ difficultyBand, recognition, areaNote, areaSource, ...country }) => `  ${JSON.stringify({
      ...country,
      image: `/burrow-assets/countries/${country.code.toLowerCase()}.svg`,
      imageSourceUrl: `https://github.com/lipis/flag-icons/blob/main/flags/4x3/${country.code.toLowerCase()}.svg`,
      imageCredit: "National flag · flag-icons (MIT)",
      metadata: {
        difficultyBand, recognition, taxonomyGroup: country.subregion,
        accuracyNote: `Population: ${country.populationNote}. Area: ${areaNote} ${capitalOverrides[country.code]?.note ?? "Capital uses the mledoze snapshot."} Map center uses the mledoze snapshot. Highest point and land neighbors use the archived CIA snapshot. Figures describe the source’s geographic scope.`,
        sources: [
          { label: "mledoze countries geography snapshot", url: "https://github.com/mledoze/countries/blob/master/countries.json", note: `${capitalOverrides[country.code] ? "Names, region and approximate map center; capital roles and disputed status follow the separately cited sources." : "Capital, names, region and approximate map center."}${areaSource.url === "https://github.com/mledoze/countries/blob/master/countries.json" ? ` Area: ${areaNote}` : ""}` },
          ...(capitalOverrides[country.code]?.sources ?? []),
          country.populationStatus === "world-bank"
            ? { label: "World Bank population series", url: `https://data.worldbank.org/indicator/SP.POP.TOTL?locations=${country.code}`, note: `Retained ${country.populationYear} estimate.` }
            : populationSupplements[country.code].source,
          { label: areaSource.label, url: areaSource.url, note: areaNote },
          { label: "CIA World Factbook archived geography", url: "https://www.cia.gov/the-world-factbook/about/archives/", note: "Existing highest point and land-neighbor snapshot; definitions and disputed boundaries can differ." },
        ].filter((source, index, all) => source && all.findIndex((item) => item?.url === source.url) === index),
        location: { label: country.name, countries: [country.name], continents: country.continents, coordinates: [country.latitude, country.longitude] },
      },
    })},`),
    "];",
    "",
  ];

  await fs.writeFile(outputFile, lines.join("\n"));
  const license = await readUrl(flagLicenseUrl);
  await fs.writeFile(path.join(flagDirectory, "LICENSE-flag-icons.txt"), await license.text());
  console.log(`Generated ${records.length} country records and local flag assets.`);
};

await main();

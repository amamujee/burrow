import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { expect, test } from "@playwright/test";
import { countries, type Country } from "../../src/lib/countries-data";
import { buildFactRound, countryCapitalLabel } from "../../src/lib/game-modes";

const byCode = new Map(countries.map((country) => [country.code, country]));

test.describe("Audited country capitals", { tag: "@logic" }, () => {
  test("distinguishes official capitals, government seats and disputed claims", () => {
    expect(byCode.get("GQ")?.capital).toBe("Ciudad de la Paz");
    expect(byCode.get("GQ")?.metadata.accuracyNote).toContain("2 January 2026");
    expect(byCode.get("LK")?.capital).toBe("Sri Jayewardenepura Kotte");
    expect(byCode.get("NR")?.capital).toBe("No official capital");
    expect(byCode.get("NR")?.fact).toContain("government offices are in Yaren");
    expect(byCode.get("SZ")?.fact).toContain("Mbabane is its administrative capital; Lobamba is its royal and legislative capital");
    expect(byCode.get("ZA")?.fact).toContain("Its three capitals are Pretoria, Bloemfontein, and Cape Town");
    expect(byCode.get("PS")?.capital).toBe("East Jerusalem (claimed); Ramallah (administrative)");
    expect(byCode.get("IL")?.fact).toContain("the city's status is disputed");
    expect(byCode.get("EH")?.officialName).toBe("Western Sahara");
    expect(byCode.get("EH")?.fact).toContain("Its political status is disputed");
    for (const code of ["GQ", "LK", "NR", "SZ", "ZA", "PS", "IL", "EH"]) {
      expect(byCode.get(code)?.metadata.sources?.length, code).toBeGreaterThan(4);
    }
  });

  test("keeps all country facts readable without duplicate punctuation or slash lists", () => {
    for (const country of countries) {
      expect(country.fact, country.code).not.toMatch(/\.\.|\s\/\s|square kilometers of land/);
      expect(country.fact, country.code).toMatch(/square kilometers\.$/);
    }
    expect(byCode.get("US")?.fact).toContain("The United States is in North America. Its capital is Washington, D.C. Its reported area");
    expect(byCode.get("RU")?.fact).toContain("Europe and Asia");
  });

  test("country Fact answers match the displayed claim even when countries share measurements", () => {
    const byId = new Map(countries.map((country) => [country.id, country]));
    const observed = new Set<string>();
    for (const difficulty of [1, 2, 3] as const) for (let seed = 0; seed < 500; seed++) {
      const round = buildFactRound("countries", difficulty, seed);
      const [, kind, countryId] = round.id.match(/-fact-country-(capital|continent|population|area|neighbors|highest-point)-(country-.+)$/)!;
      const country = byId.get(countryId)!;
      expect(country, round.id).toBeTruthy();
      observed.add(kind);
      let accurate = true;
      if (kind === "capital") {
        accurate = round.statement.endsWith(`: ${countryCapitalLabel(country).replace(/\.$/, "")}.`);
        expect(round.statement).not.toMatch(/No official capital is|Disputed is|\.\./);
      } else if (kind === "neighbors") {
        accurate = Number(round.statement.match(/has (\d+) land/)?.[1]) === country.landNeighborCount;
      } else if (kind === "population" || kind === "area") {
        const value = kind === "population" ? country.population : country.areaKm2;
        accurate = round.statement.includes(`about ${value.toLocaleString("en-US")} `);
      } else if (kind === "highest-point") {
        accurate = round.statement.startsWith(`${country.highestPointName} is`);
      } else {
        accurate = country.continents.some((continent) => round.statement.endsWith(`in ${continent}.`));
      }
      expect(round.answer, round.id).toBe(accurate ? "True" : "False");
    }
    expect(observed).toEqual(new Set(["capital", "continent", "population", "area", "neighbors", "highest-point"]));
  });

  test("regeneration preserves audited facts, source notes, numeric scope and stable IDs", async () => {
    // Exercise the real generator with a frozen population/geography input and no network or writes.
    // These old upstream capitals must not overwrite the sourced corrections.
    const legacyCapitals: Record<string, string[]> = {
      GQ: ["Malabo"], LK: ["Colombo"], NR: ["Yaren"], SZ: ["Lobamba"],
      ZA: ["Pretoria", "Bloemfontein", "Cape Town"], PS: ["Ramallah"],
      IL: ["Jerusalem"], EH: ["El Aaiún"], US: ["Washington D.C."],
    };
    const geography = countries.map((country) => ({
      cca2: country.code,
      cca3: country.code3,
      name: { common: country.name, official: country.code === "EH" ? "Sahrawi Arab Democratic Republic" : country.officialName },
      capital: legacyCapitals[country.code] ?? [country.capital],
      unMember: true,
      region: country.continents.some((continent) => continent.endsWith("America")) ? "Americas" : country.continents[0],
      subregion: country.subregion,
      latlng: [country.latitude, country.longitude],
      flag: country.flagEmoji,
    }));
    const populationCsv = "Country Name,Country Code,Year,Value\n" + countries
      .filter((country) => country.populationStatus === "world-bank")
      .map((country) => [country.name, country.code === "XK" ? "XKX" : country.code3, country.populationYear, country.population].join(","))
      .join("\n");
    let generated = "";
    const generator = await fs.readFile(path.join(process.cwd(), "scripts/generate-countries-pack.mjs"), "utf8");
    const program = new vm.Script(`(async () => {${generator.replace(/^import .*;\n/gm, "")} })()`);
    await program.runInNewContext({
      fs: {
        readFile: fs.readFile,
        access: async () => {},
        mkdir: async () => {},
        writeFile: async (file: string, contents: string) => { if (file.endsWith("countries-data.ts")) generated = contents; },
      },
      path,
      process: { cwd: () => process.cwd() },
      console: { log: () => {} },
      fetch: async (url: string) => {
        if (url.endsWith("countries.json")) return { ok: true, json: async () => geography };
        if (url.endsWith("population.csv")) return { ok: true, text: async () => populationCsv };
        if (url.endsWith("/LICENSE")) return { ok: true, text: async () => "fixture license" };
        throw new Error(`Unexpected generator request: ${url}`);
      },
    });
    const records = JSON.parse(`[${generated.split("export const countries: Country[] = [")[1].split("];")[0].trim().replace(/,$/, "")}]`) as Country[];
    expect(records).toHaveLength(200);
    for (const record of records) {
      const current = byCode.get(record.code)!;
      for (const field of ["id", "capital", "officialName", "fact", "population", "populationYear", "populationStatus", "areaKm2"] as const) {
        expect(record[field], `${record.code}: ${field}`).toEqual(current[field]);
      }
      expect(record.metadata.accuracyNote, record.code).toBe(current.metadata.accuracyNote);
      expect(record.metadata.sources, record.code).toEqual(current.metadata.sources);
    }
  });
});

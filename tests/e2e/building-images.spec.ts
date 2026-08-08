import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import {
  buildingImagePresentation,
  resolvedImagePresentation,
} from "../../src/lib/building-image-presentation";
import { buildings } from "../../src/lib/game-data";

const correctedBuildingIds = [
  "merdeka-118",
  "one-vanderbilt",
  "princess-tower",
  "cayan-tower",
  "520-fifth-avenue",
  "35-hudson-yards",
  "one-manhattan-west",
  "big-ben",
  "eiffel-tower",
  "leaning-tower-of-pisa",
] as const;

test("corrected building cards use attributed photographs", { tag: "@logic" }, async () => {
  for (const id of correctedBuildingIds) {
    const building = buildings.find((candidate) => candidate.id === id);
    expect(building, `${id} should exist`).toBeDefined();
    expect(building?.image).toMatch(/\.jpg$/);
    expect(building?.imageCredit).not.toContain("Burrow original SVG");
    expect(building?.imageSourceUrl).toMatch(/^https:\/\//);

    const imagePath = path.join(process.cwd(), "public", building!.image.replace(/^\//, ""));
    expect(fs.existsSync(imagePath), `${id} should have a local photo`).toBe(true);
    expect(fs.statSync(imagePath).size, `${id} photo should not be empty`).toBeGreaterThan(10_000);

    const stats = await sharp(imagePath).stats();
    const brightestChannel = Math.max(...stats.channels.slice(0, 3).map((channel) => channel.mean));
    expect(brightestChannel, `${id} photo should render visible pixels`).toBeGreaterThan(20);
  }
});

test("building image presentation metadata reaches the shared renderer lookup", { tag: "@logic" }, () => {
  const merdeka = buildings.find((building) => building.id === "merdeka-118");
  const princess = buildings.find((building) => building.id === "princess-tower");
  const makkah = buildings.find((building) => building.id === "makkah-clock");

  expect(buildingImagePresentation(merdeka!.image)).toEqual({ fit: "contain", position: "center" });
  expect(buildingImagePresentation(princess!.image)).toEqual({ fit: "cover", position: "44% center" });
  expect(resolvedImagePresentation(makkah!.image, true)).toEqual({ fit: "cover", position: "left center" });
  expect(buildingImagePresentation("/not-a-building.jpg")).toBeUndefined();
  expect(resolvedImagePresentation("/not-a-building.jpg", true)).toEqual({ fit: "contain", position: "center" });
});

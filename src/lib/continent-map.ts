import type { WorldContinent, WorldLocation } from "./card-metadata";
import layout from "./continent-map-layout.json";
import { projectContinentPoint, projectWorldPoint } from "./continent-projection.mjs";

export type MapRegion = "world" | "us" | WorldContinent;
export const continentRegions = Object.keys(layout) as WorldContinent[];
export const isContinentRegion = (region: MapRegion): region is WorldContinent => region !== "world" && region !== "us";

export const continentMapPoint = (region: WorldContinent, coordinates: readonly [number, number]) => {
  const point = projectContinentPoint(layout[region], coordinates, region === "Antarctica");
  return { x: point.x, y: point.y / 70 * 100 };
};

export const worldMapPoint = (coordinates: readonly [number, number]) => {
  const point = projectWorldPoint(coordinates);
  return { x: point.x, y: point.y / 56 * 100 };
};

export const continentForLocations = (locations: readonly (WorldLocation | undefined)[]): WorldContinent | null => {
  const first = locations[0];
  if (!first || first.continents.length !== 1) return null;
  const continent = first.continents[0];
  return locations.every((location) => {
    if (!location?.coordinates || location.continents.length !== 1 || location.continents[0] !== continent) return false;
    const point = continentMapPoint(continent, location.coordinates);
    return point.x >= 4 && point.x <= 96 && point.y >= 4 && point.y <= 96;
  }) ? continent : null;
};

export const continentMapDistance = (region: WorldContinent, first: WorldLocation, second: WorldLocation) => {
  if (!first.coordinates || !second.coordinates) return 0;
  const a = continentMapPoint(region, first.coordinates);
  const b = continentMapPoint(region, second.coordinates);
  return Math.hypot(a.x - b.x, (a.y - b.y) * 0.7);
};

// Spread the letter buttons, not the geographic anchors. Leader lines on the
// map preserve the exact location when two nearby countries need touch space.
export const spreadMapPins = (points: readonly { x: number; y: number }[], plotHeight = 70, minimumDistance = 16) => {
  const ratio = plotHeight / 100;
  const placed = points.map((point) => ({ x: Math.max(7, Math.min(93, point.x)), y: Math.max(6, Math.min(plotHeight - 6, point.y * ratio)) }));
  for (let pass = 0; pass < 60; pass++) {
    for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i], b = placed[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= minimumDistance) continue;
      const ux = distance ? dx / distance : 1, uy = distance ? dy / distance : 0;
      const shift = (minimumDistance + 0.1 - distance) / 2;
      a.x = Math.max(7, Math.min(93, a.x - ux * shift));
      a.y = Math.max(6, Math.min(plotHeight - 6, a.y - uy * shift));
      b.x = Math.max(7, Math.min(93, b.x + ux * shift));
      b.y = Math.max(6, Math.min(plotHeight - 6, b.y + uy * shift));
    }
  }
  return placed.map((point) => ({ x: point.x, y: point.y / ratio }));
};

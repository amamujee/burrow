import type { WorldLocation } from "./card-metadata";
import layout from "./us-map-layout.json";

// The same bounds and frames are used to generate the Census state outlines.
// Alaska and Hawaii are shown in separate insets, at different scales.
export const usMapPoint = ([latitude, longitude]: readonly [number, number]) => {
  if (latitude >= 50 && longitude > 170) longitude -= 360;
  const region = layout.regions.find(({ bounds: [west, south, east, north] }) =>
    longitude >= west && longitude <= east && latitude >= south && latitude <= north);
  if (!region) return null;
  const [west, south, east, north] = region.bounds;
  const [left, top, width, height] = region.frame;
  return {
    x: left + ((longitude - west) / (east - west)) * width,
    y: (top + ((north - latitude) / (north - south)) * height) / layout.viewBox[1] * 100,
  };
};

export const isUsMapLocation = (location?: WorldLocation): location is WorldLocation & { coordinates: readonly [number, number] } =>
  Boolean(location?.countries.length === 1 && location.countries[0] === "United States"
    && location.coordinates && usMapPoint(location.coordinates));

export const usMapDistance = (first: WorldLocation, second: WorldLocation) => {
  if (!isUsMapLocation(first) || !isUsMapLocation(second)) return 0;
  const a = usMapPoint(first.coordinates)!;
  const b = usMapPoint(second.coordinates)!;
  return Math.hypot(a.x - b.x, (a.y - b.y) * 0.65);
};

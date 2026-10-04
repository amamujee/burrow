// Shared by the asset generator and the live pins: a 100 x 70 plot.
// Regional equirectangular projections preserve aspect at the middle latitude;
// Antarctica uses a south-polar azimuthal equidistant projection.
export function projectContinentPoint(bounds, coordinates, polar = false) {
  const [latitude, originalLongitude] = coordinates;
  const [west, south, east, north] = bounds;
  if (polar) {
    const radius = (90 + latitude) / 30 * 31;
    const angle = originalLongitude * Math.PI / 180;
    return { x: 50 + radius * Math.sin(angle), y: 35 - radius * Math.cos(angle) };
  }
  let longitude = originalLongitude;
  const middle = (west + east) / 2;
  while (longitude - middle > 180) longitude -= 360;
  while (longitude - middle < -180) longitude += 360;
  const cosine = Math.cos((south + north) / 2 * Math.PI / 180);
  const scale = Math.min(92 / ((east - west) * cosine), 62 / (north - south));
  return { x: 50 + (longitude - middle) * cosine * scale, y: 35 - (latitude - (south + north) / 2) * scale };
}

// A padded 100 x 56 world plot. Keep the full date-line extent, including
// both sides of Fiji/Russia, and preserve the 2:1 equirectangular aspect.
export function projectWorldPoint(coordinates) {
  const [latitude, longitude] = coordinates;
  return { x: 4 + (longitude + 180) / 360 * 92, y: 5 + (90 - latitude) / 180 * 46 };
}

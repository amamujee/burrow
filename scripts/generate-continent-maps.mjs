import { readFile, writeFile } from "node:fs/promises";
import { projectContinentPoint, projectWorldPoint } from "../src/lib/continent-projection.mjs";

// Natural Earth v5.1.2, ne_50m_admin_0_countries.geojson, public domain.
// Reproduce: curl -fL https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson -o /tmp/continent-countries.geojson
// node scripts/generate-continent-maps.mjs /tmp/continent-countries.geojson
const source = JSON.parse(await readFile(process.argv[2] ?? "/tmp/continent-countries.geojson", "utf8"));
const layouts = JSON.parse(await readFile(new URL("../src/lib/continent-map-layout.json", import.meta.url), "utf8"));
const catalogSource = await readFile(new URL("../src/lib/countries-data.ts", import.meta.url), "utf8");
const catalog = catalogSource.split("\n").filter((line) => line.startsWith('  {"id":')).map((line) => JSON.parse(line.trim().replace(/,$/, "")));
const continentsByName = new Map(catalog.map((country) => [country.name, country.continents]));
const namesByCode = new Map(catalog.map((country) => [country.code3, country.name]));
const countryName = (p) => namesByCode.get(p.ADM0_A3) ?? namesByCode.get(p.ISO_A3) ?? p.ADMIN;
const anchors = Object.fromEntries(source.features.map(({ properties: p }) => [countryName(p), [p.LABEL_Y, p.LABEL_X]]));
await writeFile("src/lib/continent-country-anchors.json", JSON.stringify(anchors) + "\n");
const round = (n) => Number(n.toFixed(1));
// Keep the source topology. Quantization removes repeated sub-pixel vertices,
// without independently simplifying shared borders and opening seams.
const ringPath = (ring, project) => {
  const points = ring.map(([lon, lat]) => project([lat, lon])).map(({ x, y }) => [round(x), round(y)]);
  const unique = points.filter((point, i) => !i || point[0] !== points[i - 1][0] || point[1] !== points[i - 1][1]);
  return unique.length < 3 ? "" : `M${unique.map((point) => point.join(",")).join("L")}Z`;
};
const result = {};
for (const [region, bounds] of Object.entries(layouts)) {
  const project = (coordinates) => projectContinentPoint(bounds, coordinates, region === "Antarctica");
  result[region] = source.features.flatMap((feature) => {
    if (region === "Antarctica" && feature.properties.CONTINENT !== "Antarctica") return [];
    if (region !== "Antarctica" && feature.properties.CONTINENT === "Antarctica") return [];
    const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    const paths = polygons.flatMap((polygon) => {
      const points = polygon[0].map(([lon, lat]) => project([lat, lon]));
      if (!points.some(({ x, y }) => x >= 0 && x <= 100 && y >= 0 && y <= 70)) return [];
      // A ring on the opposite side of the globe can cross the projection seam.
      if (points.some((p, i) => i && Math.abs(p.x - points[i - 1].x) > 100)) return [];
      return polygon.map((ring) => ringPath(ring, project));
    });
    if (!paths.length) return [];
    const p = feature.properties;
    const anchor = project([p.LABEL_Y, p.LABEL_X]);
    return [{ id: p.ADM0_A3, name: countryName(p), continents: continentsByName.get(countryName(p)) ?? [p.CONTINENT],
      anchor: [round(anchor.x), round(anchor.y)], path: paths.join("") }];
  }).sort((a, b) => a.name.localeCompare(b.name));
}
await writeFile("src/lib/continent-map-data.json", JSON.stringify(result) + "\n");
console.log(Object.fromEntries(Object.entries(result).map(([name, countries]) => [name, countries.length])));

// The world view and its landing-page thumbnail use these same country borders.
const world = source.features.map(({ properties: p, geometry }) => {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const anchor = projectWorldPoint([p.LABEL_Y, p.LABEL_X]);
  return { id: p.ADM0_A3, name: countryName(p), continents: continentsByName.get(countryName(p)) ?? [p.CONTINENT],
    anchor: [round(anchor.x), round(anchor.y)], path: polygons.flatMap((polygon) => polygon.map((ring) => ringPath(ring, projectWorldPoint))).join("") };
}).sort((a, b) => a.name.localeCompare(b.name));
await writeFile("src/lib/world-map-data.json", JSON.stringify(world) + "\n");
await writeFile("public/world-map-land.svg", `<!-- Natural Earth v5.1.2, ne_50m_admin_0_countries.geojson, public domain: https://www.naturalearthdata.com/ -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56">
${world.map((country) => `<path d="${country.path}" fill="#e7d798" fill-rule="evenodd" stroke="#375b52" stroke-width="0.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join("\n")}
</svg>
`);

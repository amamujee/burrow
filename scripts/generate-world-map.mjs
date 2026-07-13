import { readFile, writeFile } from "node:fs/promises";

const [sourcePath = "/tmp/ne_110m_land.geojson", outputPath = "public/world-map-land.svg"] = process.argv.slice(2);
const source = JSON.parse(await readFile(sourcePath, "utf8"));

const project = ([longitude, latitude]) => [
  Number(((longitude + 180) / 3.6).toFixed(2)),
  Number((((90 - latitude) / 180) * 56).toFixed(2)),
];

const ringPath = (ring) => {
  const [first, ...rest] = ring.map(project);
  return `M${first[0]} ${first[1]}${rest.map(([x, y]) => `L${x} ${y}`).join("")}Z`;
};

const geometryPath = (geometry) => {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flatMap((polygon) => polygon.map(ringPath)).join("");
};

const paths = source.features.map((feature) => geometryPath(feature.geometry)).join("");
const svg = `<!-- Natural Earth 1:110m land, public domain: https://www.naturalearthdata.com/ -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56" preserveAspectRatio="none">
  <path d="${paths}" fill="#d9c77e" fill-rule="evenodd" stroke="#375b52" stroke-width="0.32" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
</svg>
`;

await writeFile(outputPath, svg);
console.log(`Wrote ${outputPath}`);

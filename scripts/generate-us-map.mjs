import { readFile, writeFile } from "node:fs/promises";

// us-atlas 3.0.1, Census Bureau 2017 cartographic boundaries, public domain.
// Source snapshot is checked in so regeneration needs no network or GIS packages.
const topology = JSON.parse(await readFile("scripts/data/us-states-10m.json", "utf8"));
const layout = JSON.parse(await readFile("src/lib/us-map-layout.json", "utf8"));
const names = "AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|DE Delaware|DC District of Columbia|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|IN Indiana|IA Iowa|KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|MA Massachusetts|MI Michigan|MN Minnesota|MS Mississippi|MO Missouri|MT Montana|NE Nebraska|NV Nevada|NH New Hampshire|NJ New Jersey|NM New Mexico|NY New York|NC North Carolina|ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|PA Pennsylvania|RI Rhode Island|SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|VT Vermont|VA Virginia|WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming".split("|");
const abbreviations = new Map(names.map((row) => [row.slice(3), row.slice(0, 2)]));
const decodedArcs = topology.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => {
    x += dx; y += dy;
    return [x * topology.transform.scale[0] + topology.transform.translate[0], y * topology.transform.scale[1] + topology.transform.translate[1]];
  });
});
const project = ([longitude, latitude], state) => {
  const regionId = state === "Alaska" ? "alaska" : state === "Hawaii" ? "hawaii" : "mainland";
  const { bounds: [west, south, east, north], frame: [left, top, width, height] } = layout.regions.find((region) => region.id === regionId);
  // The far western Aleutian Islands cross the antimeridian.
  if (state === "Alaska" && longitude > 0) longitude -= 360;
  return [left + (longitude - west) / (east - west) * width, top + (north - latitude) / (north - south) * height];
};
const externalLabels = { "New Hampshire": [96, 10], Massachusetts: [96, 14], "Rhode Island": [96, 18], Connecticut: [96, 22], "New Jersey": [96, 26], Delaware: [96, 30], Maryland: [96, 34], "District of Columbia": [96, 38] };
const manualCenters = { Michigan: [-85.5, 43.5], Florida: [-82, 28.5], Virginia: [-79.3, 37.5], Louisiana: [-92.4, 31.1], Alaska: [-151, 63], Hawaii: [-157.5, 20.6], Maryland: [-76.7, 39.1], "District of Columbia": [-77.04, 38.91] };
const ringCenter = (ring) => {
  let area = 0, x = 0, y = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const cross = a[0] * b[1] - b[0] * a[1];
    area += cross;
    x += (a[0] + b[0]) * cross;
    y += (a[1] + b[1]) * cross;
  }
  return { area: Math.abs(area), center: [x / (3 * area), y / (3 * area)] };
};
const states = topology.objects.states.geometries.filter((state) => abbreviations.has(state.properties.name)).map((state) => {
  const name = state.properties.name;
  const polygons = state.type === "Polygon" ? [state.arcs] : state.arcs;
  const rings = polygons.flatMap((polygon) => polygon.map((ring) => ring.flatMap((arcId) => arcId < 0 ? [...decodedArcs[~arcId]].reverse() : decodedArcs[arcId])));
  const biggest = rings.map(ringCenter).toSorted((a, b) => b.area - a.area)[0];
  const center = manualCenters[name] ?? biggest.center;
  const anchor = project(center, name);
  return { id: state.id, name, abbreviation: abbreviations.get(name),
    path: rings.map((ring) => ring.map((point, index) => `${index ? "L" : "M"}${project(point, name).map((n) => n.toFixed(3)).join(" ")}`).join("") + "Z").join(""),
    label: externalLabels[name] ?? anchor, anchor,
  };
}).sort((a, b) => a.name.localeCompare(b.name));
await writeFile("src/lib/us-map-data.json", JSON.stringify(states) + "\n");
console.log(`Generated ${states.length - 1} states and Washington, DC.`);

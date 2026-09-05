# Country physical stats

`country-physical-stats.json` supplies the two stable geography fields used by Countries & Flags Top Trumps.

- `landNeighborCount` is derived from the `borders` arrays in the [mledoze countries dataset](https://github.com/mledoze/countries), counting only countries in Burrow's 200-card catalog.
- `highestPointName` and `highestPointM` come from the final public-domain [CIA World Factbook JSON snapshot](https://github.com/factbook/factbook.json).

`scripts/generate-countries-pack.mjs` validates that every generated country has both fields before rebuilding `src/lib/countries-data.ts`.

# Bridges, tunnels, and US state boundaries

`bridges-and-tunnels.json` is the audited source for the Bridges & Tunnels pack. It records lengths with their measurement scope, opening and replacement dates, representative coordinates, US states, factual references, and photographic attribution including original filenames and license URLs. Regenerate the pack with `node scripts/generate-bridges-and-tunnels-pack.mjs`, then run `npm run generate:offline-manifest`.

`us-states-10m.json` is the public-domain US Census Bureau 2017 cartographic boundary data distributed in [us-atlas 3.0.1](https://github.com/topojson/us-atlas), downloaded from `https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json`. `node scripts/generate-us-map.mjs` generates the 50 states and Washington, DC using the shared `src/lib/us-map-layout.json`; Alaska and Hawaii have separate inset scales. Both generators work offline with the checked-in snapshots.

See [the September 2026 audit](../../docs/bridges-and-tunnels-audit.md) for corrections and per-card references.

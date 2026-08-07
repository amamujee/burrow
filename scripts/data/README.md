# Country physical stats

`country-physical-stats.json` supplies the two stable geography fields used by Countries & Flags Top Trumps.

- `landNeighborCount` is derived from the `borders` arrays in the [mledoze countries dataset](https://github.com/mledoze/countries), counting only countries in Burrow's 200-card catalog.
- `highestPointName` and `highestPointM` come from the final public-domain [CIA World Factbook JSON snapshot](https://github.com/factbook/factbook.json).

`scripts/generate-countries-pack.mjs` validates that every generated country has both fields before rebuilding `src/lib/countries-data.ts`.

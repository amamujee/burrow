# Fruits content audit — 21 September 2026

The Fruits pack adds 125 distinct fruit cards with photographs and representative origin or cultivation associations across six continents. Familiar fruits anchor the easier pool; regional fruits such as pulasan, safou, riberry, cupuaçu and salal add discovery at higher difficulties.

The latest expansion adds 25 familiar fruits and market types, including grapefruit, mandarins, nectarines, cantaloupe, honeydew, dates, cranberries, avocados and olives. Named varieties and cultivar groups are explicitly identified: this is not a count of 125 unique botanical species. All original 100 fruit records are preserved. The subsequent [photograph audit](fruits-photo-audit.md) improves 36 photos across the expanded catalog and refreshes image resolution.

## Comparison rules

- **Example weight:** 65 sourced whole-fruit values in grams, including natural peel, shell and seeds unless stated otherwise. Each note identifies whether the number is a rounded survey result, an example within a reported range, or a particular cultivar/large specimen. These are examples for arithmetic, not fixed species averages or records. The remaining 60 weights are unknown, shown as “Not documented” and excluded from numerical rounds. Cards remain available for photo recognition, geography and the shared Top Trumps ratings.
- **Sweetness and tartness:** separate editorial game ratings from 1–10, based on ripe-fruit descriptions. They are not measured sugar content, Brix, acidity, health scores or objective tastiness. Breadfruit uses its mature cooking stage, plantain its ripe cooked stage, and olive its cured flavor; flavor varies by cultivar and ripeness.
- **Availability:** an editorial 1–5 band for finding fresh fruit beyond its home region: local/specialist harvest, mostly regional/seasonal, specialty markets, regional staple traded abroad, widely traded. An exact count of countries where fruit is available would imply an unsupported global inventory.
- **Geography:** the origin/heritage text retains broad or debated origins. Map pins represent a place within that region, not a verified birthplace or a complete distribution map.

The Fruits collection sorts by example weight from lightest to heaviest, with alphabetical ties and undocumented weights at the end.

The collection retains scientific name, flavor, texture, finding-it notes, measurement scope, references and the comparison guide. Weight arithmetic preserves the source examples to the gram; ratio questions compare equal total weight rather than suggesting one fruit physically fits inside another. Multiplication uses explicitly imagined baskets.

## Sources and images

`scripts/data/fruits.json` separates factual `sourceUrls` from `imageSourceUrl`. Weight references include Purdue's *Fruits of Warm Climates*, UF/IFAS extension monographs, the UK 2013 fruit/vegetable sampling report, the Thai Department of Agricultural Extension, UNCTAD, university cultivar trials, the National Fruit Collection, horticultural studies, plant patents, and fruit-specific reference pages. A source supporting a fruit's identity or flavor does not turn an editorial score into a measurement.

Every photo records the original Commons filename, page, creator, license, license URL and original download URL. All 125 are real fruit photographs under a Creative Commons attribution license, CC0 or public domain; local copies are resized JPEGs and credited as such. Existing category images are unchanged. The photos were checked using contact sheets, direct inspection of replacements, exact hashes and perceptual comparisons. The [125-photo inventory and Collection display audit](fruits-photo-audit.md) records the resulting replacements, dimensions and presentation changes.

## Maintenance and regression coverage

After changing photo files, run `node scripts/fingerprint-fruit-images.mjs` to refresh their versioned paths. Run `node scripts/generate-fruits-pack.mjs` and `npm run generate:offline-manifest` after editing the source. No network access is needed to regenerate.

`tests/e2e/fruits-content.spec.ts` covers the 125-card catalog, profile and image provenance, ascending full-collection order and ties, unknown-weight handling, difficulty sweeps, selected-topic isolation, rating compatibility, numerical accuracy, reachability, and tablet/mobile play and collection rendering. The existing generic round and landing tests also include dynamically loaded Fruits.

# Content audit — 5 September 2026

The catalog now contains 933 cards across 11 categories. This pass corrects misleading measurements and provenance, preserves existing card IDs, and expands the smallest category without adding modes, dependencies or screens.

| Category | Cards | Result |
| --- | ---: | --- |
| Peppers | 262 | Per-card factual references separate from image credits; uncertainty retained for grower estimates, broad culinary types and unpublished superhots. Existing 107 checked Scoville ranges remain pinned. |
| Buildings | 60 | Subject-specific factual references throughout; physical floor counts, construction status and height conventions corrected; unconfirmed project heights stay unknown; invented completion years and fame scores removed. |
| Sharks and prehistoric sea animals | 50 | Scientific identities/families corrected; unsupported speeds, inferred masses and one unsupported fossil length removed. Alias cards remain collectible without becoming ambiguous answer choices. |
| Space | 50 | Dated moon counts, corrected image identity, and consistent physical units for sorting/comparison. Missing measurements stay unknown. |
| Jets | 50 | Classified B-21 performance stays unknown; combat radius is not presented as full range; editorial ratings and maximum takeoff weight are labeled. |
| Countries & Flags | 200 | 197 area entries reconciled to UN Demographic Yearbook 2024 and three explicit exceptions; 101 area values corrected. Capital roles, disputed-status wording, population dates and geographic scope clarified. |
| Bridges & Tunnels | 62 | Card-level factual references, length/opening scope and geography notes. |
| Dinosaurs & Prehistoric Animals | 47 | Museum/research-based corrections, body length separated from wingspan, incompatible hip/head heights removed, masses in metric tonnes and editorial power labeled. |
| Hot Sauces | 75 | Eight unsupported SHU values removed; pepper-ingredient heat separated from finished-sauce heat; product composition and editorial flavor clarified. |
| Tallest Mountains | 46 | Geographic/first-ascent corrections and scope notes; duplicate elevation conversions no longer provide duplicate Top Trumps choices. |
| Tall Trees | 31 (was 19) | Twelve additional species, 15 real licensed photos including replacements, corrected photo identity and height basis, and consistent comparison arithmetic. |

## Preserving the core

All 921 existing IDs remain. Renamed tree/shark cards recognize legacy title-based unlocks. The same modes, interactions, optimized image delivery and offline pipeline remain. The only recommendation removed is Tall Trees Top Trumps: four conversions of one height do not offer meaningful stat choices. Existing access remains available.

Unknown numerical values are excluded from arithmetic/comparison, retained in Collection, and sorted after known values. Generic comparisons require matching measurement IDs, units and directions. Fact questions describe the recorded location, avoiding claims that a widely cultivated tree cannot grow elsewhere. Easy falls back to suitable medium subjects when available, while an explicitly advanced imported deck remains playable.

Geo Finder keeps familiar aircraft as Easy targets and uses other locations from the same selected category when those targets share a development origin. Country Fact rounds reject alternate claims that happen to equal the correct value, such as two countries having zero land neighbors. Capital prompts preserve multiple roles, disputed status and the absence of an official capital.

## Sources and limits

Every card now has factual references and an accuracy/scope note. This is a catalog-wide metadata review, with targeted primary-source factual verification; it is **not** a claim that every historical sentence or legacy photograph was independently re-verified. In particular:

- Some aircraft and mountain measurements retain documented secondary references or approximate published figures. The two home-height examples remain labeled educational estimates; property sources support story counts, not surveyed heights.
- Pepper cultivar heat varies. Previously accepted broad-type/grower estimates remain explicitly unofficial; a factual reference does not turn those estimates into laboratory results.
- Sauce manufacturer/retailer heat figures can be estimates. Ingredient SHU describes the pepper reference, not the bottled sauce’s measured heat.
- Six legacy dinosaur images still point to gallery-level provenance rather than an exact artist/file record.
- Country measurements follow their source’s territorial/water scope. Serbia’s UN area includes Kosovo, which has a separate card; these are not additive. Taiwan/Sudan retain labeled geography snapshots because the UN table does not supply the required separate values.
- Country populations retain dated World Bank estimates and explicitly described census/projection exceptions. They do not claim to be live population counts.

The internal quality score is a completeness heuristic, not a factual-confidence score.

The area snapshot is checked in at `scripts/data/country-area-stats.json`. Its primary table and exception references are preserved there. Source research and limits for the other modules are in [core-science-metadata-audit.md](core-science-metadata-audit.md), [buildings-source-audit.md](buildings-source-audit.md), [pack-metadata-audit.md](pack-metadata-audit.md) and [tall-trees-content-audit.md](tall-trees-content-audit.md).

## Validation

The release gate is `npm run verify`: schema, local image signatures/provenance, offline manifest, complete metadata checks, deterministic gameplay regressions, production build and desktop/mobile browser coverage. New checks cover per-card factual references, country source parity/capital semantics, mixed physical units, unknown values, difficulty fallbacks, new tree reachability and compatible pack comparisons. The tree photo contact sheets and replacement star image were visually inspected.

Final local result: `npm run verify` passed, including 98 logic tests, 57 desktop browser tests and 22 mobile browser tests (five intentional desktop skips). Content QA reported zero warnings and zero critical findings. A comparison with the previous commit also confirmed all 921 original IDs and all six legacy renamed-card unlock identities remain supported.

# Content-pack metadata audit — 5 September 2026

This review covers all 230 records in Dinosaur Lab (47), Tallest Mountains (46), Hot Sauces (75), and Bridges & Tunnels (62). These packs already have enough useful subjects; this pass improves their existing records without adding cards or replacing images. The other catalogs and the smaller-pack expansions are covered by the overall content audit.

## Corrections

| Pack | What changed | Why |
| --- | --- | --- |
| Dinosaurs | Removed the universal “Hip height” field; separated pterosaur wingspan from body length; made mass units explicitly metric tonnes; omitted unsupported masses; added measurement notes and individual sources. | The former height field mixed heads, hips, sails, and even marine-animal body depth. Wingspan is not nose-to-tail length. A source not reporting a mass does not justify inventing one. |
| Dinosaurs | Reconciled museum reference lengths and masses; corrected Archaeopteryx to about 0.9 kg; conservatively scoped Mosasaurus size; updated Megalodon to a clearly labeled upper reconstruction estimate; corrected diet-as-taxonomy entries and overconfident behavioral copy. | Fossil estimates vary by specimen, species, and reconstruction method. They must not appear to be exact living-animal measurements. |
| Mountains | Removed numeric “first ascent” entries for Fuji, Mauna Kea, and Kosciuszko; qualified Ngadi Chuli’s confirmed ascent; corrected Fuji’s Japanese Alps grouping; explained prominence and snow-summit uncertainty. | A legendary date or the first recorded European visit does not establish the first human ascent. Prominence and base-to-summit height are different measures. |
| Hot Sauces | Corrected Cholula from 3,600 to the maker’s 1,000–2,000 SHU range; used upper range endpoints consistently for Cholula and Tabasco; removed eight unsupported finished-product SHU numbers. | Scientific units should not be populated with editorial guesses. Unknown heat is not zero heat. |
| Hot Sauces | Preserved featured-pepper values under a separate `pepper-scoville` statistic; labeled their basis; changed “Pepper varieties” to “Listed pepper types”; noted the Thermageddon Apollo/Pepper Y labeling conflict. | An ingredient rating is not the heat of diluted oil or sauce. Proprietary blends and marketing names do not prove botanical cultivar counts. |
| Crossings | Kept the existing audited lengths, opening-date scope, representative map points, and state metadata; attached source records to every card; made both editorial ratings explicit. | The crossing source file already distinguishes approaches, replacement bridges, complete routes, and parallel bores. This provenance now survives the card adapter instead of existing only in an external table. |

The eight sauces retaining their cards and images but omitting unsupported SHU are Marie Sharp’s Belizean Heat, Nando’s Hot PERi-PERi, Akabanga, Lao Gan Ma, Fly By Jing, Lee Kum Kee Chiu Chow oil, S&B La-Yu, and Chile Crunch. They retain ingredients, flavor, identity, and geography metadata.

## Verification and source coverage

Every record was inspected for measurement meaning, categories, taxonomy, notes, sources, and basic internal consistency. Natural History Museum profiles were read for the true dinosaurs, with subject-specific museum or research references for the remaining prehistoric animals. Directory estimates were not accepted blindly: the NHM directory and size article disagree on Giganotosaurus mass, so the card explicitly uses the size article’s 7.2-tonne estimate. The Albertosaurus identity is cross-checked with the Royal Tyrrell Museum, whose subject is *A. sarcophagus*.

These are the main primary references behind the material corrections:

- [Natural History Museum dinosaur directory](https://www.nhm.ac.uk/discover/dino-directory.html), with individual subject URLs in each card.
- [AMNH pterosaur guide](https://www.amnh.org/explore/ology/paleontology/pterosaurs-the-card-game/meet-the-pterosaurs): wingspan estimates.
- [Archaeopteryx growth study](https://pmc.ncbi.nlm.nih.gov/articles/PMC2756958/): adult mass reconstruction near 0.9 kg.
- [NHM large-dinosaur review](https://www.nhm.ac.uk/discover/what-is-the-biggest-dinosaur.html): Giganotosaurus mass, rather than the conflicting directory figure.
- [Florida Museum Smilodon fatalis](https://www.floridamuseum.ufl.edu/florida-vertebrate-fossils/species/smilodon-fatalis/): species identity and a 160–280 kg mass range.
- [NHM mosasaur review](https://www.nhm.ac.uk/discover/what-is-a-mosasaur.html) and [megalodon review](https://www.nhm.ac.uk/discover/megalodon--the-truth-about-the-largest-shark-that-ever-lived.html): reconstruction uncertainty and differing size estimates.
- [Cholula’s official FAQ](https://www.cholula.com/en-us/faq): published 1,000–2,000 SHU range.
- [Thermageddon product page](https://heatonist.com/products/the-last-dab-thermageddon): conflicting Apollo description and Pepper Y ingredient list.
- [Chamonix valley’s 2023 survey report](https://www.cc-valleedechamonixmontblanc.fr/culture/10-rubriqueactu/actualites/1227-le-sommet-de-notre-territoire-le-mont-blanc-mesure-a-4805-59-metres-d-altitude.html): evidence that Mont Blanc’s snow summit is variable, not a permanent exact elevation.
- [NSW Kosciuszko management plan](https://www.environment.nsw.gov.au/sites/default/files/kosciuszko-national-park-plan-of-management-210174.pdf): Aboriginal use and European exploration history.
- [Golden Gate Bridge District](https://www.goldengate.org/bridge/history-research/statistics-data/design-construction-stats/), [Mackinac Bridge Authority](https://www.mackinacbridge.org/history/facts-figures/), and [National Park Service](https://www.nps.gov/neri/planyourvisit/nrgbridge.htm): stronger official crossing references added to the existing audited source table.

This is not a new independent laboratory or geological survey. Most mountain elevations/prominences retain individually linked secondary reference values with explicit uncertainty; every underlying survey was not re-read. The crossing source table’s existing full audit was retained rather than claimed as 62 newly re-opened primary pages. Manufacturer links identify sauce products and ingredients; they are not assertions that every published SHU is an independent laboratory result. Retained approximate sauce scores still carry their original estimate basis, and changed recipes may require future review.

Existing images are preserved. Six dinosaur images still have gallery-level DinosaurPictures.org provenance rather than exact original-file/artist links (Oviraptor, Baryonyx, Lambeosaurus, Acrocanthosaurus, Albertosaurus, Amargasaurus). This pass does not claim a fresh license or visual review for those files. Prehistoric life restorations are interpretations, and their appearance can lag current research; that uncertainty is now in the pack note.

## Gameplay and maintenance

Numeric rounds compare one primary measurement family. They do not rank a body length against a wingspan, finished-sauce heat against ingredient heat, or unknown heat against a pepper-entry count. All cards remain available to supported non-numeric modes. Top Trumps selects pairs with at least two shared statistics. Alternate elevation units remain in Collection but no longer become duplicate Top Trumps choices. Structured units prevent approximate-value notation from becoming an arithmetic unit.

The mountain generator now preserves existing landing metadata and image provenance and requires `--write-illustrations` before writing old placeholder SVGs. The crossing generator still uses `scripts/data/bridges-and-tunnels.json`; sources and editorial scope now regenerate with each card.

Focused regression coverage lives in `tests/e2e/pack-metadata.spec.ts`: source/scope coverage, factual correction invariants, unknown and ingredient sauce heat, and 60 seeds at each difficulty for each audited pack’s comparison builders. Pack validation is run separately for all four packs. Overall release verification remains the root task’s responsibility.

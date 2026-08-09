# Burrow Category Playbook

This is the end-to-end playbook for adding a category to Burrow. It covers research, card data, images, gameplay, the landing page, QA, and release. The goal is that a category is not considered finished merely because its records exist.

New categories should normally be JSON packs under `content/packs/`. The older TypeScript catalogs are core, topic-specific systems; do not add another core catalog unless the generic pack model genuinely cannot support the category.

## Definition of Done

A category is ready only when all of these are true:

- The scope is clear: what belongs, what does not, and what children should learn.
- The pack has at least 16 useful cards; larger flagship categories can target about 50.
- Facts, numbers, units, estimates, and editorial ratings are honest and sourced.
- Every image is local, credited, traceable to its exact source, semantically correct, and visually reviewed as a set.
- Shared stats and categories support the selected game modes.
- Difficulty, recognition, geography, rarity, and other metadata are used consistently where they are meaningful.
- The category appears automatically in topic selection, Collection, Challenge, and the landing page.
- Desktop and mobile play work across every recommended mode.
- `npm run check:category -- --pack <pack-id>` and `npm run verify` pass.

## 1. Frame the Category

Write down the category contract before collecting cards:

```text
Pack ID:
Player-facing title:
What belongs:
What does not belong:
Target age and reading level:
Target card count:
What the child should learn:
Primary comparison stats:
Useful subcategories:
Geography available for every card? yes/no
Rarity meaningful for this category? yes/no
Image standard:
Primary sources:
```

The boundary matters. A bottle of pepper oil belongs in Hot Sauces, but not in a catalog of pepper cultivars. Do not stretch a category merely to keep an interesting record.

## 2. Plan the Learning Model

Choose the repeated fields before researching individual cards. A healthy pack usually has:

- At least two numeric stat IDs reused across most cards.
- At least three meaningful categories for Odd One rounds.
- One clear primary stat for sorting.
- Concrete child-facing facts, not fragments or marketing copy.
- A mix of familiar and obscure cards for real difficulty progression.

Use consistent IDs and units. If every card has `height` in feet, do not alternate between `height`, `size`, feet, and meters without a clear conversion model.

Use `direction: "lower"` only when a lower value genuinely wins. The default is that higher wins.

### Mode requirements

Only list modes in `recommendedModes` when the data can support them honestly.

| Mode | Pack requirement |
| --- | --- |
| Quiz | Distinct cards, useful facts, and plausible answer choices |
| Head to Head | A shared stat with different values across many pairs |
| Top Trumps | At least two widely shared numeric stats with honest directions |
| Sort | A primary stat with enough meaningful variation |
| Fact | Complete, natural facts that teach something specific |
| Peek | Images whose partial view can still produce a fair visual clue |
| Numbers | Values and units that make sensible arithmetic stories |
| Odd One | Repeated category families plus genuine outliers |
| Geo Finder | Complete `metadata.location` on the cards used by the mode |

If a category needs a special comparison stat, subject noun, image treatment, or gameplay rule, prefer reusable pack metadata over another hard-coded pack ID. Add a focused regression for any behavior that cannot remain generic.

## 3. Research and Provenance

Keep a working source table while researching:

```text
card id | name | fact source | numeric source | image source | permission/license | uncertainty note
```

For every card:

- Preserve the exact product, institution, photographer, or reference URL.
- Distinguish measured values from ranges, estimates, featured-component values, and editorial ratings.
- Put material uncertainty in `metadata.accuracyNote` or the pack `dataNote`.
- Label Burrow-created ratings as editorial, not scientific.
- Do not silently convert a pepper rating into a finished-sauce rating, a claimed height into a measured height, or marketing language into fact.
- Use complete educational prose suitable for the stated audience.

Use `metadata.difficultyBand` and `recognition` to distribute familiar and obscure cards deliberately. Use `rarity` only when rarity has a real category meaning; do not manufacture it just because the field exists.

## 4. Acquire and Normalize Images

Images live under:

```text
public/burrow-assets/<pack-id>/
```

Every image needs:

- `imageAlt`
- `imageCredit`
- `imageSourceUrl`
- permission or a suitable license

Image QA is semantic as well as technical:

- The image must show the exact subject, not a related substitute.
- Product categories should use a consistent front-label or package view.
- Avoid collages, screenshots, watermarks, unreadable thumbnails, and accidental selected variants.
- Normalize framing, background, aspect ratio, and resolution across the pack.
- Use a contact sheet to inspect the entire category at once.
- Run the duplicate-image check and investigate near-duplicates rather than trusting filenames.
- Use `metadata.imageDistinctGroup` only when two cards intentionally share a visual family.

Gameplay never hotlinks category images. Remote URLs are provenance only; runtime images must be committed locally for speed, safety, and offline play.

## 5. Scaffold the Pack

Copy the template:

```bash
cp -R content/packs/_template content/packs/construction-trucks
mkdir -p public/burrow-assets/construction-trucks
```

The folder and pack IDs must match. Keep the pack in `draft` or `needs-review` while research is incomplete.

```json
{
  "id": "construction-trucks",
  "title": "Construction Trucks",
  "status": "draft"
}
```

Each card needs a stable slug, name, local image, provenance, a fact, reusable stats, and categories. Optional tags and metadata should improve gameplay or teaching, not merely fill fields.

## 6. Register the Landing Card

Every playable JSON pack carries its own landing metadata:

```json
{
  "landing": {
    "detail": "weight, reach & power",
    "image": "/burrow-assets/construction-trucks/excavator.jpg",
    "imageFit": "cover",
    "order": 120
  }
}
```

`title` is optional when the landing-page title should differ from the pack title. Use `contain` for label-first products or isolated objects and `cover` for full-frame photographs.

The landing page now derives JSON categories and its total count from playable packs. Do not edit `src/app/page.tsx` just to add a standard pack. Validation enforces that:

- A playable pack has landing metadata.
- The detail is short enough for the mobile card.
- The landing image is local and reuses a credited card image.
- A leading card count in the detail matches the real pack count.
- Every playable pack appears exactly once on the landing page.

## 7. Choose `recommendedModes`

Start with the generic modes the pack actually supports. Remove a mode when its questions would be misleading or repetitive.

Before marking the pack playable, manually sample each recommended mode at Easy, Medium, and Hard. Confirm:

- Head to Head compares the intended measure.
- Top Trumps offers useful choices rather than duplicate or meaningless stats.
- Sort uses the displayed value and handles ties honestly.
- Number stories use sensible units and nouns.
- Odd One states a visible, defensible relationship.
- Geo Finder has complete and accurate location data.
- Feedback teaches rather than merely announces correctness.

## 8. Review Integration Exceptions

Standard JSON packs automatically receive loading, topic selection, profile migration, adaptive tracking, collection cards, generic gameplay, Challenge campaigns, and landing-page registration.

Review these only when the generic behavior is insufficient:

- `src/components/burrow-game.tsx`: curated accent colors or pack-specific Head to Head selection.
- `src/lib/game-modes.ts`: category nouns or specialized question language.
- `src/lib/building-image-presentation.ts`: nonstandard gameplay image fit or position.
- `src/lib/card-metadata.ts`: new reusable metadata concepts.
- `content/packs/pack.schema.json` and `scripts/validate-packs.mjs`: any new pack contract.

If one of these changes, add generic or category-specific logic coverage so the exception cannot silently disappear.

## 9. Run the Category Preflight

During authoring, validate the pack alone:

```bash
npm run validate:packs -- --pack construction-trucks
```

Before visual QA, run the repeatable category preflight:

```bash
npm run check:category -- --pack construction-trucks
```

It runs the pack validator, local-image audit, content QA, lint, and logic/integration coverage. Fix errors and review every warning.

## 10. Perform Visual and Interaction QA

Run the app and inspect desktop plus a narrow mobile viewport:

```bash
npm run dev
```

Check:

- The landing card image, title, detail, ordering, and responsive fit.
- The category selector and default selection for a new/existing profile.
- A representative card at Easy, Medium, and Hard.
- Every recommended mode.
- Collection ordering, card counts, rarity filters when used, and source details.
- Image cropping in full cards, compact comparisons, Peek, and feedback.
- Next/skip transitions and browser errors.

## 11. Run the Release Gate

The final gate is:

```bash
npm run verify
```

This runs lint, pack validation, image checks, content QA, logic coverage, the production build, and desktop/mobile browser tests.

Before publishing:

- Review `git diff --check`.
- Inspect the complete diff and confirm there is no unrelated work.
- Stage only the coherent category update.
- Record the verification result and any expected skips.
- Push the intended commit and confirm local `main` matches `origin/main` when a direct-main release is requested.

## Copy-Paste Launch Checklist

```text
[ ] Scope and exclusions written down
[ ] Target age, learning goals, and card count defined
[ ] Shared stats, units, categories, and modes planned
[ ] Sources and uncertainty captured per card
[ ] Facts receive a full child-facing language pass
[ ] Images are exact, permitted, credited, local, and normalized
[ ] Whole-pack contact sheet reviewed
[ ] Difficulty and recognition distribution reviewed
[ ] Rarity used only if meaningful
[ ] Geography complete if Geo Finder is recommended
[ ] landing metadata added with credited image and mobile-length detail
[ ] status changed to playable only after content review
[ ] npm run check:category -- --pack <pack-id> passes
[ ] Desktop and mobile visual QA completed
[ ] Every recommended mode sampled at Easy, Medium, and Hard
[ ] Collection and profile migration checked
[ ] npm run verify passes
[ ] Diff reviewed and only coherent files staged
[ ] Published commit and branch state verified
```

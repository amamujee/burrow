# Making a Burrow Pack

Burrow is still a local-first repo, not a multi-user pack builder. For now, the easiest way for another parent to make a pack is to author a pack folder in the repo, validate it, and open a pull request or keep it in their own fork.

This document is the contributor path for that.

## What Makes a Good Pack

A pack should turn a kid obsession into repeatable reading and math games. The app needs more than names. Each card needs a picture, a short fact, categories, and numeric stats that can be compared.

Good packs usually have:

- 16 or more cards
- 2 or more numeric stats reused across most cards
- 3 or more categories
- short, concrete facts a kid can read
- local images with clear credit and source URLs
- parent-reviewed content and image rights

Examples of good pack ideas:

- Construction trucks
- Dinosaurs
- Bugs
- Trains
- Rescue vehicles
- Famous bridges
- Backyard birds
- Soccer positions or players, if image rights are clear

## Folder Layout

Copy the template folder:

```bash
cp -R content/packs/_template content/packs/construction-trucks
```

Then update:

```text
content/packs/construction-trucks/pack.json
public/burrow-assets/construction-trucks/excavator.jpg
public/burrow-assets/construction-trucks/bulldozer.jpg
public/burrow-assets/construction-trucks/crane.jpg
```

The pack `id` must match the folder name. For example:

```json
{
  "id": "construction-trucks",
  "title": "Construction Trucks"
}
```

## Card Format

Each card should follow this shape:

```json
{
  "id": "excavator",
  "name": "Excavator",
  "image": "/burrow-assets/construction-trucks/excavator.jpg",
  "imageAlt": "Excavator",
  "imageCredit": "Photographer or source name",
  "imageSourceUrl": "https://example.com/source-image",
  "fact": "Excavators use a boom, stick, and bucket to dig deep holes and move heavy dirt.",
  "stats": [
    {
      "id": "weight",
      "label": "Weight",
      "value": 45000,
      "unit": "lb",
      "direction": "higher"
    },
    {
      "id": "speed",
      "label": "Speed",
      "value": 3,
      "unit": "mph",
      "direction": "higher"
    }
  ],
  "categories": ["digger", "construction"]
}
```

Use the same stat IDs across cards whenever possible. If every vehicle has `weight` and `speed`, Burrow can build comparison, sorting, number, and Top Trumps rounds from the pack later.

## Image Rules

Images should be local files under `public/burrow-assets/<pack-id>/`.

Do not point gameplay cards directly at remote image URLs. Local images make Burrow faster, safer, and usable offline. Every image still needs:

- `imageCredit`
- `imageSourceUrl`
- permission or a license that makes sense for repo use

Parent-uploaded or personal images are fine for a private fork, but public pull requests should avoid private photos and unclear copyrighted images.

## Validate a Pack

Run:

```bash
npm run validate:packs
```

Or check one pack:

```bash
npm run validate:packs -- --pack construction-trucks
```

The validator checks:

- required pack and card fields
- lowercase slug IDs
- duplicate card IDs
- local images exist and look like images
- source URLs and image credits exist
- enough cards for playable variety
- enough reused stats and categories for the game modes

Warnings are suggestions. Errors should be fixed before a pack is considered ready.

## Current App Integration

This pack format is the authoring path for new contributors. The live app still has topic-specific TypeScript data in `src/lib/game-data.ts`, `src/lib/questions.ts`, and `src/lib/game-modes.ts`.

For now, a new pack is considered ready when:

1. `content/packs/<pack-id>/pack.json` validates.
2. Its images are committed under `public/burrow-assets/<pack-id>/`.
3. A maintainer can adapt it into the current TypeScript topic data or use it as input for the upcoming generic pack runtime.

The future v2 product should make this same flow available inside Burrow with accounts, private packs, parent review, and sharing. This repo format is deliberately close to that future data model.

## Contributor Checklist

- Pick a topic a kid actually cares about.
- Add at least 16 cards.
- Reuse at least 2 stat IDs across most cards.
- Use local images with credits and source URLs.
- Keep facts short, specific, and verifiable.
- Run `npm run validate:packs`.
- Run `npm run verify` before a public pull request.

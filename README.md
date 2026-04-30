# Burrow

Let your Kid go deep.

Burrow is a local-first learning game for short, visual quiz sessions.

## Development

```bash
npm run dev
npm run lint
npm run build
npm run check:images
```

## Content Packs

Topic records live in `src/lib/game-data.ts`. Each card keeps structured stats plus image provenance:

- `contentImage(topic, id, sourceFile)` points gameplay at `/public/burrow-assets/...`.
- `imageCredit` credits the curated source.
- `imageSourceFile` and `imageSourceUrl` preserve where the local asset came from.

The app should not load topic images from the internet during play. To add a topic or card:

1. Add the structured record and `contentImage(...)` source metadata.
2. Run `npm run sync:assets` during development to cache images locally.
3. Run `npm run check:images`; it fails on missing local assets or remote runtime image URLs.

Use `npm run sync:assets -- --only=sharks/great-white --force` to refresh one asset.

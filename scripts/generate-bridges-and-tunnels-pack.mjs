import fs from "node:fs";

// Audited source data and photo provenance live together. Regeneration is local
// and preserves the existing photographed cards, landing metadata and rarity.
const source = JSON.parse(fs.readFileSync("scripts/data/bridges-and-tunnels.json", "utf8"));
const packFile = "content/packs/bridges-and-tunnels/pack.json";
const existing = JSON.parse(fs.readFileSync(packFile, "utf8"));
const existingCards = new Map(existing.cards.map((card) => [card.id, card]));
const unique = (values) => [...new Set(values)];

const pack = {
  ...existing,
  summary: "Virginia bridge-tunnels, notable crossings across the United States, world-famous bridges, and long tunnels become geography, length, and engineering challenges.",
  dataNote: "Lengths are rounded miles for the named bridge, tunnel or crossing. Card notes identify approaches, branches and parallel bores. Opening years identify the first opening of the described structure; replacement and later-span dates are noted. Fame and Engineering are Burrow gameplay ratings, not official measurements.",
  sources: source.cards.flatMap((card) => card.sourceUrls.map((url, index) => ({
    label: `${card.name}${index ? " — additional reference" : ""}`,
    url,
    note: `Source record dated ${source.auditedOn}. ${card.lengthNote} ${card.openedNote}`,
  }))),
  cards: source.cards.map((card) => {
    const previous = existingCards.get(card.id);
    const kinds = card.kind === "bridge-tunnel" ? ["bridge", "tunnel", "bridge-tunnel"] : [card.kind];
    return {
      id: card.id,
      name: card.name,
      image: card.image,
      imageAlt: `${card.name} photo`,
      imageCredit: card.imageCredit,
      imageSourceUrl: card.imageSourceUrl,
      fact: card.fact,
      stats: [
        { id: "length-mi", label: "Length", value: card.lengthMi, unit: "mi", direction: "higher", note: card.lengthNote },
        { id: "opened-year", label: "Opened", value: card.opened, unit: "year", direction: "lower", note: card.openedNote },
        { id: "recognition", label: "Fame rating", value: card.recognition, unit: "/10", direction: "higher", note: "Burrow editorial recognition rating, not an official measurement." },
        { id: "engineering-scale", label: "Engineering rating", value: card.scale, unit: "/10", direction: "higher", note: "Burrow editorial game rating for the scale of the project, not a safety or structural-performance measure." },
      ],
      categories: unique([...kinds, card.structure, ...card.categories]),
      tags: unique([...kinds, card.structure, ...card.categories]),
      metadata: {
        ...previous?.metadata,
        difficultyBand: card.recognition >= 7 ? "easy" : card.scale >= 9 ? "medium" : "hard",
        recognition: Math.max(1, Math.min(5, Math.round(card.recognition / 2))),
        taxonomyGroup: card.structure,
        accuracyNote: `${card.lengthNote} ${card.openedNote}`,
        location: card.location,
        sources: card.sourceUrls.map((url, index) => ({
          label: `${card.name}${index ? " additional reference" : " reference"}`,
          url,
          note: `${card.lengthNote} ${card.openedNote}`,
        })),
      },
      readingPrompts: [
        `What clue tells you ${card.name} is a ${card.kind}?`,
        `How does ${card.name}'s length compare with another card?`,
      ],
    };
  }),
};

fs.writeFileSync(packFile, JSON.stringify(pack, null, 2) + "\n");
console.log(`Wrote ${pack.cards.length} audited bridge and tunnel cards.`);

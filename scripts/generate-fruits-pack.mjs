import fs from "node:fs";

const source = JSON.parse(fs.readFileSync("scripts/data/fruits.json", "utf8"));
const weightLabel = "Example weight";
const format = (value) => value.toLocaleString("en-US");
const missingWeight = "No whole-fruit weight verified in the cited references. Omitted from weight comparisons and arithmetic; not treated as zero.";
const ratingNote = "Burrow game rating, not a laboratory measurement. Flavor varies with variety and ripeness; higher does not mean tastier.";

const fruitCount = source.cards.length;
if (!fruitCount || new Set(source.cards.map((card) => card.id)).size !== fruitCount) {
  throw new Error("Fruits must contain distinct cards with unique IDs.");
}

const pack = {
  $schema: "../pack.schema.json",
  id: "fruits",
  title: "Fruits",
  summary: `Discover ${fruitCount} fruits, from familiar favorites to rare regional treasures, through weight, flavor, growing regions and surprising facts.`,
  dataNote: Object.values(source.methodology).join(" "),
  primaryStat: { id: "weight-g", label: weightLabel },
  status: "playable",
  audience: { minAge: 6, maxAge: 11, readingLevel: "short fruit facts with scientific names in the field notes" },
  recommendedModes: ["trumps", "sort", "fact", "peek", "number", "odd", "geo"],
  landing: { detail: `${fruitCount} fruits, from sweet to surprising`, image: (source.cards.find((card) => card.id === "mangosteen") ?? source.cards[0]).image, imageFit: "cover", order: 120 },
  sources: source.cards.flatMap((card) => card.sourceUrls.map((url, index) => ({
    label: `${card.name}${index ? " — weight reference" : " — fruit reference"}`,
    url,
    note: `Reviewed ${source.reviewedOn}. ${index ? card.weight?.note : "Identity, origin, appearance and flavor; scores are editorial interpretations, not measured sweetness or availability."}`,
  }))),
  cards: source.cards.map((card) => {
    for (const key of ["sweetness", "tartness", "availability"]) {
      if (!Number.isInteger(card[key]) || card[key] < 1 || card[key] > (key === "availability" ? 5 : 10)) {
        throw new Error(`${card.id}: invalid ${key} rating`);
      }
    }
    if (card.weight && (!(card.weight.grams > 0) || !card.weight.note || !card.sourceUrls.includes(card.weight.sourceUrl))) {
      throw new Error(`${card.id}: weight needs a positive value and its own reference and scope`);
    }
    const weightNote = card.weight?.note ?? missingWeight;
    return {
      id: card.id,
      name: card.name,
      image: card.image,
      imageAlt: card.imageAlt,
      imageCredit: `${card.imageCreator} / Wikimedia Commons / ${card.imageLicense} (${card.imageLicenseUrl}). Resized as JPEG. Original: ${card.sourceFile}`,
      imageSourceUrl: card.imageSourceUrl,
      fact: card.fact,
      stats: [
        ...(card.weight ? [{ id: "weight-g", label: weightLabel, value: card.weight.grams, unit: "g", display: `~${format(card.weight.grams)} g`, direction: "higher", note: weightNote }] : []),
        { id: "sweetness-rating", label: "Sweetness rating", value: card.sweetness, unit: "/10", display: `${card.sweetness}/10`, direction: "higher" },
        { id: "tartness-rating", label: "Tartness rating", value: card.tartness, unit: "/10", display: `${card.tartness}/10`, direction: "higher" },
        { id: "availability-rating", label: "Availability rating", value: card.availability, unit: "/5", display: `${card.availability}/5`, direction: "higher" },
      ],
      details: [
        { label: "Scientific name", value: card.scientificName },
        { label: "Origin / heritage", value: card.origin },
        { label: "Flavor", value: card.flavor },
        { label: "Texture", value: card.texture },
        { label: "Finding it", value: card.availabilityBand },
        ...(!card.weight ? [{ label: "Weight note", value: missingWeight }] : []),
        { label: "Comparison guide", value: "Weights are examples of whole fruits, not fixed species averages. Sweetness and tartness are game ratings, not sugar content or tastiness scores. Availability uses broad bands, not country counts." },
        { label: "Map note", value: source.methodology.geography },
      ],
      categories: [card.group, card.location.continents[0]],
      tags: [card.group, card.location.continents[0].toLowerCase().replaceAll(" ", "-")],
      metadata: {
        difficultyBand: card.difficultyBand,
        recognition: card.difficultyBand === "easy" ? 5 : card.difficultyBand === "medium" ? 3 : 1,
        rarity: card.availability >= 4 ? "common" : card.availability === 3 ? "uncommon" : card.availability === 2 ? "rare" : "epic",
        taxonomyGroup: card.group,
        accuracyNote: `${weightNote} ${ratingNote} Availability is an editorial band, not a country count. Origins can be uncertain; the map marks one representative place within the listed region.`,
        location: card.location,
        sources: card.sourceUrls.map((url) => ({
          label: `${card.name}${url === card.weight?.sourceUrl ? " — weight and fruit reference" : " — fruit reference"}`,
          url,
          note: url === card.weight?.sourceUrl ? weightNote : "Identity, origin, appearance and flavor. Ratings are Burrow's editorial interpretations.",
        })),
      },
      readingPrompts: [
        `Which clue would help you recognize ${card.name}?`,
        "How can a fruit be both sweet and tart?",
      ],
    };
  }),
};

fs.mkdirSync("content/packs/fruits", { recursive: true });
fs.writeFileSync("content/packs/fruits/pack.json", `${JSON.stringify(pack, null, 2)}\n`);
console.log(`Wrote ${pack.cards.length} fruit cards (${source.cards.filter((card) => card.weight).length} documented whole-fruit weights).`);

import fs from "node:fs";
import path from "node:path";

const packId = "tallest-mountains";
const packDir = path.join("content", "packs", packId);
const assetDir = path.join("public", "burrow-assets", packId);

const metersToFeet = (meters) => Math.round(meters * 3.28084);

const cards = [
  ["mount-everest", "Mount Everest", "Himalaya", "Nepal/China", 8849, 8849, 1953, 10, "Mount Everest is the highest mountain above sea level and is known in Nepal as Sagarmatha and in Tibet as Chomolungma.", "https://en.wikipedia.org/wiki/Mount_Everest", ["top-15", "eight-thousander", "himalaya", "record-holder"]],
  ["k2", "K2", "Karakoram", "Pakistan/China", 8611, 4020, 1954, 10, "K2 is the second-highest mountain on Earth and is famous for steep routes and severe Karakoram weather.", "https://en.wikipedia.org/wiki/K2", ["top-15", "eight-thousander", "karakoram", "famous-climb"]],
  ["kangchenjunga", "Kangchenjunga", "Himalaya", "Nepal/India", 8586, 3922, 1955, 9, "Kangchenjunga is the world's third-highest mountain and rises on the border of Nepal and India.", "https://en.wikipedia.org/wiki/Kangchenjunga", ["top-15", "eight-thousander", "himalaya", "border-peak"]],
  ["lhotse", "Lhotse", "Himalaya", "Nepal/China", 8516, 610, 1956, 8, "Lhotse sits next to Everest and has one of the most dramatic south faces in the Himalaya.", "https://en.wikipedia.org/wiki/Lhotse", ["top-15", "eight-thousander", "himalaya", "everest-region"]],
  ["makalu", "Makalu", "Himalaya", "Nepal/China", 8485, 2378, 1955, 8, "Makalu is a sharply pyramid-shaped Himalayan giant east of Everest.", "https://en.wikipedia.org/wiki/Makalu", ["top-15", "eight-thousander", "himalaya", "pyramid-peak"]],
  ["cho-oyu", "Cho Oyu", "Himalaya", "China/Nepal", 8188, 2340, 1954, 8, "Cho Oyu is often called one of the more approachable eight-thousanders, though it is still extremely high.", "https://en.wikipedia.org/wiki/Cho_Oyu", ["top-15", "eight-thousander", "himalaya", "everest-region"]],
  ["dhaulagiri-i", "Dhaulagiri I", "Himalaya", "Nepal", 8167, 3357, 1960, 8, "Dhaulagiri I towers over central Nepal and was once thought to be the world's highest mountain.", "https://en.wikipedia.org/wiki/Dhaulagiri", ["top-15", "eight-thousander", "himalaya", "nepal"]],
  ["manaslu", "Manaslu", "Himalaya", "Nepal", 8163, 3092, 1956, 8, "Manaslu means Mountain of the Spirit and is the eighth-highest mountain in the world.", "https://en.wikipedia.org/wiki/Manaslu", ["top-15", "eight-thousander", "himalaya", "nepal"]],
  ["nanga-parbat", "Nanga Parbat", "Himalaya", "Pakistan", 8126, 4608, 1953, 9, "Nanga Parbat has enormous relief from nearby valleys and is sometimes called a contender for tallest land rise.", "https://en.wikipedia.org/wiki/Nanga_Parbat", ["top-15", "eight-thousander", "himalaya", "famous-climb"]],
  ["annapurna-i", "Annapurna I", "Himalaya", "Nepal", 8091, 2984, 1950, 9, "Annapurna I was the first eight-thousander climbed, reached by a French expedition in 1950.", "https://en.wikipedia.org/wiki/Annapurna", ["top-15", "eight-thousander", "himalaya", "historic-ascent"]],
  ["gasherbrum-i", "Gasherbrum I", "Karakoram", "Pakistan/China", 8080, 2155, 1958, 7, "Gasherbrum I is also called Hidden Peak because it sits deep inside the Karakoram.", "https://en.wikipedia.org/wiki/Gasherbrum_I", ["top-15", "eight-thousander", "karakoram", "hidden-peak"]],
  ["broad-peak", "Broad Peak", "Karakoram", "Pakistan/China", 8051, 1701, 1957, 7, "Broad Peak gets its name from its wide summit ridge near K2.", "https://en.wikipedia.org/wiki/Broad_Peak", ["top-15", "eight-thousander", "karakoram", "k2-region"]],
  ["gasherbrum-ii", "Gasherbrum II", "Karakoram", "Pakistan/China", 8035, 1524, 1956, 7, "Gasherbrum II is another Karakoram eight-thousander in the Baltoro region.", "https://en.wikipedia.org/wiki/Gasherbrum_II", ["top-15", "eight-thousander", "karakoram", "baltoro"]],
  ["shishapangma", "Shishapangma", "Himalaya", "China", 8027, 2897, 1964, 7, "Shishapangma is the only eight-thousander located entirely in Tibet.", "https://en.wikipedia.org/wiki/Shishapangma", ["top-15", "eight-thousander", "himalaya", "tibet"]],
  ["gyachung-kang", "Gyachung Kang", "Himalaya", "Nepal/China", 7952, 672, 1964, 6, "Gyachung Kang is the highest peak below 8,000 meters and sits between Everest and Cho Oyu.", "https://en.wikipedia.org/wiki/Gyachung_Kang", ["top-15", "himalaya", "everest-region", "near-eight-thousander"]],
  ["annapurna-ii", "Annapurna II", "Himalaya", "Nepal", 7937, 2437, 1960, 6, "Annapurna II is a major peak on the eastern side of Nepal's Annapurna massif.", "https://en.wikipedia.org/wiki/Annapurna_II", ["top-30", "himalaya", "nepal", "annapurna"]],
  ["gasherbrum-iv", "Gasherbrum IV", "Karakoram", "Pakistan", 7932, 712, 1958, 6, "Gasherbrum IV is famous among climbers for its beautiful shape and difficult ridges.", "https://en.wikipedia.org/wiki/Gasherbrum_IV", ["top-30", "karakoram", "baltoro", "famous-climb"]],
  ["himalchuli", "Himalchuli", "Himalaya", "Nepal", 7893, 1633, 1960, 5, "Himalchuli is a high peak in the Manaslu Himal of Nepal.", "https://en.wikipedia.org/wiki/Himalchuli", ["top-30", "himalaya", "nepal", "manaslu-region"]],
  ["distaghil-sar", "Distaghil Sar", "Karakoram", "Pakistan", 7884, 2525, 1960, 5, "Distaghil Sar is the highest mountain in the Hispar Muztagh of the Karakoram.", "https://en.wikipedia.org/wiki/Distaghil_Sar", ["top-30", "karakoram", "pakistan", "high-prominence"]],
  ["ngadi-chuli", "Ngadi Chuli", "Himalaya", "Nepal", 7871, 1011, 1979, 4, "Ngadi Chuli is a high Manaslu-area peak with a remote, complex climbing history.", "https://en.wikipedia.org/wiki/Ngadi_Chuli", ["top-30", "himalaya", "nepal", "manaslu-region"]],
  ["khunyang-chhish", "Khunyang Chhish", "Karakoram", "Pakistan", 7823, 1765, 1971, 5, "Khunyang Chhish rises in Pakistan's Hispar region and is one of the highest Karakoram peaks.", "https://en.wikipedia.org/wiki/Khunyang_Chhish", ["top-30", "karakoram", "pakistan", "hispar"]],
  ["masherbrum", "Masherbrum", "Karakoram", "Pakistan", 7821, 2457, 1960, 6, "Masherbrum is also known as K1 and stands above the Baltoro Glacier region.", "https://en.wikipedia.org/wiki/Masherbrum", ["top-30", "karakoram", "pakistan", "baltoro"]],
  ["nanda-devi", "Nanda Devi", "Himalaya", "India", 7817, 3139, 1936, 8, "Nanda Devi is one of India's most sacred and famous Himalayan mountains.", "https://en.wikipedia.org/wiki/Nanda_Devi", ["top-30", "himalaya", "india", "sacred-mountain"]],
  ["chomo-lonzo", "Chomo Lonzo", "Himalaya", "China", 7804, 590, 1954, 4, "Chomo Lonzo is a high Tibetan peak close to Makalu.", "https://en.wikipedia.org/wiki/Chomo_Lonzo", ["top-30", "himalaya", "tibet", "makalu-region"]],
  ["batura-sar", "Batura Sar", "Karakoram", "Pakistan", 7795, 3118, 1976, 5, "Batura Sar is the highest peak of the Batura Muztagh in the western Karakoram.", "https://en.wikipedia.org/wiki/Batura_Sar", ["top-30", "karakoram", "pakistan", "batura"]],
  ["rakaposhi", "Rakaposhi", "Karakoram", "Pakistan", 7788, 2818, 1958, 7, "Rakaposhi is famous for rising dramatically above the Hunza Valley.", "https://en.wikipedia.org/wiki/Rakaposhi", ["top-30", "karakoram", "pakistan", "famous-view"]],
  ["namcha-barwa", "Namcha Barwa", "Himalaya", "China", 7782, 4106, 1992, 6, "Namcha Barwa stands near the great bend of the Yarlung Tsangpo River in eastern Tibet.", "https://en.wikipedia.org/wiki/Namcha_Barwa", ["top-30", "himalaya", "tibet", "high-prominence"]],
  ["kanjut-sar", "Kanjut Sar", "Karakoram", "Pakistan", 7760, 1660, 1959, 4, "Kanjut Sar is a high peak in the Hispar Muztagh of the Karakoram.", "https://en.wikipedia.org/wiki/Kanjut_Sar", ["top-30", "karakoram", "pakistan", "hispar"]],
  ["kamet", "Kamet", "Himalaya", "India", 7756, 2825, 1931, 6, "Kamet was one of the earliest very high Himalayan peaks to be climbed.", "https://en.wikipedia.org/wiki/Kamet", ["top-30", "himalaya", "india", "historic-ascent"]],
  ["dhaulagiri-ii", "Dhaulagiri II", "Himalaya", "Nepal", 7751, 2397, 1971, 4, "Dhaulagiri II is part of the Dhaulagiri massif in Nepal.", "https://en.wikipedia.org/wiki/Dhaulagiri_II", ["top-30", "himalaya", "nepal", "dhaulagiri"]],
  ["aconcagua", "Aconcagua", "Andes", "Argentina", 6962, 6962, 1897, 10, "Aconcagua is the highest mountain outside Asia and the tallest peak in the Americas.", "https://en.wikipedia.org/wiki/Aconcagua", ["seven-summits", "andes", "record-holder", "famous-climb"]],
  ["denali", "Denali", "Alaska Range", "United States", 6190, 6138, 1913, 10, "Denali is North America's highest mountain and rises powerfully from the Alaska Range.", "https://en.wikipedia.org/wiki/Denali", ["seven-summits", "north-america", "high-prominence", "famous-climb"]],
  ["mount-kilimanjaro", "Mount Kilimanjaro", "Eastern Rift", "Tanzania", 5895, 5885, 1889, 10, "Mount Kilimanjaro is Africa's highest mountain and a huge freestanding volcano.", "https://en.wikipedia.org/wiki/Mount_Kilimanjaro", ["seven-summits", "volcano", "africa", "freestanding"]],
  ["mount-elbrus", "Mount Elbrus", "Caucasus", "Russia", 5642, 4741, 1874, 9, "Mount Elbrus is a dormant volcano and is often counted as Europe's highest mountain.", "https://en.wikipedia.org/wiki/Mount_Elbrus", ["seven-summits", "volcano", "europe", "caucasus"]],
  ["mount-vinson", "Mount Vinson", "Sentinel Range", "Antarctica", 4892, 4892, 1966, 8, "Mount Vinson is Antarctica's highest mountain and one of the Seven Summits.", "https://en.wikipedia.org/wiki/Vinson_Massif", ["seven-summits", "antarctica", "polar", "remote"]],
  ["puncak-jaya", "Puncak Jaya", "Sudirman Range", "Indonesia", 4884, 4884, 1962, 8, "Puncak Jaya is the highest island peak in the world and one version of Oceania's Seven Summit.", "https://en.wikipedia.org/wiki/Puncak_Jaya", ["seven-summits", "oceania", "island-peak", "limestone"]],
  ["mont-blanc", "Mont Blanc", "Alps", "France/Italy", 4807, 4696, 1786, 10, "Mont Blanc is the highest mountain in the Alps and a classic symbol of European mountaineering.", "https://en.wikipedia.org/wiki/Mont_Blanc", ["alps", "europe", "famous-climb", "snow-peak"]],
  ["matterhorn", "Matterhorn", "Alps", "Switzerland/Italy", 4478, 1042, 1865, 10, "The Matterhorn's sharp pyramid shape makes it one of the most recognizable mountains in the world.", "https://en.wikipedia.org/wiki/Matterhorn", ["alps", "famous-shape", "famous-climb", "europe"]],
  ["mount-whitney", "Mount Whitney", "Sierra Nevada", "United States", 4421, 3071, 1873, 9, "Mount Whitney is the highest summit in the contiguous United States.", "https://en.wikipedia.org/wiki/Mount_Whitney", ["north-america", "united-states", "record-holder", "sierra-nevada"]],
  ["mauna-kea", "Mauna Kea", "Hawaii", "United States", 4207, 4207, 1823, 10, "Mauna Kea is modest above sea level, but from the Pacific seafloor it rises higher than Everest.", "https://en.wikipedia.org/wiki/Mauna_Kea", ["volcano", "island-peak", "special-measure", "hawaii"]],
  ["mount-fuji", "Mount Fuji", "Japanese Alps", "Japan", 3776, 3776, 663, 10, "Mount Fuji is Japan's highest mountain and one of the world's most famous volcano silhouettes.", "https://en.wikipedia.org/wiki/Mount_Fuji", ["volcano", "asia", "famous-shape", "sacred-mountain"]],
  ["aoraki-mount-cook", "Aoraki / Mount Cook", "Southern Alps", "New Zealand", 3724, 3724, 1894, 8, "Aoraki / Mount Cook is New Zealand's highest mountain and a centerpiece of the Southern Alps.", "https://en.wikipedia.org/wiki/Aoraki_/_Mount_Cook", ["oceania", "southern-alps", "record-holder", "famous-climb"]],
  ["mount-rainier", "Mount Rainier", "Cascade Range", "United States", 4392, 4027, 1870, 9, "Mount Rainier is a heavily glaciated volcano that dominates the skyline near Seattle and Tacoma.", "https://en.wikipedia.org/wiki/Mount_Rainier", ["volcano", "north-america", "cascade-range", "famous-view"]],
  ["chimborazo", "Chimborazo", "Andes", "Ecuador", 6263, 4118, 1880, 8, "Chimborazo's summit is often described as the farthest point from Earth's center because of the equatorial bulge.", "https://en.wikipedia.org/wiki/Chimborazo", ["andes", "volcano", "special-measure", "ecuador"]],
  ["mount-kenya", "Mount Kenya", "Eastern Rift", "Kenya", 5199, 3825, 1899, 8, "Mount Kenya is Africa's second-highest mountain and an eroded volcanic massif.", "https://en.wikipedia.org/wiki/Mount_Kenya", ["africa", "volcano", "famous-climb", "east-africa"]],
  ["mount-kosciuszko", "Mount Kosciuszko", "Snowy Mountains", "Australia", 2228, 2228, 1840, 8, "Mount Kosciuszko is Australia's highest mainland mountain and one version of the Seven Summits.", "https://en.wikipedia.org/wiki/Mount_Kosciuszko", ["seven-summits", "australia", "record-holder", "easy-hike"]],
];

const metadataRecognitionFor = (recognition) => Math.max(1, Math.min(5, Math.round(recognition / 2)));
const difficultyFor = (recognition, elevationM) => recognition >= 7 ? "easy" : elevationM >= 7800 ? "medium" : "hard";
const continentByCountry = {
  Antarctica: "Antarctica",
  Argentina: "South America",
  Australia: "Oceania",
  China: "Asia",
  Ecuador: "South America",
  France: "Europe",
  India: "Asia",
  Indonesia: "Oceania",
  Italy: "Europe",
  Japan: "Asia",
  Kenya: "Africa",
  Nepal: "Asia",
  "New Zealand": "Oceania",
  Pakistan: "Asia",
  Russia: "Europe",
  Switzerland: "Europe",
  Tanzania: "Africa",
  "United States": "North America",
};

const worldLocationFor = (label) => {
  const countries = label.split("/").map((country) => country.trim());
  const continents = Array.from(new Set(countries.flatMap((country) => continentByCountry[country] ? [continentByCountry[country]] : [])));
  return {
    label,
    countries,
    continents,
  };
};

const existingPackFile = path.join(packDir, "pack.json");
const existingCardsById = fs.existsSync(existingPackFile)
  ? new Map(JSON.parse(fs.readFileSync(existingPackFile, "utf8")).cards.map((card) => [card.id, card]))
  : new Map();

const cardObject = ([id, name, range, location, elevationM, prominenceM, firstAscent, recognition, fact, sourceUrl, categories]) => {
  const existingCard = existingCardsById.get(id);
  return {
    id,
    name,
    image: `/burrow-assets/${packId}/${id}.jpg`,
    imageAlt: `${name} photo`,
    imageCredit: existingCard?.imageCredit ?? "Wikimedia Commons",
    imageSourceUrl: existingCard?.imageSourceUrl ?? sourceUrl,
    fact,
    stats: [
      { id: "elevation-ft", label: "Elevation", value: metersToFeet(elevationM), unit: "ft", direction: "higher" },
      { id: "elevation-m", label: "Elevation", value: elevationM, unit: "m", direction: "higher" },
      { id: "prominence-m", label: "Prominence", value: prominenceM, unit: "m", direction: "higher" },
      { id: "first-ascent-year", label: "First ascent", value: firstAscent, unit: "year", direction: "lower" },
      { id: "fame", label: "Fame", value: recognition, unit: "/10", direction: "higher" },
    ],
    categories: [range, location, ...categories],
    tags: Array.from(new Set([
      range.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      location.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      categories[0].replace(/[^a-z0-9]+/g, "-"),
    ])),
    metadata: {
      difficultyBand: difficultyFor(recognition, elevationM),
      recognition: metadataRecognitionFor(recognition),
      taxonomyGroup: range,
      location: worldLocationFor(location),
    },
    readingPrompts: [`What makes ${name} special?`, `How does ${name}'s elevation compare with another mountain?`],
  };
};

const hashValue = (value) => [...value].reduce((total, char) => total + char.charCodeAt(0), 0);

const svgFor = ([, name, range, location, elevationM, , , , , , categories]) => {
  const title = name.replaceAll("&", "&amp;");
  const seed = hashValue(name);
  const isVolcano = categories.includes("volcano");
  const isSharp = categories.includes("famous-shape") || ["K2", "Nanga Parbat", "Gasherbrum IV", "Rakaposhi", "Matterhorn"].includes(name);
  const isPolar = categories.includes("antarctica") || categories.includes("polar");
  const high = elevationM >= 7500;
  const peakColor = isPolar ? "#9aa2a8" : high ? (range === "Karakoram" ? "#58616d" : "#6c7480") : isVolcano ? "#8d755e" : "#7b7f6f";
  const landColor = isPolar ? "#dfe8ea" : isVolcano ? "#c7b189" : "#b7c98c";
  const snow = "#f6f1e8";
  const header = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="${title}"><rect width="640" height="420" fill="#e7f0f4"/><circle cx="${500 + (seed % 34)}" cy="${70 + (seed % 24)}" r="42" fill="#f3c65d"/><rect y="314" width="640" height="106" fill="${landColor}"/><text x="320" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#263238">${title}</text><text x="320" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#52636b">${range} - ${location} - ${elevationM.toLocaleString("en-US")} m</text>`;
  const footer = `<path d="M48 326h544" stroke="#4a433a" stroke-width="10" stroke-linecap="round"/></svg>`;

  if (isVolcano) {
    const craterShift = (seed % 34) - 17;
    const smoke = name === "Mount Fuji" || name === "Mount Kilimanjaro" ? "" : `<path d="M${320 + craterShift} 126c-24-28 24-32 0-60M${340 + craterShift} 132c-10-24 28-28 14-54" fill="none" stroke="#dfe8ea" stroke-width="8" stroke-linecap="round"/>`;
    return `${header}${smoke}<path d="M72 326 320 112 568 326z" fill="${peakColor}"/><path d="M252 170c38 26 86 26 136 0l-38 42-32-20-34 22z" fill="${snow}"/><path d="M284 126c26 16 52 16 78 0" fill="none" stroke="#4a433a" stroke-width="12" stroke-linecap="round"/><path d="M120 326c52-48 94-70 126-66M402 326c38-46 82-70 132-72" fill="none" stroke="#6b5a47" stroke-width="10" stroke-linecap="round" opacity=".55"/>${footer}`;
  }

  if (isSharp) {
    const peakX = 314 + (seed % 34) - 17;
    return `${header}<path d="M74 326 ${peakX} 92 566 326z" fill="${peakColor}"/><path d="M${peakX} 92 ${peakX - 62} 194 ${peakX + 4} 166 ${peakX + 48} 214z" fill="${snow}"/><path d="M${peakX} 94 ${peakX - 14} 326" stroke="#3e454c" stroke-width="8" opacity=".55"/><path d="M118 326 226 226l70 100M416 326l54-74 74 74" fill="none" stroke="#4a433a" stroke-width="9" stroke-linecap="round" opacity=".55"/>${footer}`;
  }

  const p1 = 178 + (seed % 42);
  const p2 = 324 + ((seed * 3) % 44) - 22;
  const p3 = 456 + ((seed * 5) % 42) - 21;
  const y1 = high ? 110 + (seed % 28) : 168 + (seed % 28);
  const y2 = high ? 78 + ((seed * 2) % 32) : 150 + ((seed * 2) % 34);
  const y3 = high ? 118 + ((seed * 4) % 30) : 178 + ((seed * 4) % 32);
  return `${header}<path d="M48 326 ${p1} ${y1} ${p1 + 84} 236 ${p2} ${y2} ${p2 + 92} 232 ${p3} ${y3} 592 326z" fill="${peakColor}"/><path d="M${p1} ${y1} ${p1 - 42} ${y1 + 64} ${p1 + 18} ${y1 + 42} ${p1 + 66} ${y1 + 84} ${p1 + 94} ${y1 + 46}zM${p2} ${y2} ${p2 - 58} ${y2 + 94} ${p2 + 20} ${y2 + 56} ${p2 + 72} ${y2 + 108} ${p2 + 116} ${y2 + 58}zM${p3} ${y3} ${p3 - 50} ${y3 + 74} ${p3 + 12} ${y3 + 46} ${p3 + 72} ${y3 + 94} ${p3 + 106} ${y3 + 54}z" fill="${snow}"/><path d="M96 326c54-36 104-52 150-48M286 326c52-44 104-64 156-60M436 326c32-30 70-44 114-42" fill="none" stroke="#4a433a" stroke-width="8" stroke-linecap="round" opacity=".45"/>${footer}`;
};

fs.mkdirSync(packDir, { recursive: true });
fs.mkdirSync(assetDir, { recursive: true });

const pack = {
  $schema: "../pack.schema.json",
  id: packId,
  title: "Tallest Mountains",
  summary: "The world's highest Himalaya and Karakoram peaks plus famous global mountains become elevation, prominence, history, and fame challenges.",
  status: "playable",
  audience: {
    minAge: 6,
    maxAge: 11,
    readingLevel: "short mountain facts with rounded elevation comparisons",
  },
  recommendedModes: ["trumps", "sort", "fact", "peek", "number", "odd"],
  sources: [
    {
      label: "Wikipedia list of highest mountains on Earth",
      url: "https://en.wikipedia.org/wiki/List_of_highest_mountains_on_Earth",
      note: "Primary source for top-ranked Himalaya and Karakoram elevations, prominence, and ascent years.",
    },
    {
      label: "Wikipedia Seven Summits",
      url: "https://en.wikipedia.org/wiki/Seven_Summits",
      note: "Context for famous continental high points such as Kilimanjaro, Denali, Aconcagua, and Vinson.",
    },
    {
      label: "Wikimedia mountain articles",
      url: "https://en.wikipedia.org/wiki/Mountain",
      note: "Individual linked mountain pages are used for special-case facts and famous non-Himalayan peaks.",
    },
  ],
  cards: cards.map(cardObject),
};

for (const card of cards) {
  fs.writeFileSync(path.join(assetDir, `${card[0]}.svg`), svgFor(card));
}

fs.writeFileSync(path.join(packDir, "pack.json"), `${JSON.stringify(pack, null, 2)}\n`);
console.log(`Wrote ${pack.cards.length} cards to ${packDir}`);

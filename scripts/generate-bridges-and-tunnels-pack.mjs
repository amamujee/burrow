import fs from "node:fs";
import path from "node:path";

const packId = "bridges-and-tunnels";
const packDir = path.join("content", "packs", packId);
const assetDir = path.join("public", "burrow-assets", packId);

const cards = [
  ["brooklyn-bridge", "Brooklyn Bridge", "bridge", "suspension", "New York City, United States", 1.13, 1883, 10, 7, "A New York icon, the Brooklyn Bridge joined Manhattan and Brooklyn with Gothic stone towers and a daring suspended span.", "https://en.wikipedia.org/wiki/Brooklyn_Bridge", ["new-york-area", "suspension", "historic"]],
  ["manhattan-bridge", "Manhattan Bridge", "bridge", "suspension", "New York City, United States", 1.29, 1909, 9, 7, "The Manhattan Bridge carries road, subway, bike, and foot traffic between Lower Manhattan and Brooklyn.", "https://en.wikipedia.org/wiki/Manhattan_Bridge", ["new-york-area", "suspension", "transit"]],
  ["williamsburg-bridge", "Williamsburg Bridge", "bridge", "suspension", "New York City, United States", 1.38, 1903, 8, 7, "The Williamsburg Bridge links Manhattan's Lower East Side with Brooklyn and was once the world's longest suspension span.", "https://en.wikipedia.org/wiki/Williamsburg_Bridge", ["new-york-area", "suspension", "historic"]],
  ["queensboro-bridge", "Queensboro Bridge", "bridge", "cantilever", "New York City, United States", 0.71, 1909, 8, 6, "The Queensboro Bridge crosses the East River by Roosevelt Island and is also known as the Ed Koch Queensboro Bridge.", "https://en.wikipedia.org/wiki/Queensboro_Bridge", ["new-york-area", "cantilever", "transit"]],
  ["verrazzano-narrows-bridge", "Verrazzano-Narrows Bridge", "bridge", "suspension", "New York City, United States", 2.6, 1964, 9, 9, "The Verrazzano-Narrows Bridge connects Brooklyn and Staten Island with a giant suspension span over the Narrows.", "https://en.wikipedia.org/wiki/Verrazzano-Narrows_Bridge", ["new-york-area", "suspension", "long-span"]],
  ["george-washington-bridge", "George Washington Bridge", "bridge", "suspension", "New York-New Jersey, United States", 0.91, 1931, 9, 8, "The George Washington Bridge crosses the Hudson River and is one of the world's busiest motor-vehicle bridges.", "https://en.wikipedia.org/wiki/George_Washington_Bridge", ["new-york-area", "suspension", "hudson-river"]],
  ["rfk-triborough-bridge", "Robert F. Kennedy Bridge", "bridge", "complex", "New York City, United States", 1.38, 1936, 7, 7, "The Robert F. Kennedy Bridge, often called the Triborough, ties Manhattan, Queens, and the Bronx together.", "https://en.wikipedia.org/wiki/Triborough_Bridge", ["new-york-area", "complex", "transit"]],
  ["bronx-whitestone-bridge", "Bronx-Whitestone Bridge", "bridge", "suspension", "New York City, United States", 0.71, 1939, 7, 7, "The Bronx-Whitestone Bridge gives drivers a direct East River route between the Bronx and Queens.", "https://en.wikipedia.org/wiki/Bronx-Whitestone_Bridge", ["new-york-area", "suspension", "east-river"]],
  ["throgs-neck-bridge", "Throgs Neck Bridge", "bridge", "suspension", "New York City, United States", 0.55, 1961, 7, 7, "The Throgs Neck Bridge is a major suspension bridge connecting the Bronx and Queens near Long Island Sound.", "https://en.wikipedia.org/wiki/Throgs_Neck_Bridge", ["new-york-area", "suspension", "east-river"]],
  ["henry-hudson-bridge", "Henry Hudson Bridge", "bridge", "arch", "New York City, United States", 0.42, 1936, 6, 5, "The Henry Hudson Bridge is a tall steel arch crossing the Harlem River Ship Canal in northern Manhattan.", "https://en.wikipedia.org/wiki/Henry_Hudson_Bridge", ["new-york-area", "arch", "hudson-river"]],
  ["bayonne-bridge", "Bayonne Bridge", "bridge", "arch", "New York-New Jersey, United States", 1.03, 1931, 7, 7, "The Bayonne Bridge's roadway was raised so larger ships could pass beneath its graceful steel arch.", "https://en.wikipedia.org/wiki/Bayonne_Bridge", ["new-york-area", "arch", "port"]],
  ["goethals-bridge", "Goethals Bridge", "bridge", "cable-stayed", "New York-New Jersey, United States", 1.4, 2018, 6, 7, "The modern Goethals Bridge uses cable-stayed towers to connect Staten Island with Elizabeth, New Jersey.", "https://en.wikipedia.org/wiki/Goethals_Bridge", ["new-york-area", "cable-stayed", "port"]],
  ["governor-mario-cuomo-bridge", "Governor Mario M. Cuomo Bridge", "bridge", "cable-stayed", "New York, United States", 3.1, 2018, 7, 8, "The Governor Mario M. Cuomo Bridge replaced the old Tappan Zee Bridge across one of the Hudson River's widest points.", "https://en.wikipedia.org/wiki/Governor_Mario_M._Cuomo_Bridge", ["new-york-area", "cable-stayed", "hudson-river"]],
  ["golden-gate-bridge", "Golden Gate Bridge", "bridge", "suspension", "San Francisco, United States", 1.7, 1937, 10, 9, "The Golden Gate Bridge's orange towers and foggy bay setting make it one of the most recognizable bridges on Earth.", "https://en.wikipedia.org/wiki/Golden_Gate_Bridge", ["global-icon", "suspension", "long-span"]],
  ["tower-bridge", "Tower Bridge", "bridge", "bascule", "London, United Kingdom", 0.15, 1894, 10, 6, "Tower Bridge combines two castle-like towers with a roadway that can lift for tall ships on the Thames.", "https://en.wikipedia.org/wiki/Tower_Bridge", ["global-icon", "bascule", "historic"]],
  ["london-bridge", "London Bridge", "bridge", "box-girder", "London, United Kingdom", 0.17, 1973, 8, 4, "London Bridge is famous because bridges at this crossing have linked the City of London and Southwark for centuries.", "https://en.wikipedia.org/wiki/London_Bridge", ["global-icon", "historic", "river-crossing"]],
  ["sydney-harbour-bridge", "Sydney Harbour Bridge", "bridge", "arch", "Sydney, Australia", 0.71, 1932, 10, 8, "Sydney Harbour Bridge is nicknamed the Coathanger because of its huge steel arch over the harbor.", "https://en.wikipedia.org/wiki/Sydney_Harbour_Bridge", ["global-icon", "arch", "harbor"]],
  ["akashi-kaikyo-bridge", "Akashi Kaikyo Bridge", "bridge", "suspension", "Kobe-Awaji, Japan", 2.43, 1998, 9, 10, "The Akashi Kaikyo Bridge has one of the longest central spans ever built for a suspension bridge.", "https://en.wikipedia.org/wiki/Akashi_Kaikyo_Bridge", ["global-icon", "suspension", "long-span"]],
  ["millau-viaduct", "Millau Viaduct", "bridge", "cable-stayed", "Millau, France", 1.53, 2004, 9, 10, "The Millau Viaduct soars above France's Tarn valley and is famous for its very tall, elegant piers.", "https://en.wikipedia.org/wiki/Millau_Viaduct", ["global-icon", "cable-stayed", "viaduct"]],
  ["ponte-vecchio", "Ponte Vecchio", "bridge", "arch", "Florence, Italy", 0.06, 1345, 9, 4, "Ponte Vecchio is a medieval Florence bridge lined with shops, making it feel like a tiny street over water.", "https://en.wikipedia.org/wiki/Ponte_Vecchio", ["global-icon", "arch", "historic"]],
  ["rialto-bridge", "Rialto Bridge", "bridge", "arch", "Venice, Italy", 0.03, 1591, 9, 4, "The Rialto Bridge is Venice's famous stone crossing over the Grand Canal.", "https://en.wikipedia.org/wiki/Rialto_Bridge", ["global-icon", "arch", "historic"]],
  ["charles-bridge", "Charles Bridge", "bridge", "arch", "Prague, Czech Republic", 0.32, 1402, 9, 5, "Charles Bridge is a stone bridge lined with statues and is one of Prague's best-known landmarks.", "https://en.wikipedia.org/wiki/Charles_Bridge", ["global-icon", "arch", "historic"]],
  ["forth-bridge", "Forth Bridge", "bridge", "cantilever", "Scotland, United Kingdom", 1.54, 1890, 8, 8, "The Forth Bridge is a bold red railway cantilever bridge and a UNESCO-listed engineering landmark.", "https://en.wikipedia.org/wiki/Forth_Bridge", ["global-icon", "cantilever", "railway"]],
  ["oresund-bridge", "Oresund Bridge", "bridge", "cable-stayed", "Denmark-Sweden", 4.9, 2000, 8, 9, "The Oresund Bridge links Denmark and Sweden, then continues through a tunnel on the same crossing.", "https://en.wikipedia.org/wiki/%C3%98resund_Bridge", ["global-icon", "cable-stayed", "bridge-tunnel"]],
  ["bosphorus-bridge", "15 July Martyrs Bridge", "bridge", "suspension", "Istanbul, Turkey", 0.97, 1973, 8, 8, "The 15 July Martyrs Bridge, often called the Bosphorus Bridge, links Europe and Asia across Istanbul's strait.", "https://en.wikipedia.org/wiki/15_July_Martyrs_Bridge", ["global-icon", "suspension", "intercontinental"]],
  ["danyang-kunshan-grand-bridge", "Danyang-Kunshan Grand Bridge", "bridge", "viaduct", "Jiangsu, China", 102.4, 2011, 7, 10, "The Danyang-Kunshan Grand Bridge carries high-speed rail and is widely listed as the longest bridge in the world.", "https://en.wikipedia.org/wiki/Danyang%E2%80%93Kunshan_Grand_Bridge", ["longest", "viaduct", "railway"]],
  ["hong-kong-zhuhai-macau-bridge", "Hong Kong-Zhuhai-Macau Bridge", "bridge", "bridge-tunnel", "Pearl River Delta, China", 34.2, 2018, 8, 10, "The Hong Kong-Zhuhai-Macau crossing mixes long sea bridges, artificial islands, and an undersea tunnel.", "https://en.wikipedia.org/wiki/Hong_Kong%E2%80%93Zhuhai%E2%80%93Macau_Bridge", ["longest", "bridge-tunnel", "sea-crossing"]],
  ["mackinac-bridge", "Mackinac Bridge", "bridge", "suspension", "Michigan, United States", 5.0, 1957, 8, 8, "The Mackinac Bridge stretches between Michigan's peninsulas and is one of North America's great suspension bridges.", "https://en.wikipedia.org/wiki/Mackinac_Bridge", ["global-icon", "suspension", "long-span"]],
  ["sunshine-skyway-bridge", "Sunshine Skyway Bridge", "bridge", "cable-stayed", "Florida, United States", 4.1, 1987, 7, 8, "The Sunshine Skyway Bridge is known for bright yellow cables rising over Tampa Bay.", "https://en.wikipedia.org/wiki/Sunshine_Skyway_Bridge", ["global-icon", "cable-stayed", "harbor"]],
  ["bixby-creek-bridge", "Bixby Creek Bridge", "bridge", "arch", "California, United States", 0.14, 1932, 8, 5, "Bixby Creek Bridge is a beloved concrete arch on California's Pacific Coast Highway.", "https://en.wikipedia.org/wiki/Bixby_Creek_Bridge", ["global-icon", "arch", "coastal"]],
  ["gotthard-base-tunnel", "Gotthard Base Tunnel", "tunnel", "rail", "Swiss Alps, Switzerland", 35.5, 2016, 9, 10, "The Gotthard Base Tunnel runs under the Alps and is one of the longest railway tunnels in the world.", "https://en.wikipedia.org/wiki/Gotthard_Base_Tunnel", ["longest", "rail", "mountain"]],
  ["seikan-tunnel", "Seikan Tunnel", "tunnel", "rail", "Tsugaru Strait, Japan", 33.5, 1988, 9, 10, "The Seikan Tunnel carries trains between Honshu and Hokkaido with a long section under the seabed.", "https://en.wikipedia.org/wiki/Seikan_Tunnel", ["longest", "rail", "undersea"]],
  ["channel-tunnel", "Channel Tunnel", "tunnel", "rail", "United Kingdom-France", 31.4, 1994, 10, 10, "The Channel Tunnel, or Chunnel, lets trains travel beneath the English Channel between Britain and France.", "https://en.wikipedia.org/wiki/Channel_Tunnel", ["global-icon", "rail", "undersea"]],
  ["loetschberg-base-tunnel", "Loetschberg Base Tunnel", "tunnel", "rail", "Swiss Alps, Switzerland", 21.5, 2007, 7, 9, "The Loetschberg Base Tunnel is a long Swiss railway tunnel that slices through the Alps.", "https://en.wikipedia.org/wiki/L%C3%B6tschberg_Base_Tunnel", ["longest", "rail", "mountain"]],
  ["guadarrama-tunnel", "Guadarrama Tunnel", "tunnel", "rail", "Spain", 17.6, 2007, 6, 8, "The Guadarrama Tunnel carries high-speed trains through the mountains north of Madrid.", "https://en.wikipedia.org/wiki/Guadarrama_Tunnel", ["longest", "rail", "mountain"]],
  ["chesapeake-bay-bridge-tunnel", "Chesapeake Bay Bridge-Tunnel", "tunnel", "bridge-tunnel", "Virginia, United States", 17.6, 1964, 8, 9, "The Chesapeake Bay Bridge-Tunnel uses bridges, trestles, islands, and tunnels to cross the mouth of Chesapeake Bay.", "https://en.wikipedia.org/wiki/Chesapeake_Bay_Bridge%E2%80%93Tunnel", ["global-icon", "bridge-tunnel", "sea-crossing"]],
  ["laerdal-tunnel", "Laerdal Tunnel", "tunnel", "road", "Norway", 15.2, 2000, 8, 8, "The Laerdal Tunnel is a very long road tunnel in Norway with special caverns that break up the drive.", "https://en.wikipedia.org/wiki/L%C3%A6rdal_Tunnel", ["longest", "road", "mountain"]],
  ["yamate-tunnel", "Yamate Tunnel", "tunnel", "road", "Tokyo, Japan", 11.3, 2015, 7, 8, "The Yamate Tunnel is a long urban road tunnel carrying expressway traffic under Tokyo.", "https://en.wikipedia.org/wiki/Yamate_Tunnel", ["longest", "road", "urban"]],
  ["zhongnanshan-tunnel", "Zhongnanshan Tunnel", "tunnel", "road", "Shaanxi, China", 11.2, 2007, 6, 8, "The Zhongnanshan Tunnel is a major road tunnel through China's Qinling mountains.", "https://en.wikipedia.org/wiki/Zhongnanshan_Tunnel", ["longest", "road", "mountain"]],
  ["gotthard-road-tunnel", "Gotthard Road Tunnel", "tunnel", "road", "Swiss Alps, Switzerland", 10.5, 1980, 8, 8, "The Gotthard Road Tunnel gives highway traffic a long route through the Swiss Alps.", "https://en.wikipedia.org/wiki/Gotthard_Road_Tunnel", ["longest", "road", "mountain"]],
  ["tokyo-bay-aqua-line", "Tokyo Bay Aqua-Line", "tunnel", "bridge-tunnel", "Tokyo Bay, Japan", 9.3, 1997, 8, 8, "The Tokyo Bay Aqua-Line combines a bridge, an artificial island, and a tunnel under Tokyo Bay.", "https://en.wikipedia.org/wiki/Tokyo_Bay_Aqua-Line", ["global-icon", "bridge-tunnel", "sea-crossing"]],
  ["ryfylke-tunnel", "Ryfylke Tunnel", "tunnel", "road", "Norway", 8.9, 2019, 6, 8, "The Ryfylke Tunnel dives under a Norwegian fjord and is one of the world's longest undersea road tunnels.", "https://en.wikipedia.org/wiki/Ryfylke_Tunnel", ["longest", "road", "undersea"]],
];

const metadataRecognitionFor = (recognition) => Math.max(1, Math.min(5, Math.round(recognition / 2)));
const difficultyFor = (recognition, scale) => recognition >= 7 ? "easy" : scale >= 9 ? "medium" : "hard";

const cardObject = ([id, name, kind, structure, location, lengthMi, opened, recognition, scale, fact, sourceUrl, categories]) => ({
  id,
  name,
  image: `/burrow-assets/${packId}/${id}.svg`,
  imageAlt: `${name} stylized ${kind} card`,
  imageCredit: "Burrow original SVG",
  imageSourceUrl: sourceUrl,
  fact,
  stats: [
    { id: "length-mi", label: "Length", value: lengthMi, unit: "mi", direction: "higher" },
    { id: "opened-year", label: "Opened", value: opened, unit: "year", direction: "lower" },
    { id: "recognition", label: "Fame", value: recognition, unit: "/10", direction: "higher" },
    { id: "engineering-scale", label: "Engineering scale", value: scale, unit: "/10", direction: "higher" },
  ],
  categories: [kind, structure, location.includes("New York") ? "new-york-area" : "world", ...categories],
  tags: [kind, structure.replace(/[^a-z0-9]+/g, "-"), categories[0].replace(/[^a-z0-9]+/g, "-")],
  metadata: {
    difficultyBand: difficultyFor(recognition, scale),
    recognition: metadataRecognitionFor(recognition),
    taxonomyGroup: structure,
  },
  readingPrompts: [`What clue tells you ${name} is a ${kind}?`, `How does ${name}'s length compare with another card?`],
});

const svgFor = ([, name, kind, structure, location]) => {
  const isTunnel = kind === "tunnel";
  const title = name.replaceAll("&", "&amp;");
  const label = structure.replace("-", " ");
  const header = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="${title}"><rect width="640" height="420" fill="#edf4f7"/><text x="320" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#263238">${title}</text><text x="320" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#52636b">${location} - ${label}</text>`;
  const water = `<rect y="292" width="640" height="128" fill="#8ec6d6"/>`;
  const road = `<path d="M88 280h464" stroke="#34414a" stroke-width="22" stroke-linecap="round"/><path d="M112 280h416" stroke="#f4d35e" stroke-width="6" stroke-dasharray="22 18"/>`;
  const footer = `</svg>`;

  if (isTunnel) {
    const undersea = structure === "bridge-tunnel" || location.includes("Bay") || location.includes("Strait");
    const ground = undersea ? "#77b9c9" : "#8a8176";
    return `${header}<rect y="300" width="640" height="120" fill="${ground}"/><path d="M70 308c34-124 130-188 250-188s216 64 250 188" fill="#8a8176"/><path d="M132 308c30-78 92-118 188-118s158 40 188 118" fill="#263238"/><path d="M190 310c24-34 62-52 130-52s106 18 130 52" fill="none" stroke="#f4d35e" stroke-width="12" stroke-linecap="round"/><path d="M0 320h640v100H0z" fill="#5f6b6d"/><path d="M122 362h396" stroke="#f4d35e" stroke-width="10" stroke-dasharray="36 28"/>${footer}`;
  }

  if (structure === "cable-stayed") {
    return `${header}${water}<path d="M190 122v204M450 122v204" stroke="#34414a" stroke-width="24" stroke-linecap="round"/><path d="M190 138 86 280M190 156 156 280M190 174 232 280M190 194 308 280M450 138 554 280M450 156 484 280M450 174 408 280M450 194 332 280" stroke="#5b6470" stroke-width="8" stroke-linecap="round"/>${road}<path d="M120 292v54M244 292v54M396 292v54M520 292v54" stroke="#34414a" stroke-width="14" stroke-linecap="round"/>${footer}`;
  }

  if (structure === "arch") {
    return `${header}${water}<path d="M82 280c68-118 158-176 238-176s170 58 238 176" fill="none" stroke="#5b6470" stroke-width="34" stroke-linecap="round"/><path d="M122 280c54-76 118-116 198-116s144 40 198 116" fill="none" stroke="#edf4f7" stroke-width="34" stroke-linecap="round"/>${road}<path d="M150 280v58M246 248v88M394 248v88M490 280v58" stroke="#34414a" stroke-width="14" stroke-linecap="round"/>${footer}`;
  }

  if (structure === "cantilever") {
    return `${header}${water}<path d="M84 270h472M116 226h408M116 226l68 44 68-44 68 44 68-44 68 44 68-44M116 270l68-44 68 44 68-44 68 44 68-44 68 44" fill="none" stroke="#34414a" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/><path d="M128 270v68M320 238v100M512 270v68" stroke="#34414a" stroke-width="16" stroke-linecap="round"/><path d="M102 284h436" stroke="#f4d35e" stroke-width="6" stroke-dasharray="22 18"/>${footer}`;
  }

  if (structure === "bascule") {
    return `${header}${water}<rect x="120" y="150" width="70" height="144" fill="#7d6a56" stroke="#34414a" stroke-width="10"/><rect x="450" y="150" width="70" height="144" fill="#7d6a56" stroke="#34414a" stroke-width="10"/><path d="M190 272 304 210M450 272 336 210" stroke="#34414a" stroke-width="20" stroke-linecap="round"/><path d="M92 282h98M450 282h98" stroke="#34414a" stroke-width="20" stroke-linecap="round"/><circle cx="320" cy="232" r="18" fill="#f4d35e" stroke="#34414a" stroke-width="8"/>${footer}`;
  }

  if (structure === "viaduct") {
    return `${header}<rect y="304" width="640" height="116" fill="#b7c98c"/><path d="M64 244h512" stroke="#34414a" stroke-width="24" stroke-linecap="round"/><path d="M104 256v96M184 256v96M264 256v96M344 256v96M424 256v96M504 256v96" stroke="#5b6470" stroke-width="18" stroke-linecap="round"/><path d="M80 244h480" stroke="#f4d35e" stroke-width="6" stroke-dasharray="22 18"/><path d="M104 352h400" stroke="#34414a" stroke-width="12" stroke-linecap="round"/>${footer}`;
  }

  if (structure === "bridge-tunnel") {
    return `${header}${water}<path d="M60 270h222" stroke="#34414a" stroke-width="22" stroke-linecap="round"/><path d="M94 270v58M180 270v58" stroke="#34414a" stroke-width="14" stroke-linecap="round"/><ellipse cx="342" cy="296" rx="52" ry="24" fill="#d8cba4"/><path d="M392 302c22-64 70-98 128-98s106 34 128 98" fill="#8a8176"/><path d="M428 302c20-38 50-58 92-58s72 20 92 58" fill="#263238"/><path d="M80 270h188M438 326h168" stroke="#f4d35e" stroke-width="6" stroke-dasharray="22 18"/>${footer}`;
  }

  if (structure === "complex") {
    return `${header}${water}<path d="M60 280c48-70 100-104 156-104s108 34 156 104M288 280c48-70 100-104 156-104s108 34 156 104" fill="none" stroke="#5b6470" stroke-width="24" stroke-linecap="round"/><path d="M82 280h476" stroke="#34414a" stroke-width="22" stroke-linecap="round"/><path d="M140 280v58M248 260v78M360 260v78M496 280v58" stroke="#34414a" stroke-width="14" stroke-linecap="round"/><path d="M106 280h428" stroke="#f4d35e" stroke-width="6" stroke-dasharray="22 18"/>${footer}`;
  }

  return `${header}${water}<path d="M92 278c72-98 148-146 228-146s156 48 228 146" fill="none" stroke="#5b6470" stroke-width="28" stroke-linecap="round"/><path d="M150 146v190M490 146v190" stroke="#34414a" stroke-width="24" stroke-linecap="round"/><path d="M150 154c50 46 100 66 170 66s120-20 170-66" fill="none" stroke="#34414a" stroke-width="10" stroke-linecap="round"/>${road}<path d="M132 280v58M214 250v88M320 226v112M426 250v88M508 280v58" stroke="#34414a" stroke-width="14" stroke-linecap="round"/>${footer}`;
};

fs.mkdirSync(packDir, { recursive: true });
fs.mkdirSync(assetDir, { recursive: true });

const pack = {
  $schema: "../pack.schema.json",
  id: packId,
  title: "Bridges & Tunnels",
  summary: "Famous bridge icons, major New York area crossings, record-setting viaducts, and long tunnels become length, history, and engineering challenges.",
  status: "playable",
  audience: {
    minAge: 6,
    maxAge: 11,
    readingLevel: "short landmark facts with rounded distance comparisons",
  },
  recommendedModes: ["trumps", "sort", "fact", "peek", "number", "odd"],
  sources: [
    { label: "Wikipedia list of bridges", url: "https://en.wikipedia.org/wiki/List_of_bridges", note: "General bridge index for landmark cross-checking." },
    { label: "Wikipedia list of longest bridges", url: "https://en.wikipedia.org/wiki/List_of_longest_bridges", note: "Length context for record-setting viaducts and sea crossings." },
    { label: "Wikipedia list of longest tunnels", url: "https://en.wikipedia.org/wiki/List_of_longest_tunnels", note: "Tunnel length context for rail, road, mountain, and undersea tunnels." },
    { label: "Britannica tunnel list", url: "https://www.britannica.com/topic/list-of-tunnels-2197876", note: "Secondary tunnel landmark reference." },
  ],
  cards: cards.map(cardObject),
};

for (const card of cards) {
  fs.writeFileSync(path.join(assetDir, `${card[0]}.svg`), svgFor(card));
}

fs.writeFileSync(path.join(packDir, "pack.json"), `${JSON.stringify(pack, null, 2)}\n`);
console.log(`Wrote ${pack.cards.length} cards to ${packDir}`);

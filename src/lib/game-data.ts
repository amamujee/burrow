import { contentLibraryStats } from "./content-library";

export type TopicId = "peppers" | "buildings" | "sharks" | "space" | "mixed";
export type KnowledgeTopic = Exclude<TopicId, "mixed">;
export type Difficulty = 1 | 2 | 3;
export type HeatBand = "not spicy" | "mild" | "warm" | "hot" | "very hot" | "insane";

export type VisualFit = "cover" | "contain";

export type ImageFields = {
  image: string;
  imageSourceFile: string;
  imageSourceUrl: string;
  imageCredit: string;
  imageFit?: VisualFit;
  imagePosition?: string;
};

export type Pepper = {
  id: string;
  name: string;
  heat: HeatBand;
  shuMin: number;
  shuMax: number;
  color: string;
  image: string;
  imageSourceFile: string;
  imageSourceUrl: string;
  imageCredit: string;
  imageFit?: VisualFit;
  imagePosition?: string;
  fact: string;
};

type PepperSeed = Omit<Pepper, "heat">;

export type Building = {
  id: string;
  name: string;
  city: string;
  country: string;
  heightFt: number;
  floors?: number;
  status: "finished" | "under construction";
  image: string;
  imageSourceFile: string;
  imageSourceUrl: string;
  imageCredit: string;
  imageFit?: VisualFit;
  imagePosition?: string;
  fact: string;
};

export type Shark = {
  id: string;
  name: string;
  family: string;
  lengthFt: number;
  speedMph: number;
  power: number;
  diet: string;
  image: string;
  imageSourceFile: string;
  imageSourceUrl: string;
  imageCredit: string;
  imageFit?: VisualFit;
  imagePosition?: string;
  fact: string;
};

export type SpaceKind = "planet" | "star" | "concept" | "moon" | "region";

export type SpaceCard = {
  id: string;
  name: string;
  kind: SpaceKind;
  group: string;
  image: string;
  imageSourceFile: string;
  imageSourceUrl: string;
  imageCredit: string;
  imageFit?: VisualFit;
  imagePosition?: string;
  diameterMiles?: number;
  distanceFromSunMillionMiles?: number;
  meanSurfaceTempF?: number;
  surfaceTempK?: number;
  radiusSolar?: number;
  distanceLightYears?: number;
  moons?: number;
  statNote?: string;
  fact: string;
  conceptQuestion?: string;
  conceptAnswer?: string;
};

export type TopicPack = {
  id: KnowledgeTopic;
  label: string;
  eyebrow: string;
  roundLabel: string;
  libraryCount: number;
  featuredCount: number;
  sources: { label: string; url: string }[];
  samples: string[];
};

const contentImage = (topic: KnowledgeTopic, id: string, sourceFile: string) => ({
  image: `/burrow-assets/${topic}/${id}.jpg`,
  imageSourceFile: sourceFile,
  imageSourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(sourceFile).replaceAll("%20", "_")}`,
});

const externalImage = (url: string, sourceFile: string, sourceUrl: string) => ({
  image: url,
  imageSourceFile: sourceFile,
  imageSourceUrl: sourceUrl,
});

export const heatBands: HeatBand[] = ["not spicy", "mild", "warm", "hot", "very hot", "insane"];

export const heatProfiles: Record<HeatBand, { label: string; icons: number; emoji: string; kidLine: string }> = {
  "not spicy": { label: "not spicy", icons: 0, emoji: "no spice", kidLine: "No burn. Easy mode." },
  mild: { label: "mild", icons: 1, emoji: "🌶️", kidLine: "A tiny spicy spark." },
  warm: { label: "warm", icons: 2, emoji: "🌶️🌶️", kidLine: "A friendly spicy kick." },
  hot: { label: "hot", icons: 3, emoji: "🌶️🌶️🌶️", kidLine: "A real spicy kick." },
  "very hot": { label: "very hot", icons: 4, emoji: "🌶️🌶️🌶️🌶️", kidLine: "Tiny bites only." },
  insane: { label: "insane", icons: 5, emoji: "🌶️🌶️🌶️🌶️🌶️🔥", kidLine: "Super-hot legend zone." },
};

export const heatBandForScoville = (shu: number): HeatBand => {
  if (shu <= 500) return "not spicy";
  if (shu <= 2500) return "mild";
  if (shu <= 25000) return "warm";
  if (shu <= 50000) return "hot";
  if (shu <= 500000) return "very hot";
  return "insane";
};

export const heatBandRangeLabel = (heat: HeatBand) => {
  switch (heat) {
    case "not spicy":
      return "0-500 SHU";
    case "mild":
      return "501-2,500 SHU";
    case "warm":
      return "2,501-25,000 SHU";
    case "hot":
      return "25,001-50,000 SHU";
    case "very hot":
      return "50,001-500,000 SHU";
    case "insane":
      return "500,001+ SHU";
  }
};

const pepperSeeds: PepperSeed[] = [
  {
    id: "bell-pepper",
    name: "Bell Pepper",
    shuMin: 0,
    shuMax: 0,
    color: "red",
    ...contentImage("peppers", "bell-pepper", "Red Bell Pepper.jpg"),
    imageCredit: "Bambi Cia, Wikimedia Commons",
    fact: "Bell peppers have 0 Scoville Heat Units. They are sweet, not spicy.",
  },
  {
    id: "banana-pepper",
    name: "Banana Pepper",
    shuMin: 0,
    shuMax: 500,
    color: "yellow",
    ...contentImage("peppers", "banana-pepper", "Banana peppers.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Banana peppers are usually gentle, yellow, and easy to eat.",
  },
  {
    id: "pepperoncini",
    name: "Pepperoncini",
    shuMin: 100,
    shuMax: 500,
    color: "green",
    ...contentImage("peppers", "pepperoncini", "Pepperoncini.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Pepperoncini are tangy peppers with very low heat.",
  },
  {
    id: "poblano",
    name: "Poblano",
    shuMin: 1000,
    shuMax: 2000,
    color: "dark green",
    ...contentImage("peppers", "poblano", "Poblano Pepper.jpg"),
    imageCredit: "stef yau, Wikimedia Commons",
    fact: "Poblanos are gentle peppers often used for chile relleno.",
  },
  {
    id: "anaheim",
    name: "Anaheim",
    shuMin: 500,
    shuMax: 2500,
    color: "green",
    ...contentImage("peppers", "anaheim", "Anaheim Chili Peppers.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Anaheim peppers are long green peppers with a mild kick.",
  },
  {
    id: "jalapeno",
    name: "Jalapeno",
    shuMin: 2500,
    shuMax: 8000,
    color: "green",
    ...contentImage("peppers", "jalapeno", "Jalapeño.jpg"),
    imageCredit: "Eric Polk, Wikimedia Commons",
    fact: "A jalapeno is spicy enough to notice, but not a super-hot.",
  },
  {
    id: "fresno",
    name: "Fresno",
    shuMin: 2500,
    shuMax: 10000,
    color: "red",
    ...contentImage("peppers", "fresno", "Red chili pepper.jpg"),
    imageCredit: "Selimee, Wikimedia Commons",
    fact: "Fresnos look a bit like red jalapenos and can be a little hotter.",
  },
  {
    id: "serrano",
    name: "Serrano",
    shuMin: 10000,
    shuMax: 23000,
    color: "green",
    ...contentImage("peppers", "serrano", "Serrano peppers.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Serranos are usually hotter than jalapenos.",
  },
  {
    id: "cayenne",
    name: "Cayenne",
    shuMin: 30000,
    shuMax: 50000,
    color: "red",
    ...contentImage("peppers", "cayenne", "Cayenne pepper 1.JPG"),
    imageCredit: "Andrew Dalby, Wikimedia Commons",
    fact: "Cayenne peppers are often dried and ground into red pepper powder.",
  },
  {
    id: "tabasco",
    name: "Tabasco",
    shuMin: 30000,
    shuMax: 50000,
    color: "red",
    ...contentImage("peppers", "tabasco", "Tabasco peppers.JPG"),
    imageCredit: "Wikimedia Commons",
    fact: "Tabasco peppers are famous for hot sauce.",
  },
  {
    id: "thai-chili",
    name: "Thai Chili",
    shuMin: 50000,
    shuMax: 100000,
    color: "red",
    ...contentImage("peppers", "thai-chili", "Bird's eye chili.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Thai chilies are small, bright, and much hotter than jalapenos.",
  },
  {
    id: "scotch-bonnet",
    name: "Scotch Bonnet",
    shuMin: 100000,
    shuMax: 350000,
    color: "yellow",
    ...contentImage("peppers", "scotch-bonnet", "Scotch bonnet chili pepper.jpg"),
    imageCredit: "Temaciejewski, Wikimedia Commons",
    fact: "Scotch bonnets are fruity, wrinkly peppers used in Caribbean cooking.",
  },
  {
    id: "habanero",
    name: "Habanero",
    shuMin: 100000,
    shuMax: 350000,
    color: "orange",
    ...contentImage("peppers", "habanero", "Habanero pepper 01.jpg"),
    imageCredit: "Zhayon, Wikimedia Commons",
    fact: "Habaneros are small, fruity, and much hotter than jalapenos.",
  },
  {
    id: "fatalii",
    name: "Fatalii",
    shuMin: 125000,
    shuMax: 400000,
    color: "yellow",
    ...contentImage("peppers", "fatalii", "Fatalii peppers.jpg"),
    imageCredit: "Eric Polk, Wikimedia Commons",
    fact: "Fatalii peppers are yellow super-hot relatives of habaneros.",
  },
  {
    id: "ghost-pepper",
    name: "Ghost Pepper",
    shuMin: 855000,
    shuMax: 1041427,
    color: "red",
    ...contentImage("peppers", "ghost-pepper", "Ghost Pepper ( Bhut Jolokia ).jpg"),
    imageCredit: "Rumi Borah, Wikimedia Commons",
    fact: "Ghost peppers were once famous as the world's hottest pepper.",
  },
  {
    id: "seven-pot-primo",
    name: "7 Pot Primo",
    shuMin: 800000,
    shuMax: 1469000,
    color: "red",
    ...contentImage("peppers", "seven-pot-primo", "Capsicum chinense, Texture.jpg"),
    imageCredit: "Filo gen', Wikimedia Commons",
    fact: "7 Pot Primo peppers are super-hot and often have a pointy tail.",
  },
  {
    id: "trinidad-scorpion",
    name: "Trinidad Moruga Scorpion",
    shuMin: 1200000,
    shuMax: 2000000,
    color: "red",
    ...contentImage("peppers", "trinidad-scorpion", "Trinidad Moruga Scorpion.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Trinidad Moruga Scorpion peppers are named for their stinger-like shape.",
  },
  {
    id: "carolina-reaper",
    name: "Carolina Reaper",
    shuMin: 1400000,
    shuMax: 2200000,
    color: "red",
    ...contentImage("peppers", "carolina-reaper", "Carolina Reaper pepper pods (cropped).jpg"),
    imageCredit: "Dale Thurber, Wikimedia Commons",
    fact: "The Carolina Reaper is a super-hot pepper with a wrinkly red shape.",
  },
  {
    id: "dragons-breath",
    name: "Dragon's Breath",
    shuMin: 2400000,
    shuMax: 2480000,
    color: "red",
    ...contentImage("peppers", "dragons-breath", "Dragon's Breath Pepper.jpg"),
    imageCredit: "Houfescu, Wikimedia Commons",
    fact: "Dragon's Breath is a legendary super-hot pepper name.",
  },
  {
    id: "pepper-x",
    name: "Pepper X",
    shuMin: 2693000,
    shuMax: 2693000,
    color: "greenish yellow",
    ...contentImage("peppers", "pepper-x", "Capsicum chinense.jpg"),
    imageCredit: "Eric in SF, Wikimedia Commons",
    fact: "Pepper X is known for an extremely high Scoville score.",
  },
];

export const peppers = pepperSeeds.map((pepper) => ({
  ...pepper,
  heat: heatBandForScoville(pepper.shuMax),
}));

export const buildings: Building[] = [
  {
    id: "burj-khalifa",
    name: "Burj Khalifa",
    city: "Dubai",
    country: "United Arab Emirates",
    heightFt: 2717,
    floors: 163,
    status: "finished",
    ...contentImage("buildings", "burj-khalifa", "Burj Khalifa (16260269606).jpg"),
    imageCredit: "Wikimedia Commons",
    imagePosition: "center bottom",
    fact: "Burj Khalifa is the tallest finished building in the world.",
  },
  {
    id: "merdeka-118",
    name: "Merdeka 118",
    city: "Kuala Lumpur",
    country: "Malaysia",
    heightFt: 2227,
    floors: 118,
    status: "finished",
    ...contentImage("buildings", "merdeka-118", "Merdeka 118 in September 2024.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Merdeka 118 is the second tallest finished building in the world.",
  },
  {
    id: "shanghai-tower",
    name: "Shanghai Tower",
    city: "Shanghai",
    country: "China",
    heightFt: 2073,
    floors: 128,
    status: "finished",
    ...contentImage("buildings", "shanghai-tower", "Shanghai Tower.jpg"),
    imageCredit: "Baycrest, Wikimedia Commons",
    fact: "Shanghai Tower twists as it rises into the sky.",
  },
  {
    id: "makkah-clock",
    name: "Makkah Royal Clock Tower",
    city: "Mecca",
    country: "Saudi Arabia",
    heightFt: 1972,
    floors: 120,
    status: "finished",
    ...contentImage("buildings", "makkah-clock", "Abraj-al-Bait largest clock tower ever.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "This tower has a huge clock near the top.",
  },
  {
    id: "ping-an",
    name: "Ping An Finance Centre",
    city: "Shenzhen",
    country: "China",
    heightFt: 1965,
    floors: 115,
    status: "finished",
    ...contentImage("buildings", "ping-an", "Pingan International Finance Center2020.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Ping An Finance Centre is one of China's tallest skyscrapers.",
  },
  {
    id: "lotte-world-tower",
    name: "Lotte World Tower",
    city: "Seoul",
    country: "South Korea",
    heightFt: 1819,
    floors: 123,
    status: "finished",
    ...contentImage("buildings", "lotte-world-tower", "Lotte World Tower near Cheongdam Bridge.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Lotte World Tower is a supertall skyscraper in Seoul.",
  },
  {
    id: "one-wtc",
    name: "One World Trade Center",
    city: "New York City",
    country: "United States",
    heightFt: 1776,
    floors: 94,
    status: "finished",
    ...contentImage("buildings", "one-wtc", "One World Trade Center May 2015.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "One World Trade Center is 1,776 feet tall, matching the year 1776.",
  },
  {
    id: "guangzhou-ctf",
    name: "Guangzhou CTF Finance Centre",
    city: "Guangzhou",
    country: "China",
    heightFt: 1739,
    floors: 111,
    status: "finished",
    ...contentImage("buildings", "guangzhou-ctf", "Guangzhou CTF Finance Centre.jpg"),
    imageCredit: "Wikimedia Commons",
    imageFit: "contain",
    fact: "Guangzhou CTF is a very tall tower in southern China.",
  },
  {
    id: "tianjin-ctf",
    name: "Tianjin CTF Finance Centre",
    city: "Tianjin",
    country: "China",
    heightFt: 1739,
    floors: 97,
    status: "finished",
    ...contentImage("buildings", "tianjin-ctf", "Tianjin CTF Finance Centre in 2019.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Tianjin CTF has a smooth, curving shape.",
  },
  {
    id: "china-zun",
    name: "CITIC Tower",
    city: "Beijing",
    country: "China",
    heightFt: 1731,
    floors: 109,
    status: "finished",
    ...contentImage("buildings", "china-zun", "CITIC Tower 2021.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "CITIC Tower is also called China Zun.",
  },
  {
    id: "taipei-101",
    name: "Taipei 101",
    city: "Taipei",
    country: "Taiwan",
    heightFt: 1667,
    floors: 101,
    status: "finished",
    ...contentImage("buildings", "taipei-101", "Taipei 101 2009 amk.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Taipei 101 has stacked sections that look like giant blocks.",
  },
  {
    id: "shanghai-wfc",
    name: "Shanghai World Financial Center",
    city: "Shanghai",
    country: "China",
    heightFt: 1614,
    floors: 101,
    status: "finished",
    ...contentImage("buildings", "shanghai-wfc", "Shanghai World Financial Center.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "This building has a big opening near the top.",
  },
  {
    id: "icc",
    name: "International Commerce Centre",
    city: "Hong Kong",
    country: "China",
    heightFt: 1588,
    floors: 108,
    status: "finished",
    ...contentImage("buildings", "icc", "International Commerce Centre 201008.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "The ICC is one of Hong Kong's tallest buildings.",
  },
  {
    id: "central-park-tower",
    name: "Central Park Tower",
    city: "New York City",
    country: "United States",
    heightFt: 1550,
    floors: 98,
    status: "finished",
    ...contentImage("buildings", "central-park-tower", "Central Park Tower April 2021.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Central Park Tower is an extremely tall residential building.",
  },
  {
    id: "lakhta-center",
    name: "Lakhta Center",
    city: "Saint Petersburg",
    country: "Russia",
    heightFt: 1516,
    floors: 87,
    status: "finished",
    ...contentImage("buildings", "lakhta-center", "Lakhta Center July 2019.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Lakhta Center is the tallest building in Europe.",
  },
  {
    id: "landmark-81",
    name: "Landmark 81",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    heightFt: 1513,
    floors: 81,
    status: "finished",
    ...contentImage("buildings", "landmark-81", "Landmark 81 in 2021.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Landmark 81 is Vietnam's tallest skyscraper.",
  },
  {
    id: "petronas-towers",
    name: "Petronas Towers",
    city: "Kuala Lumpur",
    country: "Malaysia",
    heightFt: 1483,
    floors: 88,
    status: "finished",
    ...contentImage("buildings", "petronas-towers", "KL-Petronas Towers at dusk.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "The Petronas Towers are twin towers connected by a skybridge.",
  },
  {
    id: "willis-tower",
    name: "Willis Tower",
    city: "Chicago",
    country: "United States",
    heightFt: 1451,
    floors: 108,
    status: "finished",
    ...contentImage("buildings", "willis-tower", "Willis Tower From Lake.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Willis Tower was once the tallest building in the world.",
  },
  {
    id: "432-park",
    name: "432 Park Avenue",
    city: "New York City",
    country: "United States",
    heightFt: 1396,
    floors: 85,
    status: "finished",
    ...contentImage("buildings", "432-park", "432 Park Avenue, NY.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "432 Park Avenue is a very skinny tower in New York.",
  },
  {
    id: "jeddah-tower",
    name: "Jeddah Tower",
    city: "Jeddah",
    country: "Saudi Arabia",
    heightFt: 3281,
    floors: 167,
    status: "under construction",
    ...contentImage("buildings", "jeddah-tower", "Jeddah Tower August 2019 S.Nitzold.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Jeddah Tower is planned to be more than 3,000 feet tall when finished.",
  },
];

export const sharks: Shark[] = [
  {
    id: "great-white",
    name: "Great White Shark",
    family: "Mackerel shark",
    lengthFt: 21,
    speedMph: 35,
    power: 5,
    diet: "seals, fish, rays",
    ...contentImage("sharks", "great-white", "White shark.jpg"),
    imageCredit: "Terry Goss, Wikimedia Commons",
    fact: "Great whites are apex predators and can grow to about 21 feet.",
  },
  {
    id: "whale-shark",
    name: "Whale Shark",
    family: "Carpet shark",
    lengthFt: 40,
    speedMph: 3,
    power: 1,
    diet: "plankton",
    ...contentImage("sharks", "whale-shark", "Whale Shark in Shallow Water.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Whale sharks are the biggest fish, but they filter-feed on tiny plankton.",
  },
  {
    id: "tiger-shark",
    name: "Tiger Shark",
    family: "Requiem shark",
    lengthFt: 18,
    speedMph: 20,
    power: 5,
    diet: "fish, turtles, birds",
    ...contentImage("sharks", "tiger-shark", "HIHWNMS tiger shark (50199857407).jpg"),
    imageCredit: "NOAA, Wikimedia Commons",
    fact: "Tiger sharks have stripes when young and are powerful ocean hunters.",
  },
  {
    id: "great-hammerhead",
    name: "Great Hammerhead",
    family: "Hammerhead shark",
    lengthFt: 20,
    speedMph: 25,
    power: 4,
    diet: "rays, fish, squid",
    ...contentImage("sharks", "great-hammerhead", "Great hammerhead nmfs.jpg"),
    imageCredit: "NOAA NMFS Mississippi Laboratory, Wikimedia Commons",
    fact: "Hammerheads use their wide heads like a sensor bar to find prey.",
  },
  {
    id: "shortfin-mako",
    name: "Shortfin Mako",
    family: "Mackerel shark",
    lengthFt: 13,
    speedMph: 45,
    power: 4,
    diet: "fast fish, squid",
    ...contentImage("sharks", "shortfin-mako", "Atlantic Shortfin mako.jpg"),
    imageCredit: "NOAA, Wikimedia Commons",
    fact: "Shortfin makos are among the fastest sharks in the ocean.",
  },
  {
    id: "basking-shark",
    name: "Basking Shark",
    family: "Basking shark",
    lengthFt: 33,
    speedMph: 4,
    power: 1,
    diet: "plankton",
    ...contentImage("sharks", "basking-shark", "Basking Shark.jpg"),
    imageCredit: "Chris Gotschalk, Wikimedia Commons",
    fact: "Basking sharks are huge filter-feeders with giant mouths.",
  },
  {
    id: "nurse-shark",
    name: "Nurse Shark",
    family: "Nurse shark",
    lengthFt: 10,
    speedMph: 5,
    power: 2,
    diet: "crabs, fish, mollusks",
    ...contentImage("sharks", "nurse-shark", "Nurse shark.jpg"),
    imageCredit: "NOAA, Wikimedia Commons",
    fact: "Nurse sharks often rest on the seafloor during the day.",
  },
  {
    id: "zebra-shark",
    name: "Zebra Shark",
    family: "Carpet shark",
    lengthFt: 12,
    speedMph: 5,
    power: 2,
    diet: "shellfish, small fish",
    ...contentImage("sharks", "zebra-shark", "Leopard shark.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Young zebra sharks have stripes, but adults have spots.",
  },
  {
    id: "goblin-shark",
    name: "Goblin Shark",
    family: "Goblin shark",
    lengthFt: 13,
    speedMph: 10,
    power: 3,
    diet: "deep-sea fish, squid",
    ...contentImage("sharks", "goblin-shark", "Goblin shark, Pengo.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Goblin sharks live deep in the ocean and have a long nose.",
  },
  {
    id: "common-thresher",
    name: "Common Thresher",
    family: "Thresher shark",
    lengthFt: 20,
    speedMph: 30,
    power: 4,
    diet: "schooling fish",
    ...contentImage("sharks", "common-thresher", "Thresher shark - 3.jpg"),
    imageCredit: "Oleg Yunakov, Wikimedia Commons",
    fact: "Thresher sharks use their long tails like a whip to stun fish.",
  },
  {
    id: "blue-shark",
    name: "Blue Shark",
    family: "Requiem shark",
    lengthFt: 12,
    speedMph: 24,
    power: 3,
    diet: "fish, squid",
    ...contentImage("sharks", "blue-shark", "Blue shark.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Blue sharks are sleek open-ocean travelers.",
  },
  {
    id: "bull-shark",
    name: "Bull Shark",
    family: "Requiem shark",
    lengthFt: 11,
    speedMph: 25,
    power: 5,
    diet: "fish, dolphins, other sharks",
    ...contentImage("sharks", "bull-shark", "Requin bouledogue (Carcharhinus leucas) (Ifremer 00813-92510 - 53591).jpg"),
    imageCredit: "Ifremer, Wikimedia Commons",
    fact: "Bull sharks can swim in both salt water and fresh water.",
  },
  {
    id: "lemon-shark",
    name: "Lemon Shark",
    family: "Requiem shark",
    lengthFt: 11,
    speedMph: 20,
    power: 3,
    diet: "fish, rays, crustaceans",
    ...contentImage("sharks", "lemon-shark", "Lemonshark.jpg"),
    imageCredit: "Albert kok, Wikimedia Commons",
    fact: "Lemon sharks get their name from their yellow-brown color.",
  },
  {
    id: "blacktip-reef",
    name: "Blacktip Reef Shark",
    family: "Requiem shark",
    lengthFt: 6,
    speedMph: 20,
    power: 2,
    diet: "reef fish",
    ...contentImage("sharks", "blacktip-reef", "Blacktip reef shark.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Blacktip reef sharks patrol warm coral reefs.",
  },
  {
    id: "greenland-shark",
    name: "Greenland Shark",
    family: "Sleeper shark",
    lengthFt: 24,
    speedMph: 2,
    power: 3,
    diet: "fish, seals, carrion",
    ...contentImage("sharks", "greenland-shark", "Greenland shark profile.jpg"),
    imageCredit: "Hemming1952, Wikimedia Commons",
    fact: "Greenland sharks are slow, cold-water sharks that can live for centuries.",
  },
  {
    id: "sawshark",
    name: "Sawshark",
    family: "Sawshark",
    lengthFt: 5,
    speedMph: 10,
    power: 2,
    diet: "small fish, crustaceans",
    ...contentImage("sharks", "sawshark", "Pristiophorus japonicus 2.jpg"),
    imageCredit: "ume-y, Wikimedia Commons",
    fact: "Sawsharks have a long saw-like snout with teeth on the sides.",
  },
  {
    id: "epaulette-shark",
    name: "Epaulette Shark",
    family: "Carpet shark",
    lengthFt: 3,
    speedMph: 2,
    power: 1,
    diet: "worms, crabs, tiny fish",
    ...contentImage("sharks", "epaulette-shark", "Epaulette shark camden.jpg"),
    imageCredit: "Yzx, Wikimedia Commons",
    fact: "Epaulette sharks can wiggle across shallow reef flats.",
  },
  {
    id: "cookiecutter",
    name: "Cookiecutter Shark",
    family: "Sleeper shark",
    lengthFt: 2,
    speedMph: 7,
    power: 3,
    diet: "round bites from big animals",
    ...contentImage("sharks", "cookiecutter", "Cookiecutter shark.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Cookiecutter sharks take round cookie-shaped bites.",
  },
];

export const spaceCards: SpaceCard[] = [
  {
    id: "venus",
    name: "Venus",
    kind: "planet",
    group: "Solar System",
    diameterMiles: 7521,
    distanceFromSunMillionMiles: 67,
    meanSurfaceTempF: 872,
    moons: 0,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Venus%20globe.jpg?width=900", "Venus globe.jpg", "https://commons.wikimedia.org/wiki/File:Venus_globe.jpg"),
    imageCredit: "NASA/JPL, Wikimedia Commons",
    fact: "Venus is the hottest planet in the solar system because its thick atmosphere traps heat.",
  },
  {
    id: "mars",
    name: "Mars",
    kind: "planet",
    group: "Solar System",
    diameterMiles: 4212,
    distanceFromSunMillionMiles: 142,
    meanSurfaceTempF: -85,
    moons: 2,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/OSIRIS%20Mars%20true%20color.jpg?width=900", "OSIRIS Mars true color.jpg", "https://commons.wikimedia.org/wiki/File:OSIRIS_Mars_true_color.jpg"),
    imageCredit: "ESA/Rosetta/OSIRIS, Wikimedia Commons",
    fact: "Mars is cold, dusty, and has two tiny moons named Phobos and Deimos.",
  },
  {
    id: "mercury",
    name: "Mercury",
    kind: "planet",
    group: "Solar System",
    diameterMiles: 3032,
    distanceFromSunMillionMiles: 36,
    meanSurfaceTempF: 333,
    moons: 0,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Mercury%20in%20true%20color.jpg?width=900", "Mercury in true color.jpg", "https://commons.wikimedia.org/wiki/File:Mercury_in_true_color.jpg"),
    imageCredit: "NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington",
    fact: "Mercury is closest to the Sun, but Venus is hotter because Mercury has almost no atmosphere.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "planet",
    group: "Solar System",
    diameterMiles: 86881,
    distanceFromSunMillionMiles: 484,
    meanSurfaceTempF: -166,
    moons: 95,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Jupiter%20and%20its%20shrunken%20Great%20Red%20Spot.jpg?width=900", "Jupiter and its shrunken Great Red Spot.jpg", "https://commons.wikimedia.org/wiki/File:Jupiter_and_its_shrunken_Great_Red_Spot.jpg"),
    imageCredit: "NASA/ESA/A. Simon/M. H. Wong",
    fact: "Jupiter is the biggest planet in our solar system and has a giant storm called the Great Red Spot.",
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "planet",
    group: "Solar System",
    diameterMiles: 30599,
    distanceFromSunMillionMiles: 2781,
    meanSurfaceTempF: -330,
    moons: 16,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Neptune%20Full.jpg?width=900", "Neptune Full.jpg", "https://commons.wikimedia.org/wiki/File:Neptune_Full.jpg"),
    imageCredit: "NASA/JPL, Wikimedia Commons",
    fact: "Neptune is an ice giant with supersonic winds and a deep blue color.",
  },
  {
    id: "uy-scuti",
    name: "UY Scuti",
    kind: "star",
    group: "Huge Stars",
    surfaceTempK: 3400,
    radiusSolar: 1700,
    distanceLightYears: 9500,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Sun%20and%20VY%20Canis%20Majoris.svg?width=900", "Sun and VY Canis Majoris.svg", "https://commons.wikimedia.org/wiki/File:Sun_and_VY_Canis_Majoris.svg"),
    imageCredit: "Wikimedia Commons scale illustration",
    statNote: "Estimated radius; huge stars are difficult to measure exactly.",
    fact: "UY Scuti is often listed among the largest known stars, but its exact size is uncertain.",
  },
  {
    id: "stephenson-2-18",
    name: "Stephenson 2-18",
    kind: "star",
    group: "Huge Stars",
    surfaceTempK: 3200,
    radiusSolar: 2150,
    distanceLightYears: 19000,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Red%20supergiant%20star%20artist%27s%20impression.jpg?width=900", "Red supergiant star artist's impression.jpg", "https://commons.wikimedia.org/wiki/File:Red_supergiant_star_artist%27s_impression.jpg"),
    imageCredit: "ESO/M. Kornmesser, Wikimedia Commons",
    statNote: "Estimated radius; scientists revise giant-star measurements.",
    fact: "Stephenson 2-18 is a red supergiant and one of the largest star candidates by estimated radius.",
  },
  {
    id: "rigel",
    name: "Rigel",
    kind: "star",
    group: "Hot Stars",
    surfaceTempK: 12100,
    radiusSolar: 79,
    distanceLightYears: 860,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Rigel%20A%20and%20reflection%20nebula%20IC%202118.jpg?width=900", "Rigel A and reflection nebula IC 2118.jpg", "https://commons.wikimedia.org/wiki/File:Rigel_A_and_reflection_nebula_IC_2118.jpg"),
    imageCredit: "Wikimedia Commons",
    fact: "Rigel is a blue supergiant. Blue stars are much hotter at the surface than red stars.",
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    kind: "star",
    group: "Huge Stars",
    surfaceTempK: 3500,
    radiusSolar: 760,
    distanceLightYears: 550,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Betelgeuse%20star%20%28Hubble%29.jpg?width=900", "Betelgeuse star (Hubble).jpg", "https://commons.wikimedia.org/wiki/File:Betelgeuse_star_(Hubble).jpg"),
    imageCredit: "Andrea Dupree/NASA/ESA",
    fact: "Betelgeuse is a red supergiant in Orion. It is huge, but its surface is cooler than blue stars.",
  },
  {
    id: "sirius",
    name: "Sirius",
    kind: "star",
    group: "Bright Stars",
    surfaceTempK: 9940,
    radiusSolar: 1.7,
    distanceLightYears: 8.6,
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Sirius%20A%20and%20B%20Hubble%20photo.jpg?width=900", "Sirius A and B Hubble photo.jpg", "https://commons.wikimedia.org/wiki/File:Sirius_A_and_B_Hubble_photo.jpg"),
    imageCredit: "NASA/ESA/H. Bond/M. Barstow",
    fact: "Sirius is the brightest star in Earth's night sky and is much closer than most stars we see.",
  },
  {
    id: "black-hole",
    name: "Black Hole",
    kind: "concept",
    group: "Cosmic Ideas",
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Black%20hole%20-%20Messier%2087.jpg?width=900", "Black hole - Messier 87.jpg", "https://commons.wikimedia.org/wiki/File:Black_hole_-_Messier_87.jpg"),
    imageCredit: "Event Horizon Telescope Collaboration",
    fact: "A black hole is a place where gravity is so strong that light cannot escape once it gets too close.",
    conceptQuestion: "What is a black hole?",
    conceptAnswer: "A place in space where gravity is so strong that even light cannot escape.",
  },
  {
    id: "supernova",
    name: "Supernova",
    kind: "concept",
    group: "Cosmic Ideas",
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Crab%20Nebula.jpg?width=900", "Crab Nebula.jpg", "https://commons.wikimedia.org/wiki/File:Crab_Nebula.jpg"),
    imageCredit: "NASA/ESA/J. Hester/A. Loll",
    fact: "A supernova is an extremely bright, powerful explosion of a star.",
    conceptQuestion: "What is a supernova?",
    conceptAnswer: "A super-powerful star explosion that blasts material into space.",
  },
  {
    id: "nebula",
    name: "Nebula",
    kind: "concept",
    group: "Cosmic Ideas",
    ...externalImage("https://commons.wikimedia.org/wiki/Special:FilePath/Pillars%20of%20Creation%20%28NIRCam%20Image%29.jpg?width=900", "Pillars of Creation (NIRCam Image).jpg", "https://commons.wikimedia.org/wiki/File:Pillars_of_Creation_(NIRCam_Image).jpg"),
    imageCredit: "NASA/ESA/CSA/STScI",
    fact: "A nebula is a giant cloud of gas and dust. Some nebulae are places where stars are born.",
    conceptQuestion: "Where can a star be born?",
    conceptAnswer: "Inside a nebula, where gravity pulls gas and dust together.",
  },
];

export const topicIds = ["peppers", "buildings", "sharks", "space"] as const satisfies readonly KnowledgeTopic[];

export const topicPacks: Record<KnowledgeTopic, TopicPack> = {
  peppers: {
    id: "peppers",
    label: "Spicy Peppers",
    eyebrow: `${contentLibraryStats.peppers}+ peppers`,
    roundLabel: "Pepper round",
    libraryCount: contentLibraryStats.peppers,
    featuredCount: peppers.length,
    sources: [{ label: "WikiPepper", url: "https://wikipepper.org/peppers" }],
    samples: ["7 Pot Primo", "Aji Amarillo", "Carolina Reaper", "Scotch Bonnet"],
  },
  buildings: {
    id: "buildings",
    label: "Tall Buildings",
    eyebrow: `${contentLibraryStats.buildings}+ towers`,
    roundLabel: "Tower round",
    libraryCount: contentLibraryStats.buildings,
    featuredCount: buildings.length,
    sources: [
      { label: "Wikidata skyscraper records", url: "https://query.wikidata.org/" },
      { label: "CTBUH criteria", url: "https://www.ctbuh.org/HighRiseInfo/TallestDatabase/Criteria/tabid/446/language/en-US/Default.aspx" },
    ],
    samples: ["Burj Khalifa", "Merdeka 118", "Shanghai Tower", "One World Trade Center"],
  },
  sharks: {
    id: "sharks",
    label: "Shark Lab",
    eyebrow: `${contentLibraryStats.sharks}+ sharks`,
    roundLabel: "Shark round",
    libraryCount: contentLibraryStats.sharks,
    featuredCount: sharks.length,
    sources: [{ label: "Wikidata shark taxonomy", url: "https://query.wikidata.org/" }],
    samples: ["Whale Shark", "Great White Shark", "Shortfin Mako", "Greenland Shark"],
  },
  space: {
    id: "space",
    label: "Space Lab",
    eyebrow: `${spaceCards.length} space cards`,
    roundLabel: "Space round",
    libraryCount: spaceCards.length,
    featuredCount: spaceCards.length,
    sources: [
      { label: "NASA Venus facts", url: "https://science.nasa.gov/venus/venus-facts" },
      { label: "NASA solar-system temperatures", url: "https://science.nasa.gov/solar-system/temperatures-across-our-solar-system/" },
      { label: "NASA Space Place", url: "https://spaceplace.nasa.gov/" },
    ],
    samples: ["Venus", "Mars", "Stephenson 2-18", "Black Hole"],
  },
};

export const topicCatalog: Record<Exclude<TopicId, "mixed">, {
  label: string;
  eyebrow: string;
  roundLabel: string;
}> = Object.fromEntries(topicIds.map((id) => [id, {
  label: topicPacks[id].label,
  eyebrow: topicPacks[id].eyebrow,
  roundLabel: topicPacks[id].roundLabel,
}])) as Record<KnowledgeTopic, { label: string; eyebrow: string; roundLabel: string }>;

export const topicOptions: { id: TopicId; label: string; eyebrow: string }[] = [
  { id: "mixed", label: "Mix it up", eyebrow: "All labs" },
  ...topicIds.map((id) => ({ id, label: topicCatalog[id].label, eyebrow: topicCatalog[id].eyebrow })),
];

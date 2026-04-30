export type TopicId = "peppers" | "buildings" | "mixed";
export type Difficulty = 1 | 2 | 3;
export type HeatBand = "mild" | "medium" | "hot" | "very hot";

export type Pepper = {
  id: string;
  name: string;
  heat: HeatBand;
  shuMin: number;
  shuMax: number;
  color: string;
  image: string;
  imageCredit: string;
  fact: string;
};

export type Building = {
  id: string;
  name: string;
  city: string;
  country: string;
  heightFt: number;
  floors?: number;
  status: "finished" | "under construction";
  image: string;
  imageCredit: string;
  fact: string;
};

export const heatBands: HeatBand[] = ["mild", "medium", "hot", "very hot"];

export const peppers: Pepper[] = [
  {
    id: "bell-pepper",
    name: "Bell Pepper",
    heat: "mild",
    shuMin: 0,
    shuMax: 0,
    color: "red",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Red_Bell_Pepper.jpg?width=900",
    imageCredit: "Bambi Cia, Wikimedia Commons",
    fact: "Bell peppers have 0 Scoville Heat Units. They are sweet, not spicy.",
  },
  {
    id: "poblano",
    name: "Poblano",
    heat: "mild",
    shuMin: 1000,
    shuMax: 2000,
    color: "dark green",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Poblano_Pepper.jpg?width=900",
    imageCredit: "stef yau, Wikimedia Commons",
    fact: "Poblanos are gentle peppers often used for chile relleno.",
  },
  {
    id: "jalapeno",
    name: "Jalapeno",
    heat: "medium",
    shuMin: 2500,
    shuMax: 8000,
    color: "green",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jalape%C3%B1o.jpg?width=900",
    imageCredit: "Eric Polk, Wikimedia Commons",
    fact: "A jalapeno is a good middle pepper: spicy enough to notice, but not a super-hot.",
  },
  {
    id: "serrano",
    name: "Serrano",
    heat: "medium",
    shuMin: 10000,
    shuMax: 23000,
    color: "green",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Serrano_peppers.jpg?width=900",
    imageCredit: "Wikimedia Commons",
    fact: "Serranos are usually hotter than jalapenos.",
  },
  {
    id: "cayenne",
    name: "Cayenne",
    heat: "hot",
    shuMin: 30000,
    shuMax: 50000,
    color: "red",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cayenne_pepper_1.JPG?width=900",
    imageCredit: "Andrew Dalby, Wikimedia Commons",
    fact: "Cayenne peppers are often dried and ground into red pepper powder.",
  },
  {
    id: "habanero",
    name: "Habanero",
    heat: "hot",
    shuMin: 100000,
    shuMax: 350000,
    color: "orange",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Habanero_pepper_01.jpg?width=900",
    imageCredit: "Zhayon, Wikimedia Commons",
    fact: "Habaneros are small, fruity, and much hotter than jalapenos.",
  },
  {
    id: "ghost-pepper",
    name: "Ghost Pepper",
    heat: "very hot",
    shuMin: 855000,
    shuMax: 1041427,
    color: "red",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ghost_Pepper_%28_Bhut_Jolokia_%29.jpg?width=900",
    imageCredit: "Rumi Borah, Wikimedia Commons",
    fact: "Ghost peppers were once famous as the world's hottest pepper.",
  },
  {
    id: "carolina-reaper",
    name: "Carolina Reaper",
    heat: "very hot",
    shuMin: 1400000,
    shuMax: 2200000,
    color: "red",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Carolina_Reaper.jpg?width=900",
    imageCredit: "Peroli Udhayakumar, Wikimedia Commons",
    fact: "The Carolina Reaper is a super-hot pepper with a wrinkly red shape.",
  },
];

export const buildings: Building[] = [
  {
    id: "burj-khalifa",
    name: "Burj Khalifa",
    city: "Dubai",
    country: "United Arab Emirates",
    heightFt: 2717,
    floors: 163,
    status: "finished",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Burj_Khalifa.jpg?width=900",
    imageCredit: "Wikimedia Commons",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Merdeka_118_May_2024.jpg?width=900",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Shanghai_Tower.jpg?width=900",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Abraj-al-Bait-Towers.JPG?width=900",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ping_An_Finance_Center_2020.jpg?width=900",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lotte_World_Tower_Seoul_Sky.jpg?width=900",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/One_World_Trade_Center_May_2015.jpg?width=900",
    imageCredit: "Wikimedia Commons",
    fact: "One World Trade Center is 1,776 feet tall, matching the year 1776.",
  },
  {
    id: "jeddah-tower",
    name: "Jeddah Tower",
    city: "Jeddah",
    country: "Saudi Arabia",
    heightFt: 3281,
    floors: 167,
    status: "under construction",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jeddah_Tower_2021.jpg?width=900",
    imageCredit: "Wikimedia Commons",
    fact: "Jeddah Tower is planned to be more than 3,000 feet tall when finished.",
  },
];

export const sourceNotes = [
  "Pepper heat ranges are seeded from PepperScale-style Scoville ranges and common pepper references.",
  "Tall building heights use architectural height in feet; current rankings checked against 2026 tall-building summaries.",
  "Images are loaded from Wikimedia Commons where possible, with credits shown inside the app.",
];

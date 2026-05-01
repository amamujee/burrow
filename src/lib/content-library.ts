export type LibrarySource = {
  id: string;
  label: string;
  url: string;
  note: string;
};

export type PepperLibraryEntry = {
  id: string;
  name: string;
  species: string;
  heatRange: string;
  heatLevel: string;
  sourceUrl: string;
};

export type SharkLibraryEntry = {
  id: string;
  name: string;
  scientificName: string;
  genus: string;
  conservationStatus: string;
  sourceUrl: string;
};

export type BuildingLibraryEntry = {
  id: string;
  name: string;
  city: string;
  country: string;
  heightMeters: number;
  heightFeet: number;
  sourceUrl: string;
};

export type JetLibraryEntry = {
  id: string;
  name: string;
  country: string;
  category: string;
  sourceUrl: string;
};

export const contentLibrarySources: LibrarySource[] = [
  {
    id: "wikipepper",
    label: "WikiPepper pepper database",
    url: "https://wikipepper.org/peppers",
    note: "Community pepper encyclopedia listing 5,500+ named Capsicum varieties with species and heat metadata.",
  },
  {
    id: "wikidata-sharks",
    label: "Wikidata shark taxonomy",
    url: "https://query.wikidata.org/",
    note: "Structured taxon records under the shark clade, including species labels, taxon names, parent genera, and conservation links when present.",
  },
  {
    id: "wikidata-buildings",
    label: "Wikidata skyscraper records",
    url: "https://query.wikidata.org/",
    note: "Structured skyscraper records with normalized height statements, city, country, and entity source pages.",
  },
  {
    id: "ctbuh",
    label: "CTBUH tall-building criteria",
    url: "https://www.ctbuh.org/HighRiseInfo/TallestDatabase/Criteria/tabid/446/language/en-US/Default.aspx",
    note: "The Council on Tall Buildings and Urban Habitat defines tall, supertall, and megatall building measurement standards.",
  },
  {
    id: "wikidata-aircraft",
    label: "Wikidata military aircraft records",
    url: "https://query.wikidata.org/",
    note: "Structured aircraft records with country, manufacturer, aircraft role, and source pages.",
  },
  {
    id: "wikimedia-aircraft",
    label: "Wikimedia Commons aircraft media",
    url: "https://commons.wikimedia.org/wiki/Category:Military_aircraft",
    note: "Open aircraft photography used for the playable jet cards.",
  },
];

export const pepperLibrary = [
  {
    "id": "007-pot-red",
    "name": "007 Pot Red",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,200,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/007-pot-red"
  },
  {
    "id": "11176-mutant",
    "name": "11176 Mutant",
    "species": "C. annuum",
    "heatRange": "10,000-21,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/11176-mutant"
  },
  {
    "id": "116-black-rib",
    "name": "116 Black Rib",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/116-black-rib"
  },
  {
    "id": "14776-mutant",
    "name": "14776 Mutant",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/14776-mutant"
  },
  {
    "id": "215-hot-pepperoncini",
    "name": "215 Hot Pepperoncini",
    "species": "C. annuum",
    "heatRange": "1,000-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/215-hot-pepperoncini"
  },
  {
    "id": "3m-shu-dd",
    "name": "3M SHU DD",
    "species": "C. chinense",
    "heatRange": "1,000,000-3,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/3m-shu-dd"
  },
  {
    "id": "3m-shu-dd-orange",
    "name": "3M SHU DD Orange",
    "species": "C. chinense",
    "heatRange": "1,000,000-3,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/3m-shu-dd-orange"
  },
  {
    "id": "7-pot",
    "name": "7 Pot",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot"
  },
  {
    "id": "7-pot-apocalypse-caramel",
    "name": "7 Pot Apocalypse Caramel",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-apocalypse-caramel"
  },
  {
    "id": "7-pot-barrackpore",
    "name": "7 Pot Barrackpore",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-barrackpore"
  },
  {
    "id": "7-pot-barrackpore-chocolate",
    "name": "7 Pot Barrackpore Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-barrackpore-chocolate"
  },
  {
    "id": "7-pot-bbg-mamp-purple",
    "name": "7 Pot BBG MAMP Purple",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bbg-mamp-purple"
  },
  {
    "id": "7-pot-bbg-white",
    "name": "7 Pot BBG White",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bbg-white"
  },
  {
    "id": "7-pot-brainstrain",
    "name": "7 Pot Brainstrain",
    "species": "C. chinense",
    "heatRange": "500,000-1,100,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-brainstrain"
  },
  {
    "id": "7-pot-brainstrain-chocolate",
    "name": "7 Pot Brainstrain Chocolate",
    "species": "C. chinense",
    "heatRange": "500,000-1,100,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-brainstrain-chocolate"
  },
  {
    "id": "7-pot-brainstrain-yellow",
    "name": "7 Pot Brainstrain Yellow",
    "species": "C. chinense",
    "heatRange": "500,000-1,100,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-brainstrain-yellow"
  },
  {
    "id": "7-pot-bubblegum",
    "name": "7 Pot Bubblegum",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum"
  },
  {
    "id": "7-pot-bubblegum-alchemy",
    "name": "7 Pot Bubblegum Alchemy",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-alchemy"
  },
  {
    "id": "7-pot-bubblegum-apocalypse",
    "name": "7 Pot Bubblegum Apocalypse",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-apocalypse"
  },
  {
    "id": "7-pot-bubblegum-armageddon-black",
    "name": "7 Pot Bubblegum Armageddon Black",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-armageddon-black"
  },
  {
    "id": "7-pot-bubblegum-blood-orange",
    "name": "7 Pot Bubblegum Blood Orange",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-blood-orange"
  },
  {
    "id": "7-pot-bubblegum-brown",
    "name": "7 Pot Bubblegum Brown",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-brown"
  },
  {
    "id": "7-pot-bubblegum-caramel",
    "name": "7 Pot Bubblegum Caramel",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-caramel"
  },
  {
    "id": "7-pot-bubblegum-chocolate-long-no-calyx",
    "name": "7 Pot Bubblegum Chocolate Long No Calyx",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-chocolate-long-no-calyx"
  },
  {
    "id": "7-pot-bubblegum-cotton-candy",
    "name": "7 Pot Bubblegum Cotton Candy",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-cotton-candy"
  },
  {
    "id": "7-pot-bubblegum-dystopia",
    "name": "7 Pot Bubblegum Dystopia",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-dystopia"
  },
  {
    "id": "7-pot-bubblegum-elongated",
    "name": "7 Pot Bubblegum Elongated",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-elongated"
  },
  {
    "id": "7-pot-bubblegum-frankenstein",
    "name": "7 Pot Bubblegum Frankenstein",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-frankenstein"
  },
  {
    "id": "7-pot-bubblegum-frankenstein-chocolate",
    "name": "7 Pot Bubblegum Frankenstein Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-frankenstein-chocolate"
  },
  {
    "id": "7-pot-bubblegum-ghost",
    "name": "7 Pot Bubblegum Ghost",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-ghost"
  },
  {
    "id": "7-pot-bubblegum-ghost-chocolate-no-calyx",
    "name": "7 Pot Bubblegum Ghost Chocolate No Calyx",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-ghost-chocolate-no-calyx"
  },
  {
    "id": "7-pot-bubblegum-mamp",
    "name": "7 Pot Bubblegum MAMP",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-mamp"
  },
  {
    "id": "7-pot-bubblegum-mamp-black",
    "name": "7 Pot Bubblegum MAMP Black",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-mamp-black"
  },
  {
    "id": "7-pot-bubblegum-mamp-orange",
    "name": "7 Pot Bubblegum MAMP Orange",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-mamp-orange"
  },
  {
    "id": "7-pot-bubblegum-mamp-peach",
    "name": "7 Pot Bubblegum MAMP Peach",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-mamp-peach"
  },
  {
    "id": "7-pot-bubblegum-mamp-xxl-red-pheno",
    "name": "7 Pot Bubblegum MAMP XXL Red Pheno",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-mamp-xxl-red-pheno"
  },
  {
    "id": "7-pot-bubblegum-midnight",
    "name": "7 Pot Bubblegum Midnight",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-midnight"
  },
  {
    "id": "7-pot-bubblegum-multicolor",
    "name": "7 Pot Bubblegum Multicolor",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-multicolor"
  },
  {
    "id": "7-pot-bubblegum-naga-golt-arizona",
    "name": "7 Pot Bubblegum Naga Golt Arizona",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-naga-golt-arizona"
  },
  {
    "id": "7-pot-bubblegum-orange",
    "name": "7 Pot Bubblegum Orange",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-orange"
  },
  {
    "id": "7-pot-bubblegum-orange-peach",
    "name": "7 Pot Bubblegum Orange Peach",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-orange-peach"
  },
  {
    "id": "7-pot-bubblegum-orange-purple-flower",
    "name": "7 Pot Bubblegum Orange Purple Flower",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-orange-purple-flower"
  },
  {
    "id": "7-pot-bubblegum-peach",
    "name": "7 Pot Bubblegum Peach",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-peach"
  },
  {
    "id": "7-pot-bubblegum-pink",
    "name": "7 Pot Bubblegum Pink",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-pink"
  },
  {
    "id": "7-pot-bubblegum-pink-tiger",
    "name": "7 Pot Bubblegum Pink Tiger",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-pink-tiger"
  },
  {
    "id": "7-pot-bubblegum-pumpkin",
    "name": "7 Pot Bubblegum Pumpkin",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-pumpkin"
  },
  {
    "id": "7-pot-bubblegum-purple",
    "name": "7 Pot Bubblegum Purple",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-purple"
  },
  {
    "id": "7-pot-bubblegum-red-gold",
    "name": "7 Pot Bubblegum Red Gold",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-red-gold"
  },
  {
    "id": "7-pot-bubblegum-roughrider-red",
    "name": "7 Pot Bubblegum Roughrider Red",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-roughrider-red"
  },
  {
    "id": "7-pot-bubblegum-scorpion",
    "name": "7 Pot Bubblegum Scorpion",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-scorpion"
  },
  {
    "id": "7-pot-bubblegum-strawberry",
    "name": "7 Pot Bubblegum Strawberry",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-strawberry"
  },
  {
    "id": "7-pot-bubblegum-truffle",
    "name": "7 Pot Bubblegum Truffle",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-truffle"
  },
  {
    "id": "7-pot-bubblegum-white",
    "name": "7 Pot Bubblegum White",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-white"
  },
  {
    "id": "7-pot-bubblegum-white-lotus",
    "name": "7 Pot Bubblegum White Lotus",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-white-lotus"
  },
  {
    "id": "7-pot-bubblegum-drax-diego-dream",
    "name": "7 Pot Bubblegum × Drax Diego Dream",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-x-drax-diego-dream"
  },
  {
    "id": "7-pot-bubblegum-moruga-blend",
    "name": "7 Pot Bubblegum × Moruga Blend",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-x-moruga-blend"
  },
  {
    "id": "7-pot-bubblegum-srtsl-orange",
    "name": "7 Pot Bubblegum × SRTSL Orange",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-x-srtsl-orange"
  },
  {
    "id": "7-pot-bubblegum-srtsl-peach",
    "name": "7 Pot Bubblegum × SRTSL Peach",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-x-srtsl-peach"
  },
  {
    "id": "7-pot-bubblegum-yellow",
    "name": "7 Pot Bubblegum Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-bubblegum-yellow"
  },
  {
    "id": "7-pot-burgundy",
    "name": "7 Pot Burgundy",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-burgundy"
  },
  {
    "id": "7-pot-cajun-craze",
    "name": "7 Pot Cajun Craze",
    "species": "C. chinense",
    "heatRange": "500,000-1,100,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-cajun-craze"
  },
  {
    "id": "7-pot-caramel",
    "name": "7 Pot Caramel",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-caramel"
  },
  {
    "id": "7-pot-chaguanas",
    "name": "7 Pot Chaguanas",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-chaguanas"
  },
  {
    "id": "7-pot-chaguanas-chocolate",
    "name": "7 Pot Chaguanas Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-chaguanas-chocolate"
  },
  {
    "id": "7-pot-chaguanas-yellow",
    "name": "7 Pot Chaguanas Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-chaguanas-yellow"
  },
  {
    "id": "7-pot-chocolate",
    "name": "7 Pot Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-chocolate"
  },
  {
    "id": "7-pot-cinder",
    "name": "7 Pot Cinder",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-cinder"
  },
  {
    "id": "7-pot-congo",
    "name": "7 Pot Congo",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-congo"
  },
  {
    "id": "7-pot-congo-chocolate",
    "name": "7 Pot Congo Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-congo-chocolate"
  },
  {
    "id": "7-pot-congo-sr-gigantic-red",
    "name": "7 Pot Congo SR Gigantic Red",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-congo-sr-gigantic-red"
  },
  {
    "id": "7-pot-congo-sr-gigantic-trinidad",
    "name": "7 Pot Congo SR Gigantic Trinidad",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-congo-sr-gigantic-trinidad"
  },
  {
    "id": "7-pot-congo-sr-gigantic-yellow",
    "name": "7 Pot Congo SR Gigantic Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-congo-sr-gigantic-yellow"
  },
  {
    "id": "7-pot-douglah",
    "name": "7 Pot Douglah",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-douglah"
  },
  {
    "id": "7-pot-douglah-chocolate",
    "name": "7 Pot Douglah Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-douglah-chocolate"
  },
  {
    "id": "7-pot-douglah-red",
    "name": "7 Pot Douglah Red",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-douglah-red"
  },
  {
    "id": "7-pot-douglah-yellow",
    "name": "7 Pot Douglah Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-douglah-yellow"
  },
  {
    "id": "7-pot-evergreen",
    "name": "7 Pot Evergreen",
    "species": "C. chinense",
    "heatRange": "600,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-evergreen"
  },
  {
    "id": "7-pot-gigantic-chocolate",
    "name": "7 Pot Gigantic Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-gigantic-chocolate"
  },
  {
    "id": "7-pot-gigantic-congo-sr",
    "name": "7 Pot Gigantic Congo SR",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-gigantic-congo-sr"
  },
  {
    "id": "7-pot-infinity",
    "name": "7 Pot Infinity",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-infinity"
  },
  {
    "id": "7-pot-jonah",
    "name": "7 Pot Jonah",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-jonah"
  },
  {
    "id": "7-pot-jonah-orange",
    "name": "7 Pot Jonah Orange",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-jonah-orange"
  },
  {
    "id": "7-pot-jonah-pimenta-da-neyde",
    "name": "7 Pot Jonah × Pimenta Da Neyde",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-jonah-x-pimenta-da-neyde"
  },
  {
    "id": "7-pot-jonah-trinidad-dougla-junglerain",
    "name": "7 Pot Jonah × Trinidad Dougla Junglerain",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-jonah-x-trinidad-dougla-junglerain"
  },
  {
    "id": "7-pot-jonah-trinidad-scorpion-chocolate",
    "name": "7 Pot Jonah × Trinidad Scorpion Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-jonah-x-trinidad-scorpion-chocolate"
  },
  {
    "id": "7-pot-katie",
    "name": "7 Pot Katie",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-katie"
  },
  {
    "id": "7-pot-lava",
    "name": "7 Pot Lava",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lava"
  },
  {
    "id": "7-pot-lava-chocolate",
    "name": "7 Pot Lava Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lava-chocolate"
  },
  {
    "id": "7-pot-lava-scorpion",
    "name": "7 Pot Lava × Scorpion",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lava-x-scorpion"
  },
  {
    "id": "7-pot-lava-scorpion-orange",
    "name": "7 Pot Lava × Scorpion Orange",
    "species": "C. chinense",
    "heatRange": "1,000,000-1,500,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lava-x-scorpion-orange"
  },
  {
    "id": "7-pot-lava-yellow",
    "name": "7 Pot Lava Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lava-yellow"
  },
  {
    "id": "7-pot-lemon",
    "name": "7 Pot Lemon",
    "species": "C. chinense",
    "heatRange": "500,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lemon"
  },
  {
    "id": "7-pot-lobotomy-peach",
    "name": "7 Pot Lobotomy Peach",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lobotomy-peach"
  },
  {
    "id": "7-pot-lobotomy-yellow",
    "name": "7 Pot Lobotomy Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lobotomy-yellow"
  },
  {
    "id": "7-pot-lucy",
    "name": "7 Pot Lucy",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-lucy"
  },
  {
    "id": "7-pot-madballz",
    "name": "7 Pot Madballz",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-madballz"
  },
  {
    "id": "7-pot-madballz-chocolate",
    "name": "7 Pot Madballz Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-madballz-chocolate"
  },
  {
    "id": "7-pot-merlot",
    "name": "7 Pot Merlot",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-merlot"
  },
  {
    "id": "7-pot-mustard",
    "name": "7 Pot Mustard",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-mustard"
  },
  {
    "id": "7-pot-nebru",
    "name": "7 Pot Nebru",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-nebru"
  },
  {
    "id": "7-pot-orange",
    "name": "7 Pot Orange",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-orange"
  },
  {
    "id": "7-pot-orange-sr-gigantic",
    "name": "7 Pot Orange SR Gigantic",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-orange-sr-gigantic"
  },
  {
    "id": "7-pot-orange-yellow",
    "name": "7 Pot Orange-Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-orange-yellow"
  },
  {
    "id": "7-pot-peach",
    "name": "7 Pot Peach",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-peach"
  },
  {
    "id": "7-pot-peach-bonnet",
    "name": "7 Pot Peach Bonnet",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-peach-bonnet"
  },
  {
    "id": "7-pot-peanut",
    "name": "7 Pot Peanut",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-peanut"
  },
  {
    "id": "7-pot-pickle-mtp",
    "name": "7 Pot Pickle MTP",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-pickle-mtp"
  },
  {
    "id": "7-pot-pink",
    "name": "7 Pot Pink",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-pink"
  },
  {
    "id": "7-pot-primo",
    "name": "7 Pot Primo",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-primo"
  },
  {
    "id": "7-pot-primo-chocolate-reaper",
    "name": "7 Pot Primo Chocolate Reaper",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-primo-chocolate-reaper"
  },
  {
    "id": "7-pot-primo-heatless",
    "name": "7 Pot Primo Heatless",
    "species": "C. chinense",
    "heatRange": "0-100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-primo-heatless"
  },
  {
    "id": "7-pot-primo-orange",
    "name": "7 Pot Primo Orange",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-primo-orange"
  },
  {
    "id": "7-pot-primo-sweet",
    "name": "7 Pot Primo Sweet",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-primo-sweet"
  },
  {
    "id": "7-pot-primo-trinidad-scorpion-butch-t",
    "name": "7 Pot Primo × Trinidad Scorpion Butch T",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-primo-x-trinidad-scorpion-butch-t"
  },
  {
    "id": "7-pot-primo-yellow",
    "name": "7 Pot Primo Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-primo-yellow"
  },
  {
    "id": "7-pot-purplegum",
    "name": "7 Pot Purplegum",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-purplegum"
  },
  {
    "id": "7-pot-rennie",
    "name": "7 Pot Rennie",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-rennie"
  },
  {
    "id": "7-pot-rennie-chocolate",
    "name": "7 Pot Rennie Chocolate",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-rennie-chocolate"
  },
  {
    "id": "7-pot-rusty",
    "name": "7 Pot Rusty",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-rusty"
  },
  {
    "id": "7-pot-savannah",
    "name": "7 Pot Savannah",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-savannah"
  },
  {
    "id": "7-pot-savannah-yellow",
    "name": "7 Pot Savannah Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-savannah-yellow"
  },
  {
    "id": "7-pot-savannah-yellow-scotch-bonnet",
    "name": "7 Pot Savannah Yellow × Scotch Bonnet",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-savannah-yellow-x-scotch-bonnet"
  },
  {
    "id": "7-pot-skin-peach",
    "name": "7 Pot Skin Peach",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-skin-peach"
  },
  {
    "id": "7-pot-slimer",
    "name": "7 Pot Slimer",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-slimer"
  },
  {
    "id": "7-pot-sr-strain",
    "name": "7 Pot SR Strain",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-sr-strain"
  },
  {
    "id": "7-pot-wes",
    "name": "7 Pot Wes",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-wes"
  },
  {
    "id": "7-pot-white",
    "name": "7 Pot White",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-white"
  },
  {
    "id": "7-pot-white-bubblegum",
    "name": "7 Pot White × Bubblegum",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-white-x-bubblegum"
  },
  {
    "id": "7-pot-trinidad-scorpion",
    "name": "7 Pot × Trinidad Scorpion",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-x-trinidad-scorpion"
  },
  {
    "id": "7-pot-yellow",
    "name": "7 Pot Yellow",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-yellow"
  },
  {
    "id": "7-pot-yellow-brain-strain",
    "name": "7 Pot Yellow Brain Strain",
    "species": "C. chinense",
    "heatRange": "800,000-1,300,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-yellow-brain-strain"
  },
  {
    "id": "7-pot-yellow-hippy-strain",
    "name": "7 Pot Yellow Hippy Strain",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-yellow-hippy-strain"
  },
  {
    "id": "7-pot-yellow-bhut-indian-carbon",
    "name": "7 Pot Yellow × Bhut Indian Carbon",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-yellow-x-bhut-indian-carbon"
  },
  {
    "id": "7-pot-yellow-orange",
    "name": "7 Pot Yellow/Orange",
    "species": "C. chinense",
    "heatRange": "400,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-pot-yellow-orange"
  },
  {
    "id": "7-potish",
    "name": "7 Potish",
    "species": "C. chinense",
    "heatRange": "800,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/7-potish"
  },
  {
    "id": "abchazskij-ostruyi",
    "name": "Abchazskij Ostruyi",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/abchazskij-ostruyi"
  },
  {
    "id": "abiquiu",
    "name": "Abiquiu",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/abiquiu"
  },
  {
    "id": "abyss-chocolate",
    "name": "Abyss Chocolate",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/abyss-chocolate"
  },
  {
    "id": "acapulco-purple",
    "name": "Acapulco Purple",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/acapulco-purple"
  },
  {
    "id": "ace",
    "name": "Ace",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ace"
  },
  {
    "id": "aceituno",
    "name": "Aceituno",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aceituno"
  },
  {
    "id": "achard",
    "name": "Achard",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/achard"
  },
  {
    "id": "aci-kil",
    "name": "Aci Kil",
    "species": "C. annuum",
    "heatRange": "3,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aci-kil"
  },
  {
    "id": "aci-sivri",
    "name": "Aci Sivri",
    "species": "C. annuum",
    "heatRange": "3,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aci-sivri"
  },
  {
    "id": "aci-sivri-jalapeno",
    "name": "Aci Sivri × Jalapeño",
    "species": "C. annuum",
    "heatRange": "2,500-8,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aci-sivri-x-jalape-o"
  },
  {
    "id": "acolarimento",
    "name": "Acolarimento",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/acolarimento"
  },
  {
    "id": "acoma",
    "name": "Acoma",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/acoma"
  },
  {
    "id": "aconcagua",
    "name": "Aconcagua",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aconcagua"
  },
  {
    "id": "adjuma",
    "name": "Adjuma",
    "species": "C. chinense",
    "heatRange": "100,000-500,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/adjuma"
  },
  {
    "id": "adjuma-yellow",
    "name": "Adjuma Yellow",
    "species": "C. chinense",
    "heatRange": "100,000-500,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/adjuma-yellow"
  },
  {
    "id": "admiral-sweet",
    "name": "Admiral Sweet",
    "species": "C. annuum",
    "heatRange": "100-500 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/admiral-sweet"
  },
  {
    "id": "adorno",
    "name": "Adorno",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/adorno"
  },
  {
    "id": "adrenalina",
    "name": "Adrenalina",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/adrenalina"
  },
  {
    "id": "adrenalina-caramel",
    "name": "Adrenalina Caramel",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/adrenalina-caramel"
  },
  {
    "id": "adrenalina-red",
    "name": "Adrenalina Red",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/adrenalina-red"
  },
  {
    "id": "afghan",
    "name": "Afghan",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/afghan"
  },
  {
    "id": "african-bird",
    "name": "African Bird",
    "species": "C. frutescens",
    "heatRange": "50,000-175,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/african-bird"
  },
  {
    "id": "african-bird-orange",
    "name": "African Bird Orange",
    "species": "C. annuum",
    "heatRange": "50,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/african-bird-orange"
  },
  {
    "id": "african-devil",
    "name": "African Devil",
    "species": "C. frutescens",
    "heatRange": "40,000-120,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/african-devil"
  },
  {
    "id": "african-fish",
    "name": "African Fish",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/african-fish"
  },
  {
    "id": "african-pequin",
    "name": "African Pequín",
    "species": "C. annuum",
    "heatRange": "40,000-60,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/african-pequ-n"
  },
  {
    "id": "african-pequin-yellow",
    "name": "African Pequín Yellow",
    "species": "C. annuum",
    "heatRange": "40,000-60,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/african-pequ-n-yellow"
  },
  {
    "id": "africansk",
    "name": "Africansk",
    "species": "C. frutescens",
    "heatRange": "25,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/africansk"
  },
  {
    "id": "afterglow",
    "name": "Afterglow",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/afterglow"
  },
  {
    "id": "agartha",
    "name": "Agartha",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/agartha"
  },
  {
    "id": "agata-s-tongue",
    "name": "Agata's Tongue",
    "species": "C. annuum",
    "heatRange": "~500 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/agata-s-tongue"
  },
  {
    "id": "agnetto",
    "name": "Agnetto",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/agnetto"
  },
  {
    "id": "agnetto-gold-thick",
    "name": "Agnetto Gold Thick",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/agnetto-gold-thick"
  },
  {
    "id": "agni-green",
    "name": "Agni Green",
    "species": "C. annuum",
    "heatRange": "20,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/agni-green"
  },
  {
    "id": "agronaldo-di-asti",
    "name": "Agronaldo di Asti",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/agronaldo-di-asti"
  },
  {
    "id": "agua-blanca",
    "name": "Agua Blanca",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/agua-blanca"
  },
  {
    "id": "aji-ajuicybana",
    "name": "Aji Ajuicybana",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-ajuicybana"
  },
  {
    "id": "aji-amarillo",
    "name": "Aji Amarillo",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-amarillo"
  },
  {
    "id": "aji-angelo",
    "name": "Aji Angelo",
    "species": "C. baccatum",
    "heatRange": "4,000-6,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-angelo"
  },
  {
    "id": "aji-apricot",
    "name": "Aji Apricot",
    "species": "C. baccatum",
    "heatRange": "15,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-apricot"
  },
  {
    "id": "aji-arnaucho",
    "name": "Aji Arnaucho",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-arnaucho"
  },
  {
    "id": "aji-arnaucho-amarillo-yellow",
    "name": "Aji Arnaucho Amarillo Yellow",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-arnaucho-amarillo-yellow"
  },
  {
    "id": "aji-arnaucho-morado-white-paste",
    "name": "Aji Arnaucho Morado White Paste",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-arnaucho-morado-white-paste"
  },
  {
    "id": "aji-arrugada",
    "name": "Aji Arrugada",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-arrugada"
  },
  {
    "id": "aji-ayucllo",
    "name": "Aji Ayucllo",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-ayucllo"
  },
  {
    "id": "aji-ayuyo",
    "name": "Aji Ayuyo",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-ayuyo"
  },
  {
    "id": "aji-ayuyo-purple",
    "name": "Aji Ayuyo Purple",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-ayuyo-purple"
  },
  {
    "id": "aji-banana",
    "name": "Aji Banana",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-banana"
  },
  {
    "id": "aji-benito",
    "name": "Aji Benito",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-benito"
  },
  {
    "id": "aji-bird",
    "name": "Aji Bird",
    "species": "C. frutescens",
    "heatRange": "50,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-bird"
  },
  {
    "id": "aji-bird-baby",
    "name": "Aji Bird Baby",
    "species": "C. frutescens",
    "heatRange": "50,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-bird-baby"
  },
  {
    "id": "aji-blacareta",
    "name": "Aji Blacareta",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-blacareta"
  },
  {
    "id": "aji-blacareta-brown-vallegrande",
    "name": "Aji Blacareta Brown Vallegrande",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-blacareta-brown-vallegrande"
  },
  {
    "id": "aji-bodysnatcher",
    "name": "Aji Bodysnatcher",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-bodysnatcher"
  },
  {
    "id": "aji-bolivian",
    "name": "Aji Bolivian",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-bolivian"
  },
  {
    "id": "aji-bolsa-de-dulce",
    "name": "Aji Bolsa de Dulce",
    "species": "C. baccatum",
    "heatRange": "100-500 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-bolsa-de-dulce"
  },
  {
    "id": "aji-bravo",
    "name": "Aji Bravo",
    "species": "C. frutescens",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-bravo"
  },
  {
    "id": "aji-cacho-de-cabra",
    "name": "Aji Cacho de Cabra",
    "species": "C. annuum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cacho-de-cabra"
  },
  {
    "id": "aji-cachuca-habanero",
    "name": "Aji Cachuca × Habanero",
    "species": "C. chinense",
    "heatRange": "100,000-350,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachuca-x-habanero"
  },
  {
    "id": "aji-cachucha",
    "name": "Aji Cachucha",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachucha"
  },
  {
    "id": "aji-cachucha-boriken",
    "name": "Aji Cachucha Boriken",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachucha-boriken"
  },
  {
    "id": "aji-cachucha-boriken-purple",
    "name": "Aji Cachucha Boriken Purple",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachucha-boriken-purple"
  },
  {
    "id": "aji-cachucha-cacique",
    "name": "Aji Cachucha Cacique",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachucha-cacique"
  },
  {
    "id": "aji-cachucha-creole",
    "name": "Aji Cachucha Creole",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachucha-creole"
  },
  {
    "id": "aji-cachucha-purple-splotched",
    "name": "Aji Cachucha Purple Splotched",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachucha-purple-splotched"
  },
  {
    "id": "aji-cachuchon",
    "name": "Aji Cachuchón",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cachuch-n"
  },
  {
    "id": "aji-cajamarca",
    "name": "Aji Cajamarca",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cajamarca"
  },
  {
    "id": "aji-calabaza",
    "name": "Aji Calabaza",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-calabaza"
  },
  {
    "id": "aji-calatenango",
    "name": "Aji Calatenango",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-calatenango"
  },
  {
    "id": "aji-catalan",
    "name": "Aji Catalan",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-catalan"
  },
  {
    "id": "aji-cereo",
    "name": "Aji Céreo",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-c-reo"
  },
  {
    "id": "aji-cereza",
    "name": "Aji Cereza",
    "species": "C. annuum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cereza"
  },
  {
    "id": "aji-challuaruro",
    "name": "Aji Challuaruro",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-challuaruro"
  },
  {
    "id": "aji-challuaruro-amarillo",
    "name": "Aji Challuaruro Amarillo",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-challuaruro-amarillo"
  },
  {
    "id": "aji-champion",
    "name": "Aji Champion",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-champion"
  },
  {
    "id": "aji-charapita",
    "name": "Aji Charapita",
    "species": "C. chinense",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-charapita"
  },
  {
    "id": "aji-charapita-iquitos",
    "name": "Aji Charapita Iquitos",
    "species": "C. chinense",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-charapita-iquitos"
  },
  {
    "id": "aji-charapita-peach",
    "name": "Aji Charapita Peach",
    "species": "C. chinense",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-charapita-peach"
  },
  {
    "id": "aji-charapita-fidalgo-roxa",
    "name": "Aji Charapita × Fidalgo Roxa",
    "species": "C. chinense",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-charapita-x-fidalgo-roxa"
  },
  {
    "id": "aji-charapita-habanada",
    "name": "Aji Charapita × Habanada",
    "species": "C. chinense",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-charapita-x-habanada"
  },
  {
    "id": "aji-charapita-habanada-orange",
    "name": "Aji Charapita × Habanada Orange",
    "species": "C. baccatum × C. chinense",
    "heatRange": "30,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-charapita-x-habanada-orange"
  },
  {
    "id": "aji-charapita-yellow",
    "name": "Aji Charapita Yellow",
    "species": "C. chinense",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-charapita-yellow"
  },
  {
    "id": "aji-chicotillo",
    "name": "Aji Chicotillo",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-chicotillo"
  },
  {
    "id": "aji-chileno",
    "name": "Aji Chileno",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-chileno"
  },
  {
    "id": "aji-chivato",
    "name": "Aji Chivato",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-chivato"
  },
  {
    "id": "aji-chombo",
    "name": "Aji Chombo",
    "species": "C. chinense",
    "heatRange": "100,000-350,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-chombo"
  },
  {
    "id": "aji-churcu",
    "name": "Aji Churcu",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-churcu"
  },
  {
    "id": "aji-cirel",
    "name": "Aji Cirel",
    "species": "C. frutescens",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cirel"
  },
  {
    "id": "aji-cito",
    "name": "Aji Cito",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cito"
  },
  {
    "id": "aji-claudio",
    "name": "Aji Claudio",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-claudio"
  },
  {
    "id": "aji-cochabamba",
    "name": "Aji Cochabamba",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cochabamba"
  },
  {
    "id": "aji-colorado",
    "name": "Aji Colorado",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-colorado"
  },
  {
    "id": "aji-colorado-rojo",
    "name": "Aji Colorado Rojo",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-colorado-rojo"
  },
  {
    "id": "aji-confusion",
    "name": "Aji Confusion",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-confusion"
  },
  {
    "id": "aji-confusion-brazilian-starfish",
    "name": "Aji Confusion × Brazilian Starfish",
    "species": "C. baccatum",
    "heatRange": "10,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-confusion-x-brazilian-starfish"
  },
  {
    "id": "aji-conquistador",
    "name": "Aji Conquistador",
    "species": "C. baccatum",
    "heatRange": "5,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-conquistador"
  },
  {
    "id": "aji-criollo",
    "name": "Aji Criollo",
    "species": "C. frutescens",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-criollo"
  },
  {
    "id": "aji-cristal",
    "name": "Aji Cristal",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-cristal"
  },
  {
    "id": "aji-crystal-variegated",
    "name": "Aji Crystal Variegated",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-crystal-variegated"
  },
  {
    "id": "aji-de-belen",
    "name": "Aji de Belen",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-de-belen"
  },
  {
    "id": "aji-de-boton",
    "name": "Aji de Boton",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-de-boton"
  },
  {
    "id": "aji-de-guioso",
    "name": "Aji de Guioso",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-de-guioso"
  },
  {
    "id": "aji-de-jardin",
    "name": "Aji de Jardin",
    "species": "C. annuum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-de-jardin"
  },
  {
    "id": "aji-de-mesa",
    "name": "Aji de Mesa",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-de-mesa"
  },
  {
    "id": "aji-de-ratan",
    "name": "Aji de Ratan",
    "species": "C. frutescens",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-de-ratan"
  },
  {
    "id": "aji-de-sazonar",
    "name": "Aji de Sazonar",
    "species": "C. frutescens",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-de-sazonar"
  },
  {
    "id": "aji-delight",
    "name": "Aji Delight",
    "species": "C. baccatum",
    "heatRange": "5,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-delight"
  },
  {
    "id": "aji-diablo",
    "name": "Aji Diablo",
    "species": "C. annuum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-diablo"
  },
  {
    "id": "aji-dulce",
    "name": "Aji Dulce",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-dulce"
  },
  {
    "id": "aji-dulce-amarillo",
    "name": "Aji Dulce Amarillo",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-dulce-amarillo"
  },
  {
    "id": "aji-dulce-habanero",
    "name": "Aji Dulce Habanero",
    "species": "C. chinense",
    "heatRange": "100,000-350,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-dulce-habanero"
  },
  {
    "id": "aji-dulce-orange",
    "name": "Aji Dulce Orange",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-dulce-orange"
  },
  {
    "id": "aji-dulce-pepon",
    "name": "Aji Dulce Pepon",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-dulce-pepon"
  },
  {
    "id": "aji-dulce-puerto-rico",
    "name": "Aji Dulce Puerto Rico",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-dulce-puerto-rico"
  },
  {
    "id": "aji-dulce-rojo",
    "name": "Aji Dulce Rojo",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-dulce-rojo"
  },
  {
    "id": "aji-ecuadorian",
    "name": "Aji Ecuadorian",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-ecuadorian"
  },
  {
    "id": "aji-ecuadorian-orange",
    "name": "Aji Ecuadorian Orange",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-ecuadorian-orange"
  },
  {
    "id": "aji-ethiopian-fire",
    "name": "Aji Ethiopian Fire",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-ethiopian-fire"
  },
  {
    "id": "aji-fantasy",
    "name": "Aji Fantasy",
    "species": "C. baccatum",
    "heatRange": "5,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-fantasy"
  },
  {
    "id": "aji-fantasy-apricot",
    "name": "Aji Fantasy Apricot",
    "species": "C. baccatum",
    "heatRange": "2,000-5,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-fantasy-apricot"
  },
  {
    "id": "aji-fantasy-cream",
    "name": "Aji Fantasy Cream",
    "species": "C. baccatum",
    "heatRange": "2,000-5,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-fantasy-cream"
  },
  {
    "id": "aji-fantasy-orange",
    "name": "Aji Fantasy Orange",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-fantasy-orange"
  },
  {
    "id": "aji-fantasy-sparkly",
    "name": "Aji Fantasy Sparkly",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-fantasy-sparkly"
  },
  {
    "id": "aji-fantasy-sparkly-white",
    "name": "Aji Fantasy Sparkly White",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-fantasy-sparkly-white"
  },
  {
    "id": "aji-fantasy-stripey",
    "name": "Aji Fantasy Stripey",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-fantasy-stripey"
  },
  {
    "id": "aji-finlandia",
    "name": "Aji Finlandia",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-finlandia"
  },
  {
    "id": "aji-flor",
    "name": "Aji Flor",
    "species": "C. baccatum",
    "heatRange": "10,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-flor"
  },
  {
    "id": "aji-flor-morado",
    "name": "Aji Flor Morado",
    "species": "C. baccatum",
    "heatRange": "10,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-flor-morado"
  },
  {
    "id": "aji-gold-limon",
    "name": "Aji Gold Limon",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-gold-limon"
  },
  {
    "id": "aji-golden",
    "name": "Aji Golden",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-golden"
  },
  {
    "id": "aji-guaguao",
    "name": "Aji Guaguao",
    "species": "C. frutescens",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-guaguao"
  },
  {
    "id": "aji-gusanito",
    "name": "Aji Gusanito",
    "species": "C. baccatum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-gusanito"
  },
  {
    "id": "aji-guyana",
    "name": "Aji Guyana",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-guyana"
  },
  {
    "id": "aji-habanero",
    "name": "Aji Habanero",
    "species": "C. chinense",
    "heatRange": "5,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-habanero"
  },
  {
    "id": "aji-huanuco",
    "name": "Aji Huanuco",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-huanuco"
  },
  {
    "id": "aji-imbabura",
    "name": "Aji Imbabura",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-imbabura"
  },
  {
    "id": "aji-jamy",
    "name": "Aji Jamy",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-jamy"
  },
  {
    "id": "aji-jobito",
    "name": "Aji Jobito",
    "species": "C. chinense",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-jobito"
  },
  {
    "id": "aji-jobito-dulce",
    "name": "Aji Jobito Dulce",
    "species": "C. chinense",
    "heatRange": "0-100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-jobito-dulce"
  },
  {
    "id": "aji-lemon",
    "name": "Aji Lemon",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-lemon"
  },
  {
    "id": "aji-lemon-balls",
    "name": "Aji Lemon Balls",
    "species": "C. baccatum",
    "heatRange": "15,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-lemon-balls"
  },
  {
    "id": "aji-lemon-drop",
    "name": "Aji Lemon Drop",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-lemon-drop"
  },
  {
    "id": "aji-limo",
    "name": "Aji Limo",
    "species": "C. chinense",
    "heatRange": "50,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-limo"
  },
  {
    "id": "aji-limo-white",
    "name": "Aji Limo White",
    "species": "C. chinense",
    "heatRange": "50,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-limo-white"
  },
  {
    "id": "aji-limo-yellow",
    "name": "Aji Limo Yellow",
    "species": "C. chinense",
    "heatRange": "50,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-limo-yellow"
  },
  {
    "id": "aji-little-finger",
    "name": "Aji Little Finger",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-little-finger"
  },
  {
    "id": "aji-little-finger-orange",
    "name": "Aji Little Finger Orange",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-little-finger-orange"
  },
  {
    "id": "aji-llaneron",
    "name": "Aji Llaneron",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-llaneron"
  },
  {
    "id": "aji-mango",
    "name": "Aji Mango",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-mango"
  },
  {
    "id": "aji-mango-drop",
    "name": "Aji Mango Drop",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-mango-drop"
  },
  {
    "id": "aji-mango-jpgs",
    "name": "Aji Mango × JPGS",
    "species": "C. baccatum × C. chinense",
    "heatRange": "50,000-300,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-mango-x-jpgs"
  },
  {
    "id": "aji-marchant",
    "name": "Aji Marchant",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-marchant"
  },
  {
    "id": "aji-margariteno",
    "name": "Aji Margariteño",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-margarite-o"
  },
  {
    "id": "aji-margariteno-red",
    "name": "Aji Margariteno Red",
    "species": "C. chinense",
    "heatRange": "0-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-margariteno-red"
  },
  {
    "id": "aji-melocoton",
    "name": "Aji Melocoton",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-melocoton"
  },
  {
    "id": "aji-michigan",
    "name": "Aji Michigan",
    "species": "C. baccatum",
    "heatRange": "10,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-michigan"
  },
  {
    "id": "aji-minas-gerais",
    "name": "Aji Minas Gerais",
    "species": "C. chinense",
    "heatRange": "100,000-350,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-minas-gerais"
  },
  {
    "id": "aji-mochero",
    "name": "Aji Mochero",
    "species": "C. chinense",
    "heatRange": "30,000-60,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-mochero"
  },
  {
    "id": "aji-monagre",
    "name": "Aji Monagre",
    "species": "C. annuum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-monagre"
  },
  {
    "id": "aji-monika",
    "name": "Aji Monika",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-monika"
  },
  {
    "id": "aji-mono",
    "name": "Aji Mono",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-mono"
  },
  {
    "id": "aji-norteno",
    "name": "Aji Norteño",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-norte-o"
  },
  {
    "id": "aji-omnicolor",
    "name": "Aji Omnicolor",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-omnicolor"
  },
  {
    "id": "aji-orange",
    "name": "Aji Orange",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-orange"
  },
  {
    "id": "aji-orange-drop",
    "name": "Aji Orange Drop",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-orange-drop"
  },
  {
    "id": "aji-orange-pf",
    "name": "Aji Orange PF",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-orange-pf"
  },
  {
    "id": "aji-orchid",
    "name": "Aji Orchid",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-orchid"
  },
  {
    "id": "aji-pacay",
    "name": "Aji Pacay",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-pacay"
  },
  {
    "id": "aji-panca",
    "name": "Aji Panca",
    "species": "C. baccatum",
    "heatRange": "1,000-1,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-panca"
  },
  {
    "id": "aji-panca-lima",
    "name": "Aji Panca Lima",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-panca-lima"
  },
  {
    "id": "aji-pasco",
    "name": "Aji Pasco",
    "species": "C. frutescens",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-pasco"
  },
  {
    "id": "aji-peach",
    "name": "Aji Peach",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-peach"
  },
  {
    "id": "aji-peanut",
    "name": "Aji Peanut",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-peanut"
  },
  {
    "id": "aji-pen-3-1",
    "name": "Aji Pen 3-1",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-pen-3-1"
  },
  {
    "id": "aji-penec",
    "name": "Aji Penec",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-penec"
  },
  {
    "id": "aji-penec-orange",
    "name": "Aji Penec Orange",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-penec-orange"
  },
  {
    "id": "aji-penec-red",
    "name": "Aji Penec Red",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-penec-red"
  },
  {
    "id": "aji-penec-yellow",
    "name": "Aji Penec Yellow",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-penec-yellow"
  },
  {
    "id": "aji-pequante",
    "name": "Aji Pequante",
    "species": "C. frutescens",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-pequante"
  },
  {
    "id": "aji-peri-peri",
    "name": "Aji Peri Peri",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-peri-peri"
  },
  {
    "id": "aji-peru",
    "name": "Aji Perù",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-per"
  },
  {
    "id": "aji-peru-yellow",
    "name": "Aji Perù Yellow",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-per-yellow"
  },
  {
    "id": "aji-peruvian",
    "name": "Aji Peruvian",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-peruvian"
  },
  {
    "id": "aji-picante",
    "name": "Aji Picante",
    "species": "C. annuum",
    "heatRange": "30,000-80,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-picante"
  },
  {
    "id": "aji-picante-venezuela",
    "name": "Aji Picante Venezuela",
    "species": "C. annuum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-picante-venezuela"
  },
  {
    "id": "aji-pilange",
    "name": "Aji Pilange",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-pilange"
  },
  {
    "id": "aji-pineapple",
    "name": "Aji Pineapple",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-pineapple"
  },
  {
    "id": "aji-piura",
    "name": "Aji Piura",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-piura"
  },
  {
    "id": "aji-pucomucho",
    "name": "Aji Pucomucho",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-pucomucho"
  },
  {
    "id": "aji-rainforest",
    "name": "Aji Rainforest",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-rainforest"
  },
  {
    "id": "aji-red",
    "name": "Aji Red",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-red"
  },
  {
    "id": "aji-rico",
    "name": "Aji Rico",
    "species": "C. baccatum",
    "heatRange": "1,000-5,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-rico"
  },
  {
    "id": "aji-rojo",
    "name": "Aji Rojo",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-rojo"
  },
  {
    "id": "aji-rojo-pf",
    "name": "Aji Rojo PF",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-rojo-pf"
  },
  {
    "id": "aji-rosita",
    "name": "Aji Rosita",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-rosita"
  },
  {
    "id": "aji-rosita-dulce",
    "name": "Aji Rosita Dulce",
    "species": "C. chinense",
    "heatRange": "0-800 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-rosita-dulce"
  },
  {
    "id": "aji-rurrenabaque",
    "name": "Aji Rurrenabaque",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-rurrenabaque"
  },
  {
    "id": "aji-russian",
    "name": "Aji Russian",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-russian"
  },
  {
    "id": "aji-russian-yellow",
    "name": "Aji Russian Yellow",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-russian-yellow"
  },
  {
    "id": "aji-santa-cruz",
    "name": "Aji Santa Cruz",
    "species": "C. baccatum",
    "heatRange": "300-5,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-santa-cruz"
  },
  {
    "id": "aji-santa-rosa",
    "name": "Aji Santa Rosa",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-santa-rosa"
  },
  {
    "id": "aji-santa-rosa-blanco",
    "name": "Aji Santa Rosa Blanco",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-santa-rosa-blanco"
  },
  {
    "id": "aji-serranito",
    "name": "Aji Serranito",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-serranito"
  },
  {
    "id": "aji-sopa-puerto-rico",
    "name": "Aji Sopa Puerto Rico",
    "species": "C. baccatum",
    "heatRange": "5,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-sopa-puerto-rico"
  },
  {
    "id": "aji-strawberry-drop",
    "name": "Aji Strawberry Drop",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-strawberry-drop"
  },
  {
    "id": "aji-tamarindo",
    "name": "Aji Tamarindo",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-tamarindo"
  },
  {
    "id": "aji-tapachula",
    "name": "Aji Tapachula",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-tapachula"
  },
  {
    "id": "aji-umba",
    "name": "Aji Umba",
    "species": "C. chinense",
    "heatRange": "100,000-500,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-umba"
  },
  {
    "id": "aji-umba-yellow",
    "name": "Aji Umba Yellow",
    "species": "C. chinense",
    "heatRange": "250,000-350,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-umba-yellow"
  },
  {
    "id": "aji-valle-del-canca",
    "name": "Aji Valle del Canca",
    "species": "C. baccatum",
    "heatRange": "15,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-valle-del-canca"
  },
  {
    "id": "aji-verde",
    "name": "Aji Verde",
    "species": "C. baccatum",
    "heatRange": "1,000-8,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-verde"
  },
  {
    "id": "aji-white-fantasy",
    "name": "Aji White Fantasy",
    "species": "C. baccatum",
    "heatRange": "1,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-white-fantasy"
  },
  {
    "id": "aji-white-lightning-bolt",
    "name": "Aji White Lightning Bolt",
    "species": "C. baccatum",
    "heatRange": "15,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-white-lightning-bolt"
  },
  {
    "id": "aji-yellow-drop",
    "name": "Aji Yellow Drop",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-yellow-drop"
  },
  {
    "id": "aji-yuquitania",
    "name": "Aji Yuquitania",
    "species": "C. chinense",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aji-yuquitania"
  },
  {
    "id": "ajvarka",
    "name": "Ajvarka",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ajvarka"
  },
  {
    "id": "ajvarski",
    "name": "Ajvarski",
    "species": "C. annuum",
    "heatRange": "0-500 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ajvarski"
  },
  {
    "id": "akabare-khursani",
    "name": "Akabare Khursani",
    "species": "C. chinense",
    "heatRange": "100,000-350,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/akabare-khursani"
  },
  {
    "id": "akrep",
    "name": "Akrep",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/akrep"
  },
  {
    "id": "al-bab",
    "name": "Al-Bab",
    "species": "C. annuum",
    "heatRange": "0-500 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/al-bab"
  },
  {
    "id": "alajuela",
    "name": "Alajuela",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/alajuela"
  },
  {
    "id": "alba-orange",
    "name": "Alba Orange",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/alba-orange"
  },
  {
    "id": "albanian-red-hot",
    "name": "Albanian Red Hot",
    "species": "C. annuum",
    "heatRange": "10,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/albanian-red-hot"
  },
  {
    "id": "albarancio",
    "name": "Albarancio",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/albarancio"
  },
  {
    "id": "alberto",
    "name": "Alberto",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/alberto"
  },
  {
    "id": "albino-bullnose",
    "name": "Albino Bullnose",
    "species": "C. annuum",
    "heatRange": "0-500 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/albino-bullnose"
  },
  {
    "id": "alcade",
    "name": "Alcade",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/alcade"
  },
  {
    "id": "aleppo",
    "name": "Aleppo",
    "species": "C. annuum",
    "heatRange": "10,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aleppo"
  },
  {
    "id": "aleppo-mild",
    "name": "Aleppo Mild",
    "species": "C. annuum",
    "heatRange": "2,500-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aleppo-mild"
  },
  {
    "id": "alotenango",
    "name": "Alotenango",
    "species": "C. annuum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/alotenango"
  },
  {
    "id": "alpha",
    "name": "Alpha",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/alpha"
  },
  {
    "id": "aluca-sarga",
    "name": "Aluca Sarga",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aluca-sarga"
  },
  {
    "id": "ama-07",
    "name": "Ama 07",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ama-07"
  },
  {
    "id": "ama-11",
    "name": "Ama 11",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ama-11"
  },
  {
    "id": "ama-12",
    "name": "Ama 12",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ama-12"
  },
  {
    "id": "amachito-red",
    "name": "Amachito Red",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amachito-red"
  },
  {
    "id": "amanda-sweet",
    "name": "Amanda Sweet",
    "species": "C. annuum",
    "heatRange": "~100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amanda-sweet"
  },
  {
    "id": "amarillear",
    "name": "Amarillear",
    "species": "C. baccatum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amarillear"
  },
  {
    "id": "amazon",
    "name": "Amazon",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amazon"
  },
  {
    "id": "amazon-chile-roma",
    "name": "Amazon Chile Roma",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amazon-chile-roma"
  },
  {
    "id": "amazon-golden-olives",
    "name": "Amazon Golden Olives",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amazon-golden-olives"
  },
  {
    "id": "amazon-jungle",
    "name": "Amazon Jungle",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amazon-jungle"
  },
  {
    "id": "amethyst-fire",
    "name": "Amethyst Fire",
    "species": "C. annuum",
    "heatRange": "30,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amethyst-fire"
  },
  {
    "id": "amish-bush",
    "name": "Amish Bush",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amish-bush"
  },
  {
    "id": "amish-pimento",
    "name": "Amish Pimento",
    "species": "C. annuum",
    "heatRange": "0-500 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amish-pimento"
  },
  {
    "id": "ammazzo",
    "name": "Ammazzo",
    "species": "C. annuum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ammazzo"
  },
  {
    "id": "amnesia",
    "name": "Amnesia",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/amnesia"
  },
  {
    "id": "ampuis",
    "name": "Ampuis",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ampuis"
  },
  {
    "id": "anaheim",
    "name": "Anaheim",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim"
  },
  {
    "id": "anaheim-charger",
    "name": "Anaheim Charger",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-charger"
  },
  {
    "id": "anaheim-chili",
    "name": "Anaheim Chili",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-chili"
  },
  {
    "id": "anaheim-highlander",
    "name": "Anaheim Highlander",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-highlander"
  },
  {
    "id": "anaheim-hot",
    "name": "Anaheim Hot",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-hot"
  },
  {
    "id": "anaheim-m",
    "name": "Anaheim M",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-m"
  },
  {
    "id": "anaheim-tmr",
    "name": "Anaheim TMR",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-tmr"
  },
  {
    "id": "anaheim-tmr23",
    "name": "Anaheim TMR23",
    "species": "C. annuum",
    "heatRange": "500-2,500 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-tmr23"
  },
  {
    "id": "anaheim-cayenne",
    "name": "Anaheim × Cayenne",
    "species": "C. annuum",
    "heatRange": "30,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anaheim-x-cayenne"
  },
  {
    "id": "anastasia",
    "name": "Anastasia",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anastasia"
  },
  {
    "id": "anastasiya-sweet",
    "name": "Anastasiya Sweet",
    "species": "C. annuum",
    "heatRange": "0-100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anastasiya-sweet"
  },
  {
    "id": "ancho-101",
    "name": "Ancho 101",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-101"
  },
  {
    "id": "ancho-211",
    "name": "Ancho 211",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-211"
  },
  {
    "id": "ancho-chocolate",
    "name": "Ancho Chocolate",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-chocolate"
  },
  {
    "id": "ancho-gigantea",
    "name": "Ancho Gigantea",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-gigantea"
  },
  {
    "id": "ancho-gigantia",
    "name": "Ancho Gigantia",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-gigantia"
  },
  {
    "id": "ancho-granada",
    "name": "Ancho Granada",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-granada"
  },
  {
    "id": "ancho-large-mexican",
    "name": "Ancho Large Mexican",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-large-mexican"
  },
  {
    "id": "ancho-mosquetero",
    "name": "Ancho Mosquetero",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-mosquetero"
  },
  {
    "id": "ancho-mulato",
    "name": "Ancho Mulato",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-mulato"
  },
  {
    "id": "ancho-ranchero",
    "name": "Ancho Ranchero",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-ranchero"
  },
  {
    "id": "ancho-rojo",
    "name": "Ancho Rojo",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-rojo"
  },
  {
    "id": "ancho-san-louis",
    "name": "Ancho San Louis",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-san-louis"
  },
  {
    "id": "ancho-san-martin",
    "name": "Ancho San Martin",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-san-martin"
  },
  {
    "id": "ancho-villa",
    "name": "Ancho Villa",
    "species": "C. annuum",
    "heatRange": "1,000-2,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancho-villa"
  },
  {
    "id": "ancient",
    "name": "Ancient",
    "species": "C. annuum",
    "heatRange": "~100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancient"
  },
  {
    "id": "ancient-sweet-gold",
    "name": "Ancient Sweet Gold",
    "species": "C. annuum",
    "heatRange": "~100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ancient-sweet-gold"
  },
  {
    "id": "andino",
    "name": "Andino",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/andino"
  },
  {
    "id": "andrea",
    "name": "Andrea",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/andrea"
  },
  {
    "id": "andy-s-king-boc",
    "name": "Andy's King BOC",
    "species": "C. chinense",
    "heatRange": "400,000-850,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/andy-s-king-boc"
  },
  {
    "id": "andy-s-king-boc-dark",
    "name": "Andy's King BOC Dark",
    "species": "C. chinense",
    "heatRange": "400,000-850,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/andy-s-king-boc-dark"
  },
  {
    "id": "angarika",
    "name": "Angarika",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/angarika"
  },
  {
    "id": "angkor-sunrise",
    "name": "Angkor Sunrise",
    "species": "C. frutescens",
    "heatRange": "25,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/angkor-sunrise"
  },
  {
    "id": "anonimo",
    "name": "Anonimo",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/anonimo"
  },
  {
    "id": "antalya-dan",
    "name": "Antalya Dan",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antalya-dan"
  },
  {
    "id": "antep-aci-dolma",
    "name": "Antep Aci Dolma",
    "species": "C. annuum",
    "heatRange": "3,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antep-aci-dolma"
  },
  {
    "id": "antep-aci-dolma-cross",
    "name": "Antep Aci Dolma Cross",
    "species": "C. annuum",
    "heatRange": "3,000-15,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antep-aci-dolma-cross"
  },
  {
    "id": "antigua-large-sweet",
    "name": "Antigua Large Sweet",
    "species": "C. annuum",
    "heatRange": "~100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antigua-large-sweet"
  },
  {
    "id": "antillais-14-5",
    "name": "Antillais 14.5",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antillais-14-5"
  },
  {
    "id": "antillais-caribbean",
    "name": "Antillais Caribbean",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antillais-caribbean"
  },
  {
    "id": "antillerna",
    "name": "Antillerna",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antillerna"
  },
  {
    "id": "antilles-fire",
    "name": "Antilles Fire",
    "species": "C. chinense",
    "heatRange": "30,000-100,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antilles-fire"
  },
  {
    "id": "antohi-romanian",
    "name": "Antohi Romanian",
    "species": "C. annuum",
    "heatRange": "500-1,000 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/antohi-romanian"
  },
  {
    "id": "apache",
    "name": "Apache",
    "species": "C. annuum",
    "heatRange": "60,000-80,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apache"
  },
  {
    "id": "apocalypse",
    "name": "Apocalypse",
    "species": "C. chinense",
    "heatRange": "1,200,000-1,600,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apocalypse"
  },
  {
    "id": "apocalypse-chocolate",
    "name": "Apocalypse Chocolate",
    "species": "C. chinense",
    "heatRange": "1,200,000-1,600,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apocalypse-chocolate"
  },
  {
    "id": "apocalypse-scorpion",
    "name": "Apocalypse Scorpion",
    "species": "C. chinense",
    "heatRange": "1,200,000-1,600,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apocalypse-scorpion"
  },
  {
    "id": "apocalypse-scorpion-chocolate",
    "name": "Apocalypse Scorpion Chocolate",
    "species": "C. chinense",
    "heatRange": "1,200,000-1,600,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apocalypse-scorpion-chocolate"
  },
  {
    "id": "apocalypse-scorpion-jay-s-peach-ghost-scorpion",
    "name": "Apocalypse Scorpion × Jay's Peach Ghost Scorpion",
    "species": "C. chinense",
    "heatRange": "800,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apocalypse-scorpion-x-jay-s-peach-ghost-scorpion"
  },
  {
    "id": "apocalypse-7-pot-jonah",
    "name": "Apocalypse × 7 Pot Jonah",
    "species": "C. chinense",
    "heatRange": "800,000-1,000,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apocalypse-x-7-pot-jonah"
  },
  {
    "id": "apple",
    "name": "Apple",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apple"
  },
  {
    "id": "apple-crisp",
    "name": "Apple Crisp",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apple-crisp"
  },
  {
    "id": "apple-kambe",
    "name": "Apple Kambe",
    "species": "C. annuum",
    "heatRange": "~100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apple-kambe"
  },
  {
    "id": "apple-pf",
    "name": "Apple PF",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apple-pf"
  },
  {
    "id": "apricot",
    "name": "Apricot",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/apricot"
  },
  {
    "id": "arabian-slim",
    "name": "Arabian Slim",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arabian-slim"
  },
  {
    "id": "arancione-a-mazzetti",
    "name": "Arancione A Mazzetti",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arancione-a-mazzetti"
  },
  {
    "id": "arcobaleno",
    "name": "Arcobaleno",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arcobaleno"
  },
  {
    "id": "ardosa-amarela",
    "name": "Ardosa Amarela",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ardosa-amarela"
  },
  {
    "id": "argentina",
    "name": "Argentina",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/argentina"
  },
  {
    "id": "ariane",
    "name": "Ariane",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ariane"
  },
  {
    "id": "aribibi-gusano",
    "name": "Aribibi Gusano",
    "species": "C. chinense",
    "heatRange": "10,000-40,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aribibi-gusano"
  },
  {
    "id": "aribibi-orange",
    "name": "Aribibi Orange",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aribibi-orange"
  },
  {
    "id": "arivivi",
    "name": "Arivivi",
    "species": "C. chacoense",
    "heatRange": "10,000-40,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arivivi"
  },
  {
    "id": "arizona-toothpick",
    "name": "Arizona Toothpick",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arizona-toothpick"
  },
  {
    "id": "arlecchino",
    "name": "Arlecchino",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arlecchino"
  },
  {
    "id": "arledge",
    "name": "Arledge",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arledge"
  },
  {
    "id": "armageddon",
    "name": "Armageddon",
    "species": "C. chinense",
    "heatRange": "1,300,000-1,600,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/armageddon"
  },
  {
    "id": "armageddon-chocolate",
    "name": "Armageddon Chocolate",
    "species": "C. chinense",
    "heatRange": "1,300,000-1,600,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/armageddon-chocolate"
  },
  {
    "id": "armageddon-orange",
    "name": "Armageddon Orange",
    "species": "C. chinense",
    "heatRange": "1,300,000-1,600,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/armageddon-orange"
  },
  {
    "id": "arrancione-amazetti",
    "name": "Arrancione Amazetti",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arrancione-amazetti"
  },
  {
    "id": "arriba-a-saia",
    "name": "Arriba A Saia",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arriba-a-saia"
  },
  {
    "id": "arriba-a-saia-rosa",
    "name": "Arriba A Saia Rosa",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arriba-a-saia-rosa"
  },
  {
    "id": "arriba-saia",
    "name": "Arriba Saia",
    "species": "C. chinense",
    "heatRange": "200,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arriba-saia"
  },
  {
    "id": "arribibi-orange",
    "name": "Arribibi Orange",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arribibi-orange"
  },
  {
    "id": "arrowhead",
    "name": "Arrowhead",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arrowhead"
  },
  {
    "id": "arroz-con-pollo",
    "name": "Arroz Con Pollo",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arroz-con-pollo"
  },
  {
    "id": "arseclown-jolokia",
    "name": "Arseclown Jolokia",
    "species": "C. chinense",
    "heatRange": "400,000-850,000 SHU",
    "heatLevel": "Superhot (500,001+ SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/arseclown-jolokia"
  },
  {
    "id": "aruba-sweet-pepper",
    "name": "Aruba Sweet Pepper",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aruba-sweet-pepper"
  },
  {
    "id": "aruna-indian",
    "name": "Aruna Indian",
    "species": "C. annuum",
    "heatRange": "30,000-60,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aruna-indian"
  },
  {
    "id": "assam",
    "name": "Assam",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/assam"
  },
  {
    "id": "asta-de-toro",
    "name": "Asta de Toro",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asta-de-toro"
  },
  {
    "id": "asta-de-toro-amarillo",
    "name": "Asta de Toro Amarillo",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asta-de-toro-amarillo"
  },
  {
    "id": "asta-de-toro-cafe",
    "name": "Asta de Toro Cafè",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asta-de-toro-caf"
  },
  {
    "id": "asta-de-toro-naranjo",
    "name": "Asta de Toro Naranjo",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asta-de-toro-naranjo"
  },
  {
    "id": "asta-de-toro-rojo",
    "name": "Asta de Toro Rojo",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asta-de-toro-rojo"
  },
  {
    "id": "asti",
    "name": "Asti",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asti"
  },
  {
    "id": "asti-red",
    "name": "Asti Red",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asti-red"
  },
  {
    "id": "asti-yellow",
    "name": "Asti Yellow",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/asti-yellow"
  },
  {
    "id": "ata-barukono",
    "name": "Ata Barukono",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ata-barukono"
  },
  {
    "id": "ata-ijosi",
    "name": "Ata Ijosi",
    "species": "C. frutescens",
    "heatRange": "25,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ata-ijosi"
  },
  {
    "id": "atarodo",
    "name": "Atarodo",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/atarodo"
  },
  {
    "id": "atomic-starfish",
    "name": "Atomic Starfish",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/atomic-starfish"
  },
  {
    "id": "atzeco-chilli",
    "name": "Atzeco Chilli",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/atzeco-chilli"
  },
  {
    "id": "aurora",
    "name": "Aurora",
    "species": "C. annuum",
    "heatRange": "20,000-40,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aurora"
  },
  {
    "id": "ausilio",
    "name": "Ausilio",
    "species": "C. annuum",
    "heatRange": "500-5,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ausilio"
  },
  {
    "id": "ausilio-thin-skin-italian",
    "name": "Ausilio Thin Skin Italian",
    "species": "C. annuum",
    "heatRange": "500-5,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/ausilio-thin-skin-italian"
  },
  {
    "id": "aussie-black",
    "name": "Aussie Black",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/aussie-black"
  },
  {
    "id": "australian-broome",
    "name": "Australian Broome",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/australian-broome"
  },
  {
    "id": "australian-lantern",
    "name": "Australian Lantern",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/australian-lantern"
  },
  {
    "id": "australian-lantern-red",
    "name": "Australian Lantern Red",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/australian-lantern-red"
  },
  {
    "id": "autumn-sweet",
    "name": "Autumn Sweet",
    "species": "C. annuum",
    "heatRange": "~100 SHU",
    "heatLevel": "Mild (1–1,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/autumn-sweet"
  },
  {
    "id": "autumn-time",
    "name": "Autumn Time",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/autumn-time"
  },
  {
    "id": "avan",
    "name": "Avan",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/avan"
  },
  {
    "id": "avenir",
    "name": "Avenir",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/avenir"
  },
  {
    "id": "avila",
    "name": "Avila",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/avila"
  },
  {
    "id": "azr",
    "name": "Azr",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/azr"
  },
  {
    "id": "azteco",
    "name": "Azteco",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/azteco"
  },
  {
    "id": "baba-dissalou",
    "name": "Baba Dissalou",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/baba-dissalou"
  },
  {
    "id": "baby-red",
    "name": "Baby Red",
    "species": "C. annuum",
    "heatRange": "2,000-10,000 SHU",
    "heatLevel": "Medium (1,001–15,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/baby-red"
  },
  {
    "id": "baby-yellow",
    "name": "Baby Yellow",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/baby-yellow"
  },
  {
    "id": "babylon",
    "name": "Babylon",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/babylon"
  },
  {
    "id": "babylon-7jdx",
    "name": "Babylon 7JDX",
    "species": "C. chinense",
    "heatRange": "80,000-250,000 SHU",
    "heatLevel": "Very Hot (100,001–500,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/babylon-7jdx"
  },
  {
    "id": "baccatino",
    "name": "Baccatino",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/baccatino"
  },
  {
    "id": "baccato-de-orto",
    "name": "Baccato de Orto",
    "species": "C. baccatum",
    "heatRange": "8,000-25,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/baccato-de-orto"
  },
  {
    "id": "baccatum-brown",
    "name": "Baccatum Brown",
    "species": "C. baccatum",
    "heatRange": "10,000-50,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/baccatum-brown"
  },
  {
    "id": "baccio-di-satana",
    "name": "Baccio di Satana",
    "species": "C. annuum",
    "heatRange": "5,000-30,000 SHU",
    "heatLevel": "Hot (15,001–100,000 SHU)",
    "sourceUrl": "https://wikipepper.org/pepper/baccio-di-satana"
  }
] as const;

export const sharkLibrary = [
  {
    "id": "abdounia-africana",
    "name": "Abdounia africana",
    "scientificName": "Abdounia africana",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108068375"
  },
  {
    "id": "abdounia-beaugei",
    "name": "Abdounia beaugei",
    "scientificName": "Abdounia beaugei",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q104850368"
  },
  {
    "id": "abdounia-belselensis",
    "name": "Abdounia belselensis",
    "scientificName": "Abdounia belselensis",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060021"
  },
  {
    "id": "abdounia-biauriculata",
    "name": "Abdounia biauriculata",
    "scientificName": "Abdounia biauriculata",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060022"
  },
  {
    "id": "abdounia-enniskilleni",
    "name": "Abdounia enniskilleni",
    "scientificName": "Abdounia enniskilleni",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060024"
  },
  {
    "id": "abdounia-finalis",
    "name": "Abdounia finalis",
    "scientificName": "Abdounia finalis",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060043"
  },
  {
    "id": "abdounia-furimskyi",
    "name": "Abdounia furimskyi",
    "scientificName": "Abdounia furimskyi",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060044"
  },
  {
    "id": "abdounia-lapierrei",
    "name": "Abdounia lapierrei",
    "scientificName": "Abdounia lapierrei",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060045"
  },
  {
    "id": "abdounia-lata",
    "name": "Abdounia lata",
    "scientificName": "Abdounia lata",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108046528"
  },
  {
    "id": "abdounia-mesetae",
    "name": "Abdounia mesetae",
    "scientificName": "Abdounia mesetae",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060046"
  },
  {
    "id": "abdounia-minutissima",
    "name": "Abdounia minutissima",
    "scientificName": "Abdounia minutissima",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q104850500"
  },
  {
    "id": "abdounia-osipovae",
    "name": "Abdounia osipovae",
    "scientificName": "Abdounia osipovae",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060048"
  },
  {
    "id": "abdounia-recticonia",
    "name": "Abdounia recticonia",
    "scientificName": "Abdounia recticona",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q104850503"
  },
  {
    "id": "abdounia-richteri",
    "name": "Abdounia richteri",
    "scientificName": "Abdounia richteri",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108060049"
  },
  {
    "id": "abdounia-vassilyevae",
    "name": "Abdounia vassilyevae",
    "scientificName": "Abdounia vassilyevae",
    "genus": "Abdounia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108046536"
  },
  {
    "id": "acanthias-americanus",
    "name": "Acanthias americanus",
    "scientificName": "Acanthias americanus",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446530"
  },
  {
    "id": "acanthias-antiguorum",
    "name": "Acanthias antiguorum",
    "scientificName": "Acanthias antiguorum",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446532"
  },
  {
    "id": "acanthias-blainville",
    "name": "Acanthias blainville",
    "scientificName": "Acanthias blainville",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q28799968"
  },
  {
    "id": "acanthias-commun",
    "name": "Acanthias commun",
    "scientificName": "Acanthias commun",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446533"
  },
  {
    "id": "acanthias-lebruni",
    "name": "Acanthias lebruni",
    "scientificName": "Acanthias lebruni",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446535"
  },
  {
    "id": "acanthias-linnei",
    "name": "Acanthias linnei",
    "scientificName": "Acanthias linnei",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446538"
  },
  {
    "id": "acanthias-megalops",
    "name": "Acanthias megalops",
    "scientificName": "Acanthias megalops",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446540"
  },
  {
    "id": "acanthias-nigrescens",
    "name": "Acanthias nigrescens",
    "scientificName": "Acanthias nigrescens",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446542"
  },
  {
    "id": "acanthias-suckleyi",
    "name": "Acanthias suckleyi",
    "scientificName": "Acanthias suckleyi",
    "genus": "Acanthias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446543"
  },
  {
    "id": "acanthidium-aciculatum",
    "name": "Acanthidium aciculatum",
    "scientificName": "Acanthidium aciculatum",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333158"
  },
  {
    "id": "acanthidium-calceus",
    "name": "Acanthidium calceus",
    "scientificName": "Acanthidium calceus",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333159"
  },
  {
    "id": "acanthidium-hystricosum",
    "name": "Acanthidium hystricosum",
    "scientificName": "Acanthidium hystricosum",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333161"
  },
  {
    "id": "acanthidium-molleri",
    "name": "Acanthidium molleri",
    "scientificName": "Acanthidium molleri",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333162"
  },
  {
    "id": "acanthidium-natalense",
    "name": "Acanthidium natalense",
    "scientificName": "Acanthidium natalense",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333164"
  },
  {
    "id": "acanthidium-pusillum",
    "name": "Acanthidium pusillum",
    "scientificName": "Acanthidium pusillum",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333165"
  },
  {
    "id": "acanthidium-quadrispinosum",
    "name": "Acanthidium quadrispinosum",
    "scientificName": "Acanthidium quadrispinosum",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333166"
  },
  {
    "id": "acanthidium-rostratum",
    "name": "Acanthidium rostratum",
    "scientificName": "Acanthidium rostratum",
    "genus": "Acanthidium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333167"
  },
  {
    "id": "acutalamna-karsteni",
    "name": "Acutalamna karsteni",
    "scientificName": "Acutalamna karsteni",
    "genus": "Acutalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133340785"
  },
  {
    "id": "adnetoscyllium-angloparisensis",
    "name": "Adnetoscyllium angloparisensis",
    "scientificName": "Adnetoscyllium angloparisensis",
    "genus": "Adnetoscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363681"
  },
  {
    "id": "african-lanternshark",
    "name": "African lanternshark",
    "scientificName": "Etmopterus polli",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3757992"
  },
  {
    "id": "african-ribbontail-catshark",
    "name": "African ribbontail catshark",
    "scientificName": "Eridacnis sinuans",
    "genus": "Eridacnis",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q769350"
  },
  {
    "id": "african-sawtail-catshark",
    "name": "African sawtail catshark",
    "scientificName": "Galeus polli",
    "genus": "Galeus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2639540"
  },
  {
    "id": "agaleus-dorsetensis",
    "name": "Agaleus dorsetensis",
    "scientificName": "Agaleus dorsetensis",
    "genus": "Agaleus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q127420109"
  },
  {
    "id": "akaimia-altucuspis",
    "name": "Akaimia altucuspis",
    "scientificName": "Akaimia altucuspis",
    "genus": "Akaimia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q26416736"
  },
  {
    "id": "akaimia-myriacuspis",
    "name": "Akaimia myriacuspis",
    "scientificName": "Akaimia myriacuspis",
    "genus": "Akaimia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q26221061"
  },
  {
    "id": "allomycter-dissutus",
    "name": "Allomycter dissutus",
    "scientificName": "Allomycter dissutus",
    "genus": "Allomycter",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333130"
  },
  {
    "id": "alopias-caudatus",
    "name": "Alopias caudatus",
    "scientificName": "Alopias caudatus",
    "genus": "Alopias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446040"
  },
  {
    "id": "alopias-crochardi",
    "name": "Alopias crochardi",
    "scientificName": "Alopias crochardi",
    "genus": "Alopias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q40311609"
  },
  {
    "id": "alopias-grandis",
    "name": "Alopias grandis",
    "scientificName": "Alopias grandis",
    "genus": "Alopias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q52413113"
  },
  {
    "id": "alopias-greyi",
    "name": "Alopias greyi",
    "scientificName": "Alopias greyi",
    "genus": "Alopias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446047"
  },
  {
    "id": "alopias-leeensis",
    "name": "Alopias leeensis",
    "scientificName": "Alopias leeensis",
    "genus": "Alopias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q40311656"
  },
  {
    "id": "alopias-palatasi",
    "name": "Alopias palatasi",
    "scientificName": "Alopias palatasi",
    "genus": "Alopias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q63351186"
  },
  {
    "id": "alopias-profundus",
    "name": "Alopias profundus",
    "scientificName": "Alopias profundus",
    "genus": "Alopias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446048"
  },
  {
    "id": "alopiopsis-plejodon",
    "name": "Alopiopsis plejodon",
    "scientificName": "Alopiopsis plejodon",
    "genus": "Alopiopsis",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133341074"
  },
  {
    "id": "altusmirus-triquetrus",
    "name": "Altusmirus triquetrus",
    "scientificName": "Altusmirus triquetrus",
    "genus": "Altusmirus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133341232"
  },
  {
    "id": "ambon-catshark",
    "name": "Ambon catshark",
    "scientificName": "Akheilos suwartanai",
    "genus": "Akheilos",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q97182925"
  },
  {
    "id": "american-pocket-shark",
    "name": "American pocket shark",
    "scientificName": "Mollisquama mississippiensis",
    "genus": "Mollisquama",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q65938991"
  },
  {
    "id": "angoumeius-paradoxus",
    "name": "Angoumeius paradoxus",
    "scientificName": "Angoumeius paradoxus",
    "genus": "Angoumeius",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25360450"
  },
  {
    "id": "angoumeius-sanadaensis",
    "name": "Angoumeius sanadaensis",
    "scientificName": "Angoumeius sanadaensis",
    "genus": "Angoumeius",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135792604"
  },
  {
    "id": "angular-roughshark",
    "name": "angular roughshark",
    "scientificName": "Oxynotus centrina",
    "genus": "Oxynotus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1089264"
  },
  {
    "id": "anomotodon-genaulti",
    "name": "Anomotodon genaulti",
    "scientificName": "Anomotodon genaulti",
    "genus": "Anomotodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363688"
  },
  {
    "id": "anomotodon-plicatus",
    "name": "Anomotodon plicatus",
    "scientificName": "Anomotodon plicatus",
    "genus": "Anomotodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363684"
  },
  {
    "id": "anotodus-retroflexus",
    "name": "Anotodus retroflexus",
    "scientificName": "Anotodus retroflexus",
    "genus": "Anotodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133341547"
  },
  {
    "id": "antilles-catshark",
    "name": "Antilles catshark",
    "scientificName": "Galeus antillensis",
    "genus": "Galeus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950352"
  },
  {
    "id": "antrigoulia-circumplicata",
    "name": "Antrigoulia circumplicata",
    "scientificName": "Antrigoulia circumplicata",
    "genus": "Antrigoulia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21239589"
  },
  {
    "id": "aprionodon-acutidens",
    "name": "Aprionodon acutidens",
    "scientificName": "Aprionodon acutidens",
    "genus": "Aprionodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445543"
  },
  {
    "id": "aprionodon-brevipenna",
    "name": "Aprionodon brevipenna",
    "scientificName": "Aprionodon brevipenna",
    "genus": "Aprionodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q15227461"
  },
  {
    "id": "aprionodon-brevipinna",
    "name": "Aprionodon brevipinna",
    "scientificName": "Aprionodon brevipinna",
    "genus": "Aprionodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445545"
  },
  {
    "id": "aprionodon-caparti",
    "name": "Aprionodon caparti",
    "scientificName": "Aprionodon caparti",
    "genus": "Aprionodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445547"
  },
  {
    "id": "aprionodon-isodon",
    "name": "Aprionodon isodon",
    "scientificName": "Aprionodon isodon",
    "genus": "Aprionodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445550"
  },
  {
    "id": "aprionodon-punctatus",
    "name": "Aprionodon punctatus",
    "scientificName": "Aprionodon punctatus",
    "genus": "Aprionodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445555"
  },
  {
    "id": "aprionodon-sitankaiensis",
    "name": "Aprionodon sitankaiensis",
    "scientificName": "Aprionodon sitankaiensis",
    "genus": "Aprionodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055032"
  },
  {
    "id": "apristurus-abbreriatus",
    "name": "Apristurus abbreriatus",
    "scientificName": "Apristurus abbreriatus",
    "genus": "Apristurus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q15226959"
  },
  {
    "id": "apristurus-albisoma",
    "name": "Apristurus albisoma",
    "scientificName": "Apristurus albisoma",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951857"
  },
  {
    "id": "apristurus-aphyodes",
    "name": "Apristurus aphyodes",
    "scientificName": "Apristurus aphyodes",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950274"
  },
  {
    "id": "apristurus-atlanticus",
    "name": "Apristurus atlanticus",
    "scientificName": "Apristurus atlanticus",
    "genus": "Apristurus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2858990"
  },
  {
    "id": "apristurus-australis",
    "name": "Apristurus australis",
    "scientificName": "Apristurus australis",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2442153"
  },
  {
    "id": "apristurus-exsanguis",
    "name": "Apristurus exsanguis",
    "scientificName": "Apristurus exsanguis",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951356"
  },
  {
    "id": "apristurus-fedorovi",
    "name": "Apristurus fedorovi",
    "scientificName": "Apristurus fedorovi",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950344"
  },
  {
    "id": "apristurus-garricki",
    "name": "Apristurus garricki",
    "scientificName": "Apristurus garricki",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q16982212"
  },
  {
    "id": "apristurus-grbbosug",
    "name": "Apristurus grbbosug",
    "scientificName": "Apristurus grbbosug",
    "genus": "Apristurus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q15227028"
  },
  {
    "id": "apristurus-indicus",
    "name": "Apristurus indicus",
    "scientificName": "Apristurus indicus",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2187592"
  },
  {
    "id": "apristurus-internatus",
    "name": "Apristurus internatus",
    "scientificName": "Apristurus internatus",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1949679"
  },
  {
    "id": "apristurus-manocheriani",
    "name": "Apristurus manocheriani",
    "scientificName": "Apristurus manocheriani",
    "genus": "Apristurus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107529928"
  },
  {
    "id": "apristurus-melanoasper",
    "name": "Apristurus melanoasper",
    "scientificName": "Apristurus melanoasper",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q617911"
  },
  {
    "id": "apristurus-nakayai",
    "name": "Apristurus nakayai",
    "scientificName": "Apristurus nakayai",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q28598934"
  },
  {
    "id": "apristurus-ovicorrugatus",
    "name": "Apristurus ovicorrugatus",
    "scientificName": "Apristurus ovicorrugatus",
    "genus": "Apristurus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q118520687"
  },
  {
    "id": "apristurus-pinguis",
    "name": "Apristurus pinguis",
    "scientificName": "Apristurus pinguis",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951846"
  },
  {
    "id": "apristurus-verweyi",
    "name": "Apristurus verweyi",
    "scientificName": "Apristurus verweyi",
    "genus": "Apristurus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055138"
  },
  {
    "id": "apristurus-yangi",
    "name": "Apristurus yangi",
    "scientificName": "Apristurus yangi",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q46262736"
  },
  {
    "id": "aquilolamna-milarcae",
    "name": "Aquilolamna milarcae",
    "scientificName": "Aquilolamna milarcae",
    "genus": "Aquilolamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106045144"
  },
  {
    "id": "arabian-carpetshark",
    "name": "Arabian carpetshark",
    "scientificName": "Chiloscyllium arabicum",
    "genus": "Chiloscyllium",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q29226"
  },
  {
    "id": "arabian-smooth-hound",
    "name": "Arabian smooth-hound",
    "scientificName": "Mustelus mosis",
    "genus": "Mustelus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951902"
  },
  {
    "id": "araloselachus-agespensis",
    "name": "Araloselachus agespensis",
    "scientificName": "Araloselachus agespensis",
    "genus": "Araloselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25400025"
  },
  {
    "id": "araloselachus-cuspidatus",
    "name": "Araloselachus cuspidatus",
    "scientificName": "Araloselachus cuspidatus",
    "genus": "Araloselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25399991"
  },
  {
    "id": "archaeogaleus-lengadocensis",
    "name": "Archaeogaleus lengadocensis",
    "scientificName": "Archaeogaleus lengadocensis",
    "genus": "Archaeogaleus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q22106397"
  },
  {
    "id": "archaeolamna-kopingensis",
    "name": "Archaeolamna kopingensis",
    "scientificName": "Archaeolamna kopingensis",
    "genus": "Archaeolamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133342194"
  },
  {
    "id": "archaeotriakis-ornatus",
    "name": "Archaeotriakis ornatus",
    "scientificName": "Archaeotriakis ornatus",
    "genus": "Archaeotriakis",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133342929"
  },
  {
    "id": "archaeotriakis-rochelleae",
    "name": "Archaeotriakis rochelleae",
    "scientificName": "Archaeotriakis rochelleae",
    "genus": "Archaeotriakis",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133342603"
  },
  {
    "id": "arrowhead-dogfish",
    "name": "Arrowhead dogfish",
    "scientificName": "Deania profundorum",
    "genus": "Deania",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q998007"
  },
  {
    "id": "asymbolus-funebris",
    "name": "Asymbolus funebris",
    "scientificName": "Asymbolus funebris",
    "genus": "Asymbolus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951804"
  },
  {
    "id": "asymbolus-galacticus",
    "name": "Asymbolus galacticus",
    "scientificName": "Asymbolus galacticus",
    "genus": "Asymbolus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950300"
  },
  {
    "id": "asymbolus-parvus",
    "name": "Asymbolus parvus",
    "scientificName": "Asymbolus parvus",
    "genus": "Asymbolus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951875"
  },
  {
    "id": "atlantic-sawtail-catshark",
    "name": "Atlantic sawtail catshark",
    "scientificName": "Galeus atlanticus",
    "genus": "Galeus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q4816649"
  },
  {
    "id": "atlantic-sharpnose-shark",
    "name": "Atlantic sharpnose shark",
    "scientificName": "Rhizoprionodon terraenovae",
    "genus": "Rhizoprionodon",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q756958"
  },
  {
    "id": "atlantic-weasel-shark",
    "name": "Atlantic weasel shark",
    "scientificName": "Paragaleus pectoralis",
    "genus": "Paragaleus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q40576"
  },
  {
    "id": "australian-blackspotted-catshark",
    "name": "Australian blackspotted catshark",
    "scientificName": "Aulohalaelurus labiosus",
    "genus": "Aulohalaelurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2615018"
  },
  {
    "id": "australian-blacktip-shark",
    "name": "Australian blacktip shark",
    "scientificName": "Carcharhinus tilstoni",
    "genus": "Carcharhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q783306"
  },
  {
    "id": "australian-grey-smooth-hound",
    "name": "Australian grey smooth-hound",
    "scientificName": "Mustelus ravidus",
    "genus": "Mustelus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951826"
  },
  {
    "id": "australian-marbled-catshark",
    "name": "Australian marbled catshark",
    "scientificName": "Atelomycterus macleayi",
    "genus": "Atelomycterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2615056"
  },
  {
    "id": "australian-reticulate-swellshark",
    "name": "Australian reticulate swellshark",
    "scientificName": "Cephaloscyllium hiscosellum",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950318"
  },
  {
    "id": "australian-sawtail-catshark",
    "name": "Australian sawtail catshark",
    "scientificName": "Figaro boardmani",
    "genus": "Figaro",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1947188"
  },
  {
    "id": "australian-sharpnose-shark",
    "name": "Australian sharpnose shark",
    "scientificName": "Rhizoprionodon taylori",
    "genus": "Rhizoprionodon",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q783299"
  },
  {
    "id": "australian-spotted-catshark",
    "name": "Australian spotted catshark",
    "scientificName": "Asymbolus analis",
    "genus": "Asymbolus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2640003"
  },
  {
    "id": "australian-swellshark",
    "name": "Australian swellshark",
    "scientificName": "Cephaloscyllium laticeps",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2719434"
  },
  {
    "id": "australian-weasel-shark",
    "name": "Australian weasel shark",
    "scientificName": "Hemigaleus australiensis",
    "genus": "Hemigaleus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q40565"
  },
  {
    "id": "azores-dogfish",
    "name": "Azores dogfish",
    "scientificName": "Scymnodalatias garricki",
    "genus": "Scymnodalatias",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q4668045"
  },
  {
    "id": "bahamas-sawshark",
    "name": "Bahamas sawshark",
    "scientificName": "Pristiophorus schroederi",
    "genus": "Pristiophorus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q800203"
  },
  {
    "id": "bali-catshark",
    "name": "Bali catshark",
    "scientificName": "Atelomycterus baliensis",
    "genus": "Atelomycterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951839"
  },
  {
    "id": "balloon-shark",
    "name": "Balloon shark",
    "scientificName": "Cephaloscyllium sufflans",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2616904"
  },
  {
    "id": "banded-houndshark",
    "name": "banded houndshark",
    "scientificName": "Triakis scyllium",
    "genus": "Triakis",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2024385"
  },
  {
    "id": "banded-sand-catshark",
    "name": "Banded sand catshark",
    "scientificName": "Atelomycterus fasciatus",
    "genus": "Atelomycterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951770"
  },
  {
    "id": "barbeled-houndshark",
    "name": "barbeled houndshark",
    "scientificName": "Leptocharias smithii",
    "genus": "Leptocharias",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q40617"
  },
  {
    "id": "barbelthroat-carpetshark",
    "name": "Barbelthroat carpetshark",
    "scientificName": "Cirrhoscyllium expolitum",
    "genus": "Cirrhoscyllium",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q31750"
  },
  {
    "id": "bareskin-dogfish",
    "name": "Bareskin dogfish",
    "scientificName": "Centroscyllium kamoharai",
    "genus": "Centroscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2438513"
  },
  {
    "id": "bartail-spurdog",
    "name": "Bartail spurdog",
    "scientificName": "Squalus notocaudatus",
    "genus": "Squalus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3282659"
  },
  {
    "id": "basking-shark",
    "name": "basking shark",
    "scientificName": "Cetorhinus maximus",
    "genus": "Cetorhinus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q185260"
  },
  {
    "id": "bavariscyllium-tischlingeri",
    "name": "Bavariscyllium tischlingeri",
    "scientificName": "Bavariscyllium tischlingeri",
    "genus": "Bavariscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133349748"
  },
  {
    "id": "bigeye-houndshark",
    "name": "Bigeye houndshark",
    "scientificName": "Iago omanensis",
    "genus": "Iago",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2527263"
  },
  {
    "id": "bigeye-sand-tiger",
    "name": "bigeye sand tiger",
    "scientificName": "Odontaspis noronhai",
    "genus": "Odontaspis",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1548048"
  },
  {
    "id": "bigeye-thresher",
    "name": "bigeye thresher",
    "scientificName": "Alopias superciliosus",
    "genus": "Alopias",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q508067"
  },
  {
    "id": "bigeyed-sixgill-shark",
    "name": "bigeyed sixgill shark",
    "scientificName": "Hexanchus nakamurai",
    "genus": "Hexanchus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1548052"
  },
  {
    "id": "bighead-catshark",
    "name": "Bighead catshark",
    "scientificName": "Apristurus bucephalus",
    "genus": "Apristurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1871459"
  },
  {
    "id": "bighead-spurdog",
    "name": "Bighead spurdog",
    "scientificName": "Squalus bucephalus",
    "genus": "Squalus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5017919"
  },
  {
    "id": "black-dogfish",
    "name": "Black dogfish",
    "scientificName": "Centroscyllium fabricii",
    "genus": "Centroscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2380356"
  },
  {
    "id": "blackbelly-lanternshark",
    "name": "Blackbelly lanternshark",
    "scientificName": "Etmopterus lucifer",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3234649"
  },
  {
    "id": "blackfin-gulper-shark",
    "name": "blackfin gulper shark",
    "scientificName": "Centrophorus isodon",
    "genus": "Centrophorus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q4668216"
  },
  {
    "id": "blackgill-catshark",
    "name": "Blackgill catshark",
    "scientificName": "Parmaturus melanobranchus",
    "genus": "Parmaturus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2627685"
  },
  {
    "id": "blackmouth-catshark",
    "name": "blackmouth catshark",
    "scientificName": "Galeus melastomus",
    "genus": "Galeus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q141066"
  },
  {
    "id": "blackmouth-lanternshark",
    "name": "Blackmouth lanternshark",
    "scientificName": "Etmopterus evansi",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q147167"
  },
  {
    "id": "blacknose-shark",
    "name": "blacknose shark",
    "scientificName": "Carcharhinus acronotus",
    "genus": "Carcharhinus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1419686"
  },
  {
    "id": "blackspotted-catshark",
    "name": "Blackspotted catshark",
    "scientificName": "Halaelurus buergeri",
    "genus": "Halaelurus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2719415"
  },
  {
    "id": "blackspotted-smooth-hound",
    "name": "Blackspotted smooth-hound",
    "scientificName": "Mustelus punctulatus",
    "genus": "Mustelus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2454192"
  },
  {
    "id": "blacktailed-spurdog",
    "name": "Blacktailed spurdog",
    "scientificName": "Squalus melanurus",
    "genus": "Squalus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q994636"
  },
  {
    "id": "blacktip-reef-shark",
    "name": "Blacktip reef shark",
    "scientificName": "Carcharhinus melanopterus",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q726384"
  },
  {
    "id": "blacktip-sawtail-catshark",
    "name": "Blacktip sawtail catshark",
    "scientificName": "Galeus sauteri",
    "genus": "Galeus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1110502"
  },
  {
    "id": "blacktip-shark",
    "name": "blacktip shark",
    "scientificName": "Carcharhinus limbatus",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q125236"
  },
  {
    "id": "blacktip-tope",
    "name": "Blacktip tope",
    "scientificName": "Hypogaleus hyugaensis",
    "genus": "Hypogaleus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1936194"
  },
  {
    "id": "blauwgrijze-blinde-haai",
    "name": "Blauwgrijze blinde haai",
    "scientificName": "Heteroscyllium colcloughi",
    "genus": "Heteroscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q882873"
  },
  {
    "id": "blind-shark",
    "name": "blind shark",
    "scientificName": "Brachaelurus waddi",
    "genus": "Brachaelurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q29121"
  },
  {
    "id": "blotchy-swell-shark",
    "name": "Blotchy swell shark",
    "scientificName": "Cephaloscyllium umbratile",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1949737"
  },
  {
    "id": "blurred-lanternshark",
    "name": "Blurred lanternshark",
    "scientificName": "Etmopterus bigelowi",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3277389"
  },
  {
    "id": "boa-catshark",
    "name": "Boa catshark",
    "scientificName": "Scyliorhinus boa",
    "genus": "Scyliorhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2625931"
  },
  {
    "id": "bonnethead",
    "name": "bonnethead",
    "scientificName": "Sphyrna tiburo",
    "genus": "Sphyrna",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q338891"
  },
  {
    "id": "borealotodus-benyamovski",
    "name": "Borealotodus benyamovski",
    "scientificName": "Borealotodus benyamovski",
    "genus": "Borealotodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25400045"
  },
  {
    "id": "borealotodus-borealis",
    "name": "Borealotodus borealis",
    "scientificName": "Borealotodus borealis",
    "genus": "Borealotodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25400032"
  },
  {
    "id": "borneo-river-shark",
    "name": "Borneo river shark",
    "scientificName": "Glyphis fowlerae",
    "genus": "Glyphis",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q893956"
  },
  {
    "id": "borneo-shark",
    "name": "Borneo shark",
    "scientificName": "Carcharhinus borneensis",
    "genus": "Carcharhinus",
    "conservationStatus": "Critically Endangered",
    "sourceUrl": "https://www.wikidata.org/wiki/Q893969"
  },
  {
    "id": "brachaelurus-colcloughi",
    "name": "Brachaelurus colcloughi",
    "scientificName": "Brachaelurus colcloughi",
    "genus": "Brachaelurus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5032048"
  },
  {
    "id": "bramble-shark",
    "name": "bramble shark",
    "scientificName": "Echinorhinus brucus",
    "genus": "Echinorhinus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1297550"
  },
  {
    "id": "brazilian-sharpnose-shark",
    "name": "Brazilian sharpnose shark",
    "scientificName": "Rhizoprionodon lalandii",
    "genus": "Rhizoprionodon",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q899320"
  },
  {
    "id": "broadbanded-lanternshark",
    "name": "Broadbanded lanternshark",
    "scientificName": "Etmopterus gracilispinis",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2667532"
  },
  {
    "id": "broadfin-sawtail-catshark",
    "name": "Broadfin sawtail catshark",
    "scientificName": "Galeus nipponensis",
    "genus": "Galeus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2640024"
  },
  {
    "id": "broadgill-catshark",
    "name": "Broadgill catshark",
    "scientificName": "Apristurus riveri",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2510318"
  },
  {
    "id": "broadhead-cat-shark",
    "name": "Broadhead cat shark",
    "scientificName": "Bythaelurus clevai",
    "genus": "Bythaelurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951950"
  },
  {
    "id": "broadmouth-cat-shark",
    "name": "Broadmouth cat shark",
    "scientificName": "Apristurus macrostomus",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1914738"
  },
  {
    "id": "broadnose-catshark",
    "name": "Broadnose catshark",
    "scientificName": "Apristurus investigatoris",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951747"
  },
  {
    "id": "broadnose-sevengill-shark",
    "name": "broadnose sevengill shark",
    "scientificName": "Notorynchus cepedianus",
    "genus": "Notorynchus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q377591"
  },
  {
    "id": "brown-catshark",
    "name": "Brown catshark",
    "scientificName": "Apristurus brunneus",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1956595"
  },
  {
    "id": "brown-lanternshark",
    "name": "Brown lanternshark",
    "scientificName": "Etmopterus unicolor",
    "genus": "Etmopterus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3760674"
  },
  {
    "id": "brown-shyshark",
    "name": "Brown shyshark",
    "scientificName": "Haploblepharus fuscus",
    "genus": "Haploblepharus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q901046"
  },
  {
    "id": "brown-smooth-hound",
    "name": "brown smooth-hound",
    "scientificName": "Mustelus henlei",
    "genus": "Mustelus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2657865"
  },
  {
    "id": "brownbanded-bamboo-shark",
    "name": "Brownbanded bamboo shark",
    "scientificName": "Chiloscyllium punctatum",
    "genus": "Chiloscyllium",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q29227"
  },
  {
    "id": "brownspotted-catshark",
    "name": "Brownspotted catshark",
    "scientificName": "Scyliorhinus garmani",
    "genus": "Scyliorhinus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2625923"
  },
  {
    "id": "burmese-bamboo-shark",
    "name": "Burmese bamboo shark",
    "scientificName": "Chiloscyllium burmensis",
    "genus": "Chiloscyllium",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q29163"
  },
  {
    "id": "bythaelurus-bachi",
    "name": "Bythaelurus bachi",
    "scientificName": "Bythaelurus bachi",
    "genus": "Bythaelurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q46388462"
  },
  {
    "id": "bythaelurus-hispidus",
    "name": "Bythaelurus hispidus",
    "scientificName": "Bythaelurus hispidus",
    "genus": "Bythaelurus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2338968"
  },
  {
    "id": "bythaelurus-incanus",
    "name": "Bythaelurus incanus",
    "scientificName": "Bythaelurus incanus",
    "genus": "Bythaelurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1939376"
  },
  {
    "id": "bythaelurus-lutarius",
    "name": "Bythaelurus lutarius",
    "scientificName": "Bythaelurus lutarius",
    "genus": "Bythaelurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q943444"
  },
  {
    "id": "bythaelurus-stewarti",
    "name": "Bythaelurus stewarti",
    "scientificName": "Bythaelurus stewarti",
    "genus": "Bythaelurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q59779220"
  },
  {
    "id": "bythaelurus-tenuicephalus",
    "name": "Bythaelurus tenuicephalus",
    "scientificName": "Bythaelurus tenuicephalus",
    "genus": "Bythaelurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21247732"
  },
  {
    "id": "bythaelurus-vivaldii",
    "name": "Bythaelurus vivaldii",
    "scientificName": "Bythaelurus vivaldii",
    "genus": "Bythaelurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q46388760"
  },
  {
    "id": "cadiera-camboensis",
    "name": "Cadiera camboensis",
    "scientificName": "Cadiera camboensis",
    "genus": "Cadiera",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q22108512"
  },
  {
    "id": "calliscyllium-venustum",
    "name": "Calliscyllium venustum",
    "scientificName": "Calliscyllium venustum",
    "genus": "Calliscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333120"
  },
  {
    "id": "campeche-catshark",
    "name": "Campeche catshark",
    "scientificName": "Parmaturus campechiensis",
    "genus": "Parmaturus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2716617"
  },
  {
    "id": "cantioscyllium-grandis",
    "name": "Cantioscyllium grandis",
    "scientificName": "Cantioscyllium grandis",
    "genus": "Cantioscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q22102515"
  },
  {
    "id": "cantioscyllium-markaguntensis",
    "name": "Cantioscyllium markaguntensis",
    "scientificName": "Cantioscyllium markaguntensis",
    "genus": "Cantioscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25364060"
  },
  {
    "id": "carcharhinus-acarenatus",
    "name": "Carcharhinus acarenatus",
    "scientificName": "Carcharhinus acarenatus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055033"
  },
  {
    "id": "carcharhinus-acutus",
    "name": "Carcharhinus acutus",
    "scientificName": "Carcharhinus acutus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055034"
  },
  {
    "id": "carcharhinus-ahenea",
    "name": "Carcharhinus ahenea",
    "scientificName": "Carcharhinus ahenea",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055036"
  },
  {
    "id": "carcharhinus-albimarginatus",
    "name": "Carcharhinus albimarginatus",
    "scientificName": "Carcharhinus albimarginatus",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1126782"
  },
  {
    "id": "carcharhinus-altimus",
    "name": "Carcharhinus altimus",
    "scientificName": "Carcharhinus altimus",
    "genus": "Carcharhinus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1118043"
  },
  {
    "id": "carcharhinus-amblyrhynchoides",
    "name": "Carcharhinus amblyrhynchoides",
    "scientificName": "Carcharhinus amblyrhynchoides",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135369"
  },
  {
    "id": "carcharhinus-amboinensis",
    "name": "Carcharhinus amboinensis",
    "scientificName": "Carcharhinus amboinensis",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q400627"
  },
  {
    "id": "carcharhinus-atrodorsus",
    "name": "Carcharhinus atrodorsus",
    "scientificName": "Carcharhinus atrodorsus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055037"
  },
  {
    "id": "carcharhinus-azureus",
    "name": "Carcharhinus azureus",
    "scientificName": "Carcharhinus azureus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055039"
  },
  {
    "id": "carcharhinus-bleekeri",
    "name": "Carcharhinus bleekeri",
    "scientificName": "Carcharhinus bleekeri",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055040"
  },
  {
    "id": "carcharhinus-brachyurus",
    "name": "Carcharhinus brachyurus",
    "scientificName": "Carcharhinus brachyurus",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q928469"
  },
  {
    "id": "carcharhinus-brevipinna",
    "name": "Carcharhinus brevipinna",
    "scientificName": "Carcharhinus brevipinna",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1480630"
  },
  {
    "id": "carcharhinus-caquetius",
    "name": "Carcharhinus caquetius",
    "scientificName": "Carcharhinus caquetius",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21345500"
  },
  {
    "id": "carcharhinus-coatesi",
    "name": "Carcharhinus coatesi",
    "scientificName": "Carcharhinus coatesi",
    "genus": "Carcharhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1035604"
  },
  {
    "id": "carcharhinus-egertoni",
    "name": "Carcharhinus egertoni",
    "scientificName": "Carcharhinus egertoni",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q136844940"
  },
  {
    "id": "carcharhinus-floridanus",
    "name": "Carcharhinus floridanus",
    "scientificName": "Carcharhinus floridanus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445565"
  },
  {
    "id": "carcharhinus-gangeticus",
    "name": "Carcharhinus gangeticus",
    "scientificName": "Carcharhinus gangeticus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445569"
  },
  {
    "id": "carcharhinus-glyphis",
    "name": "Carcharhinus glyphis",
    "scientificName": "Carcharhinus glyphis",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445571"
  },
  {
    "id": "carcharhinus-humani",
    "name": "Carcharhinus humani",
    "scientificName": "Carcharhinus humani",
    "genus": "Carcharhinus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q17275426"
  },
  {
    "id": "carcharhinus-improvisus",
    "name": "Carcharhinus improvisus",
    "scientificName": "Carcharhinus improvisus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445574"
  },
  {
    "id": "carcharhinus-japonicus",
    "name": "Carcharhinus japonicus",
    "scientificName": "Carcharhinus japonicus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445576"
  },
  {
    "id": "carcharhinus-latistomus",
    "name": "Carcharhinus latistomus",
    "scientificName": "Carcharhinus latistomus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q15227510"
  },
  {
    "id": "carcharhinus-leucas",
    "name": "Carcharhinus leucas",
    "scientificName": "Carcharhinus leucas",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q190469"
  },
  {
    "id": "carcharhinus-macki",
    "name": "Carcharhinus macki",
    "scientificName": "Carcharhinus macki",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445581"
  },
  {
    "id": "carcharhinus-macrops",
    "name": "Carcharhinus macrops",
    "scientificName": "Carcharhinus macrops",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q82289"
  },
  {
    "id": "carcharhinus-maculipinnis",
    "name": "Carcharhinus maculipinnis",
    "scientificName": "Carcharhinus maculipinnis",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445583"
  },
  {
    "id": "carcharhinus-maou",
    "name": "Carcharhinus maou",
    "scientificName": "Carcharhinus maou",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445584"
  },
  {
    "id": "carcharhinus-menisorrah",
    "name": "Carcharhinus menisorrah",
    "scientificName": "Carcharhinus menisorrah",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2937991"
  },
  {
    "id": "carcharhinus-microphthalmus",
    "name": "Carcharhinus microphthalmus",
    "scientificName": "Carcharhinus microphthalmus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445589"
  },
  {
    "id": "carcharhinus-milberti",
    "name": "Carcharhinus milberti",
    "scientificName": "Carcharhinus milberti",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445597"
  },
  {
    "id": "carcharhinus-natator",
    "name": "Carcharhinus natator",
    "scientificName": "Carcharhinus natator",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445599"
  },
  {
    "id": "carcharhinus-nicaraguensis",
    "name": "Carcharhinus nicaraguensis",
    "scientificName": "Carcharhinus nicaraguensis",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445615"
  },
  {
    "id": "carcharhinus-obscunella",
    "name": "Carcharhinus obscunella",
    "scientificName": "Carcharhinus obscunella",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q11090340"
  },
  {
    "id": "carcharhinus-obscurella",
    "name": "Carcharhinus obscurella",
    "scientificName": "Carcharhinus obscurella",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055043"
  },
  {
    "id": "carcharhinus-obsolerus",
    "name": "Carcharhinus obsolerus",
    "scientificName": "Carcharhinus obsolerus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q119890562"
  },
  {
    "id": "carcharhinus-obsoletus",
    "name": "Carcharhinus obsoletus",
    "scientificName": "Carcharhinus obsoletus",
    "genus": "Carcharhinus",
    "conservationStatus": "Critically Endangered",
    "sourceUrl": "https://www.wikidata.org/wiki/Q60390440"
  },
  {
    "id": "carcharhinus-oxyrhynchus",
    "name": "Carcharhinus oxyrhynchus",
    "scientificName": "Carcharhinus oxyrhynchus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055044"
  },
  {
    "id": "carcharhinus-perezii",
    "name": "Carcharhinus perezii",
    "scientificName": "Carcharhinus perezi",
    "genus": "Carcharhinus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q592165"
  },
  {
    "id": "carcharhinus-platyodon",
    "name": "Carcharhinus platyodon",
    "scientificName": "Carcharhinus platyodon",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055045"
  },
  {
    "id": "carcharhinus-platyrhynchus",
    "name": "Carcharhinus platyrhynchus",
    "scientificName": "Carcharhinus platyrhynchus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055047"
  },
  {
    "id": "carcharhinus-pleurotaenia",
    "name": "Carcharhinus pleurotaenia",
    "scientificName": "Carcharhinus pleurotaenia",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q10887197"
  },
  {
    "id": "carcharhinus-remotoides",
    "name": "Carcharhinus remotoides",
    "scientificName": "Carcharhinus remotoides",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q15233111"
  },
  {
    "id": "carcharhinus-remotus",
    "name": "Carcharhinus remotus",
    "scientificName": "Carcharhinus remotus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055049"
  },
  {
    "id": "carcharhinus-rochensis",
    "name": "Carcharhinus rochensis",
    "scientificName": "Carcharhinus rochensis",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445627"
  },
  {
    "id": "carcharhinus-sealei",
    "name": "Carcharhinus sealei",
    "scientificName": "Carcharhinus sealei",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1930228"
  },
  {
    "id": "carcharhinus-sorrah",
    "name": "Carcharhinus sorrah",
    "scientificName": "Carcharhinus sorrah",
    "genus": "Carcharhinus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q210052"
  },
  {
    "id": "carcharhinus-spallanzani",
    "name": "Carcharhinus spallanzani",
    "scientificName": "Carcharhinus spallanzani",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445629"
  },
  {
    "id": "carcharhinus-springeri",
    "name": "Carcharhinus springeri",
    "scientificName": "Carcharhinus springeri",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445637"
  },
  {
    "id": "carcharhinus-taurus",
    "name": "Carcharhinus taurus",
    "scientificName": "Carcharhinus taurus",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445644"
  },
  {
    "id": "carcharhinus-temmincki",
    "name": "Carcharhinus temmincki",
    "scientificName": "Carcharhinus temmincki",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445651"
  },
  {
    "id": "carcharhinus-tephrodes",
    "name": "Carcharhinus tephrodes",
    "scientificName": "Carcharhinus tephrodes",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445659"
  },
  {
    "id": "carcharhinus-tjutjot",
    "name": "Carcharhinus tjutjot",
    "scientificName": "Carcharhinus tjutjot",
    "genus": "Carcharhinus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1035607"
  },
  {
    "id": "carcharhinus-vanrooyeni",
    "name": "Carcharhinus vanrooyeni",
    "scientificName": "Carcharhinus vanrooyeni",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445668"
  },
  {
    "id": "carcharhinus-velox",
    "name": "Carcharhinus velox",
    "scientificName": "Carcharhinus velox",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445670"
  },
  {
    "id": "carcharhinus-wheeleri",
    "name": "Carcharhinus wheeleri",
    "scientificName": "Carcharhinus wheeleri",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2937992"
  },
  {
    "id": "carcharhinus-zambezensis",
    "name": "Carcharhinus zambezensis",
    "scientificName": "Carcharhinus zambezensis",
    "genus": "Carcharhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445674"
  },
  {
    "id": "carcharias-aaronis",
    "name": "Carcharias aaronis",
    "scientificName": "Carcharias aaronis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055236"
  },
  {
    "id": "carcharias-abbreviatus",
    "name": "Carcharias abbreviatus",
    "scientificName": "Carcharias abbreviatus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055237"
  },
  {
    "id": "carcharias-acutus",
    "name": "Carcharias acutus",
    "scientificName": "Carcharias acutus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055240"
  },
  {
    "id": "carcharias-aethalorus",
    "name": "Carcharias aethalorus",
    "scientificName": "Carcharias aethalorus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055241"
  },
  {
    "id": "carcharias-albimarginatus",
    "name": "Carcharias albimarginatus",
    "scientificName": "Carcharias albimarginatus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055242"
  },
  {
    "id": "carcharias-amblyrhynchos",
    "name": "Carcharias amblyrhynchos",
    "scientificName": "Carcharias amblyrhynchos",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055243"
  },
  {
    "id": "carcharias-amboinensis",
    "name": "Carcharias amboinensis",
    "scientificName": "Carcharias amboinensis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055244"
  },
  {
    "id": "carcharias-arenarias",
    "name": "Carcharias arenarias",
    "scientificName": "Carcharias arenarias",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q11140792"
  },
  {
    "id": "carcharias-arenarius",
    "name": "Carcharias arenarius",
    "scientificName": "Carcharias arenarius",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055245"
  },
  {
    "id": "carcharias-atwoodi",
    "name": "Carcharias atwoodi",
    "scientificName": "Carcharias atwoodi",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055246"
  },
  {
    "id": "carcharias-azureus",
    "name": "Carcharias azureus",
    "scientificName": "Carcharias azureus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055247"
  },
  {
    "id": "carcharias-bleekeri",
    "name": "Carcharias bleekeri",
    "scientificName": "Carcharias bleekeri",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055248"
  },
  {
    "id": "carcharias-borneensis",
    "name": "Carcharias borneensis",
    "scientificName": "Carcharias borneensis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q109531593"
  },
  {
    "id": "carcharias-brachyrhynchos",
    "name": "Carcharias brachyrhynchos",
    "scientificName": "Carcharias brachyrhynchos",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446124"
  },
  {
    "id": "carcharias-brachyurus",
    "name": "Carcharias brachyurus",
    "scientificName": "Carcharias brachyurus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446128"
  },
  {
    "id": "carcharias-brevipinna",
    "name": "Carcharias brevipinna",
    "scientificName": "Carcharias brevipinna",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446141"
  },
  {
    "id": "carcharias-ceruleus",
    "name": "Carcharias ceruleus",
    "scientificName": "Carcharias ceruleus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446142"
  },
  {
    "id": "carcharias-commersoni",
    "name": "Carcharias commersoni",
    "scientificName": "Carcharias commersoni",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446147"
  },
  {
    "id": "carcharias-crenidens",
    "name": "Carcharias crenidens",
    "scientificName": "Carcharias crenidens",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446149"
  },
  {
    "id": "carcharias-cuspidatus",
    "name": "Carcharias cuspidatus",
    "scientificName": "Carcharias cuspidatus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q101031472"
  },
  {
    "id": "carcharias-dumerilii",
    "name": "Carcharias dumerilii",
    "scientificName": "Carcharias dumerilii",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446155"
  },
  {
    "id": "carcharias-dussumieri",
    "name": "Carcharias dussumieri",
    "scientificName": "Carcharias dussumieri",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446162"
  },
  {
    "id": "carcharias-ehrenbergi",
    "name": "Carcharias ehrenbergi",
    "scientificName": "Carcharias ehrenbergi",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446164"
  },
  {
    "id": "carcharias-elegans",
    "name": "Carcharias elegans",
    "scientificName": "Carcharias elegans",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446169"
  },
  {
    "id": "carcharias-ellioti",
    "name": "Carcharias ellioti",
    "scientificName": "Carcharias ellioti",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446172"
  },
  {
    "id": "carcharias-eumeces",
    "name": "Carcharias eumeces",
    "scientificName": "Carcharias eumeces",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446176"
  },
  {
    "id": "carcharias-falciformis",
    "name": "Carcharias falciformis",
    "scientificName": "Carcharias falciformis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446178"
  },
  {
    "id": "carcharias-falcipinnis",
    "name": "Carcharias falcipinnis",
    "scientificName": "Carcharias falcipinnis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055249"
  },
  {
    "id": "carcharias-fasciatus",
    "name": "Carcharias fasciatus",
    "scientificName": "Carcharias fasciatus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055250"
  },
  {
    "id": "carcharias-ferox",
    "name": "Carcharias ferox",
    "scientificName": "Carcharias ferox",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055251"
  },
  {
    "id": "carcharias-forskalii",
    "name": "Carcharias forskalii",
    "scientificName": "Carcharias forskalii",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055252"
  },
  {
    "id": "carcharias-fronto",
    "name": "Carcharias fronto",
    "scientificName": "Carcharias fronto",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055253"
  },
  {
    "id": "carcharias-galapagensis",
    "name": "Carcharias galapagensis",
    "scientificName": "Carcharias galapagensis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055254"
  },
  {
    "id": "carcharias-gangeticus",
    "name": "Carcharias gangeticus",
    "scientificName": "Carcharias gangeticus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055255"
  },
  {
    "id": "carcharias-glyphis",
    "name": "Carcharias glyphis",
    "scientificName": "Carcharias glyphis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055256"
  },
  {
    "id": "carcharias-gracilis",
    "name": "Carcharias gracilis",
    "scientificName": "Carcharias gracilis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055257"
  },
  {
    "id": "carcharias-griseus",
    "name": "Carcharias griseus",
    "scientificName": "Carcharias griseus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055258"
  },
  {
    "id": "carcharias-hemiodon",
    "name": "Carcharias hemiodon",
    "scientificName": "Carcharias hemiodon",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055259"
  },
  {
    "id": "carcharias-hemprichii",
    "name": "Carcharias hemprichii",
    "scientificName": "Carcharias hemprichii",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055260"
  },
  {
    "id": "carcharias-insularum",
    "name": "Carcharias insularum",
    "scientificName": "Carcharias insularum",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055261"
  },
  {
    "id": "carcharias-isodon",
    "name": "Carcharias isodon",
    "scientificName": "Carcharias isodon",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055262"
  },
  {
    "id": "carcharias-japonicus",
    "name": "Carcharias japonicus",
    "scientificName": "Carcharias japonicus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055263"
  },
  {
    "id": "carcharias-kamoharai",
    "name": "Carcharias kamoharai",
    "scientificName": "Carcharias kamoharai",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q109531598"
  },
  {
    "id": "carcharias-lalandii",
    "name": "Carcharias lalandii",
    "scientificName": "Carcharias lalandii",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055264"
  },
  {
    "id": "carcharias-lamia",
    "name": "Carcharias lamia",
    "scientificName": "Carcharias lamia",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055265"
  },
  {
    "id": "carcharias-lamiella",
    "name": "Carcharias lamiella",
    "scientificName": "Carcharias lamiella",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055266"
  },
  {
    "id": "carcharias-latistomus",
    "name": "Carcharias latistomus",
    "scientificName": "Carcharias latistomus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055268"
  },
  {
    "id": "carcharias-leucas",
    "name": "Carcharias leucas",
    "scientificName": "Carcharias leucas",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055270"
  },
  {
    "id": "carcharias-limbatus",
    "name": "Carcharias limbatus",
    "scientificName": "Carcharias limbatus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055271"
  },
  {
    "id": "carcharias-longimanus",
    "name": "Carcharias longimanus",
    "scientificName": "Carcharias longimanus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055272"
  },
  {
    "id": "carcharias-longurio",
    "name": "Carcharias longurio",
    "scientificName": "Carcharias longurio",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055279"
  },
  {
    "id": "carcharias-macloti",
    "name": "Carcharias macloti",
    "scientificName": "Carcharias macloti",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055285"
  },
  {
    "id": "carcharias-macrurus",
    "name": "Carcharias macrurus",
    "scientificName": "Carcharias macrurus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446209"
  },
  {
    "id": "carcharias-maculipinna",
    "name": "Carcharias maculipinna",
    "scientificName": "Carcharias maculipinna",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446211"
  },
  {
    "id": "carcharias-malabaricus",
    "name": "Carcharias malabaricus",
    "scientificName": "Carcharias malabaricus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446213"
  },
  {
    "id": "carcharias-marianensis",
    "name": "Carcharias marianensis",
    "scientificName": "Carcharias marianensis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446216"
  },
  {
    "id": "carcharias-maso",
    "name": "Carcharias maso",
    "scientificName": "Carcharias maso",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446218"
  },
  {
    "id": "carcharias-melanopterus",
    "name": "Carcharias melanopterus",
    "scientificName": "Carcharias melanopterus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q20717294"
  },
  {
    "id": "carcharias-menisorrah",
    "name": "Carcharias menisorrah",
    "scientificName": "Carcharias menisorrah",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446225"
  },
  {
    "id": "carcharias-microps",
    "name": "Carcharias microps",
    "scientificName": "Carcharias microps",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446230"
  },
  {
    "id": "carcharias-milberti",
    "name": "Carcharias milberti",
    "scientificName": "Carcharias milberti",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446232"
  },
  {
    "id": "carcharias-munzingeri",
    "name": "Carcharias munzingeri",
    "scientificName": "Carcharias munzingeri",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446237"
  },
  {
    "id": "carcharias-murrayi",
    "name": "Carcharias murrayi",
    "scientificName": "Carcharias murrayi",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055293"
  },
  {
    "id": "carcharias-nesiotes",
    "name": "Carcharias nesiotes",
    "scientificName": "Carcharias nesiotes",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055295"
  },
  {
    "id": "carcharias-noronhai",
    "name": "Carcharias noronhai",
    "scientificName": "Carcharias noronhai",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055296"
  },
  {
    "id": "carcharias-obesus",
    "name": "Carcharias obesus",
    "scientificName": "Carcharias obesus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055298"
  },
  {
    "id": "carcharias-obtusirostris",
    "name": "Carcharias obtusirostris",
    "scientificName": "Carcharias obtusirostris",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055302"
  },
  {
    "id": "carcharias-obtusus",
    "name": "Carcharias obtusus",
    "scientificName": "Carcharias obtusus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055306"
  },
  {
    "id": "carcharias-owstoni",
    "name": "Carcharias owstoni",
    "scientificName": "Carcharias owstoni",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q11122721"
  },
  {
    "id": "carcharias-oxyrhynchus",
    "name": "Carcharias oxyrhynchus",
    "scientificName": "Carcharias oxyrhynchus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055308"
  },
  {
    "id": "carcharias-palasorra",
    "name": "Carcharias palasorra",
    "scientificName": "Carcharias palasorra",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055313"
  },
  {
    "id": "carcharias-phorcys",
    "name": "Carcharias phorcys",
    "scientificName": "Carcharias phorcys",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055315"
  },
  {
    "id": "carcharias-platensis",
    "name": "Carcharias platensis",
    "scientificName": "Carcharias platensis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055321"
  },
  {
    "id": "carcharias-playfairii",
    "name": "Carcharias playfairii",
    "scientificName": "Carcharias playfairii",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055322"
  },
  {
    "id": "carcharias-porosus",
    "name": "Carcharias porosus",
    "scientificName": "Carcharias porosus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055323"
  },
  {
    "id": "carcharias-remotus",
    "name": "Carcharias remotus",
    "scientificName": "Carcharias remotus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055325"
  },
  {
    "id": "carcharias-robustus",
    "name": "Carcharias robustus",
    "scientificName": "Carcharias robustus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25400503"
  },
  {
    "id": "carcharias-rondeletti",
    "name": "Carcharias rondeletti",
    "scientificName": "Carcharias rondeletti",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055326"
  },
  {
    "id": "carcharias-sealei",
    "name": "Carcharias sealei",
    "scientificName": "Carcharias sealei",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055327"
  },
  {
    "id": "carcharias-siamensis",
    "name": "Carcharias siamensis",
    "scientificName": "Carcharias siamensis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055328"
  },
  {
    "id": "carcharias-sorrah",
    "name": "Carcharias sorrah",
    "scientificName": "Carcharias sorrah",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055329"
  },
  {
    "id": "carcharias-sorrahkowah",
    "name": "Carcharias sorrahkowah",
    "scientificName": "Carcharias sorrahkowah",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055331"
  },
  {
    "id": "carcharias-sorrakowah",
    "name": "Carcharias sorrakowah",
    "scientificName": "Carcharias sorrakowah",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055332"
  },
  {
    "id": "carcharias-spallanzani",
    "name": "Carcharias spallanzani",
    "scientificName": "Carcharias spallanzani",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055333"
  },
  {
    "id": "carcharias-spenceri",
    "name": "Carcharias spenceri",
    "scientificName": "Carcharias spenceri",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055334"
  },
  {
    "id": "carcharias-stevensi",
    "name": "Carcharias stevensi",
    "scientificName": "Carcharias stevensi",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055335"
  },
  {
    "id": "carcharias-taeniatus",
    "name": "Carcharias taeniatus",
    "scientificName": "Carcharias taeniatus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055337"
  },
  {
    "id": "carcharias-temminckii",
    "name": "Carcharias temminckii",
    "scientificName": "Carcharias temminckii",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055339"
  },
  {
    "id": "carcharias-tephrodes",
    "name": "Carcharias tephrodes",
    "scientificName": "Carcharias tephrodes",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055340"
  },
  {
    "id": "carcharias-tigris",
    "name": "Carcharias tigris",
    "scientificName": "Carcharias tigris",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446266"
  },
  {
    "id": "carcharias-verus",
    "name": "Carcharias verus",
    "scientificName": "Carcharias verus",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446268"
  },
  {
    "id": "carcharias-vorax",
    "name": "Carcharias vorax",
    "scientificName": "Carcharias vorax",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446270"
  },
  {
    "id": "carcharias-vulgaris",
    "name": "Carcharias vulgaris",
    "scientificName": "Carcharias vulgaris",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446273"
  },
  {
    "id": "carcharias-vulpes",
    "name": "Carcharias vulpes",
    "scientificName": "Carcharias vulpes",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446276"
  },
  {
    "id": "carcharias-walbeehmi",
    "name": "Carcharias walbeehmi",
    "scientificName": "Carcharias walbeehmi",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446279"
  },
  {
    "id": "carcharias-walbeehmii",
    "name": "Carcharias walbeehmii",
    "scientificName": "Carcharias walbeehmii",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446281"
  },
  {
    "id": "carcharias-watu",
    "name": "Carcharias watu",
    "scientificName": "Carcharias watu",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055341"
  },
  {
    "id": "carcharias-yangi",
    "name": "Carcharias yangi",
    "scientificName": "Carcharias yangi",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055342"
  },
  {
    "id": "carcharias-zambezensis",
    "name": "Carcharias zambezensis",
    "scientificName": "Carcharias zambezensis",
    "genus": "Carcharias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055343"
  },
  {
    "id": "carcharocles-angustidens",
    "name": "Carcharocles angustidens",
    "scientificName": "Carcharocles angustidens",
    "genus": "Carcharocles",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5038154"
  },
  {
    "id": "carcharocles-auriculatus",
    "name": "Carcharocles auriculatus",
    "scientificName": "Carcharocles auriculatus",
    "genus": "Carcharocles",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5038153"
  },
  {
    "id": "carcharocles-chubutensis",
    "name": "Carcharocles chubutensis",
    "scientificName": "Carcharodon subauriculatus",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5038155"
  },
  {
    "id": "carcharocles-sokolovi",
    "name": "Carcharocles sokolovi",
    "scientificName": "Otodus sokolovi",
    "genus": "Otodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q85750618"
  },
  {
    "id": "carcharodon-albimors",
    "name": "Carcharodon albimors",
    "scientificName": "Carcharodon albimors",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446066"
  },
  {
    "id": "carcharodon-angustidens",
    "name": "Carcharodon angustidens",
    "scientificName": "Carcharodon angustidens",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5749004"
  },
  {
    "id": "carcharodon-arnoldi",
    "name": "Carcharodon arnoldi",
    "scientificName": "Carcharodon arnoldi",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q101031362"
  },
  {
    "id": "carcharodon-capensis",
    "name": "Carcharodon capensis",
    "scientificName": "Carcharodon capensis",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446071"
  },
  {
    "id": "carcharodon-hubbelli",
    "name": "Carcharodon hubbelli",
    "scientificName": "Carcharodon hubbelli",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q551403"
  },
  {
    "id": "carcharodon-megalodon",
    "name": "Carcharodon megalodon",
    "scientificName": "Carcharodon megalodon",
    "genus": "Otodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q16107846"
  },
  {
    "id": "carcharodon-plicatilis",
    "name": "Carcharodon plicatilis",
    "scientificName": "Carcharodon plicatilis",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135234176"
  },
  {
    "id": "carcharodon-rondeletii",
    "name": "Carcharodon rondeletii",
    "scientificName": "Carcharodon rondeletii",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446074"
  },
  {
    "id": "carcharodon-smithi",
    "name": "Carcharodon smithi",
    "scientificName": "Carcharodon smithi",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446076"
  },
  {
    "id": "carcharodon-smithii",
    "name": "Carcharodon smithii",
    "scientificName": "Carcharodon smithii",
    "genus": "Carcharodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055207"
  },
  {
    "id": "carcharoides-catticus",
    "name": "Carcharoides catticus",
    "scientificName": "Carcharoides catticus",
    "genus": "Carcharoides",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133350967"
  },
  {
    "id": "carcharoides-lipsiensis",
    "name": "Carcharoides lipsiensis",
    "scientificName": "Carcharoides lipsiensis",
    "genus": "Carcharoides",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133350017"
  },
  {
    "id": "carcharoides-tenuidens",
    "name": "Carcharoides tenuidens",
    "scientificName": "Carcharoides tenuidens",
    "genus": "Carcharoides",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133350089"
  },
  {
    "id": "carcharoides-totuserratus",
    "name": "Carcharoides totuserratus",
    "scientificName": "Carcharoides totuserratus",
    "genus": "Carcharoides",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133350793"
  },
  {
    "id": "carcharomodus-escheri",
    "name": "Carcharomodus escheri",
    "scientificName": "Carcharomodus escheri",
    "genus": "Carcharomodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21345515"
  },
  {
    "id": "cardabiodon-ricki",
    "name": "Cardabiodon ricki",
    "scientificName": "Cardabiodon ricki",
    "genus": "Cardabiodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q23654452"
  },
  {
    "id": "cardabiodon-venator",
    "name": "Cardabiodon venator",
    "scientificName": "Cardabiodon venator",
    "genus": "Cardabiodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q58498149"
  },
  {
    "id": "caribbean-lanternshark",
    "name": "Caribbean lanternshark",
    "scientificName": "Etmopterus hillianus",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2678564"
  },
  {
    "id": "caribbean-roughshark",
    "name": "Caribbean roughshark",
    "scientificName": "Oxynotus caribbaeus",
    "genus": "Oxynotus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q139510"
  },
  {
    "id": "caribbean-sharpnose-shark",
    "name": "Caribbean sharpnose shark",
    "scientificName": "Rhizoprionodon porosus",
    "genus": "Rhizoprionodon",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1729352"
  },
  {
    "id": "carolina-hammerhead",
    "name": "Carolina hammerhead",
    "scientificName": "Sphyrna gilberti",
    "genus": "Sphyrna",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q15139804"
  },
  {
    "id": "caucasochasma-zherikhini",
    "name": "Caucasochasma zherikhini",
    "scientificName": "Caucasochasma zherikhini",
    "genus": "Caucasochasma",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133351622"
  },
  {
    "id": "cederstroemia-nilsi",
    "name": "Cederstroemia nilsi",
    "scientificName": "Cederstroemia nilsi",
    "genus": "Cederstroemia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363761"
  },
  {
    "id": "cederstroemia-siverssoni",
    "name": "Cederstroemia siverssoni",
    "scientificName": "Cederstroemia siverssoni",
    "genus": "Cederstroemia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363692"
  },
  {
    "id": "cederstroemia-triangulata",
    "name": "Cederstroemia triangulata",
    "scientificName": "Cederstroemia triangulata",
    "genus": "Cederstroemia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363765"
  },
  {
    "id": "centracion-philippi",
    "name": "Centracion philippi",
    "scientificName": "Centracion philippi",
    "genus": "Centracion",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333135"
  },
  {
    "id": "centrophorus-armatus",
    "name": "Centrophorus armatus",
    "scientificName": "Centrophorus armatus",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q61885020"
  },
  {
    "id": "centrophorus-bragancae",
    "name": "Centrophorus bragancae",
    "scientificName": "Centrophorus bragancae",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446388"
  },
  {
    "id": "centrophorus-foliaceus",
    "name": "Centrophorus foliaceus",
    "scientificName": "Centrophorus foliaceus",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446389"
  },
  {
    "id": "centrophorus-harrissoni",
    "name": "Centrophorus harrissoni",
    "scientificName": "Centrophorus harrissoni",
    "genus": "Centrophorus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q994856"
  },
  {
    "id": "centrophorus-kaikourae",
    "name": "Centrophorus kaikourae",
    "scientificName": "Centrophorus kaikourae",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446394"
  },
  {
    "id": "centrophorus-lesliei",
    "name": "Centrophorus lesliei",
    "scientificName": "Centrophorus lesliei",
    "genus": "Centrophorus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q52254211"
  },
  {
    "id": "centrophorus-longipinnis",
    "name": "Centrophorus longipinnis",
    "scientificName": "Centrophorus longipinnis",
    "genus": "Centrophorus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q52254212"
  },
  {
    "id": "centrophorus-machiquensis",
    "name": "Centrophorus machiquensis",
    "scientificName": "Centrophorus machiquensis",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446395"
  },
  {
    "id": "centrophorus-nilsoni",
    "name": "Centrophorus nilsoni",
    "scientificName": "Centrophorus nilsoni",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446399"
  },
  {
    "id": "centrophorus-robustus",
    "name": "Centrophorus robustus",
    "scientificName": "Centrophorus robustus",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5034812"
  },
  {
    "id": "centrophorus-scalpratus",
    "name": "Centrophorus scalpratus",
    "scientificName": "Centrophorus scalpratus",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446400"
  },
  {
    "id": "centrophorus-seychellorum",
    "name": "Centrophorus seychellorum",
    "scientificName": "Centrophorus seychellorum",
    "genus": "Centrophorus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5017665"
  },
  {
    "id": "centrophorus-squamulosus",
    "name": "Centrophorus squamulosus",
    "scientificName": "Centrophorus squamulosus",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446404"
  },
  {
    "id": "centrophorus-stehlini",
    "name": "Centrophorus stehlini",
    "scientificName": "Centrophorus stehlini",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135687036"
  },
  {
    "id": "centrophorus-uyato",
    "name": "Centrophorus uyato",
    "scientificName": "Centrophorus uyato",
    "genus": "Centrophorus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q22078530"
  },
  {
    "id": "centrophorus-westraliensis",
    "name": "Centrophorus westraliensis",
    "scientificName": "Centrophorus westraliensis",
    "genus": "Centrophorus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q6393810"
  },
  {
    "id": "centrophorus-zeehaani",
    "name": "Centrophorus zeehaani",
    "scientificName": "Centrophorus zeehaani",
    "genus": "Centrophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5031524"
  },
  {
    "id": "centroscyllium-ruscosum",
    "name": "Centroscyllium ruscosum",
    "scientificName": "Centroscyllium ruscosum",
    "genus": "Centroscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055387"
  },
  {
    "id": "centroscyllium-sheikoi",
    "name": "Centroscyllium sheikoi",
    "scientificName": "Centroscyllium sheikoi",
    "genus": "Centroscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21248382"
  },
  {
    "id": "centroscymnus-crepidater",
    "name": "Centroscymnus crepidater",
    "scientificName": "Centroscymnus crepidater",
    "genus": "Centroscymnus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q30106206"
  },
  {
    "id": "centroscymnus-fuscus",
    "name": "Centroscymnus fuscus",
    "scientificName": "Centroscymnus fuscus",
    "genus": "Centroscymnus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446511"
  },
  {
    "id": "centroscymnus-macracanthus",
    "name": "Centroscymnus macracanthus",
    "scientificName": "Centroscymnus macracanthus",
    "genus": "Centroscymnus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q28599117"
  },
  {
    "id": "centroscymnus-owstonii",
    "name": "Centroscymnus owstonii",
    "scientificName": "Centroscymnus owstonii",
    "genus": "Centroscymnus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1039246"
  },
  {
    "id": "centroscymnus-plunketi",
    "name": "Centroscymnus plunketi",
    "scientificName": "Centroscymnus plunketi",
    "genus": "Centroscymnus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q28599118"
  },
  {
    "id": "centroscymnus-squamulosus",
    "name": "Centroscymnus squamulosus",
    "scientificName": "Centroscymnus squamulosus",
    "genus": "Centroscymnus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446512"
  },
  {
    "id": "centroselachus-crepidater",
    "name": "Centroselachus crepidater",
    "scientificName": "Centroselachus crepidater",
    "genus": "Centroselachus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q576496"
  },
  {
    "id": "centrosqualus-primaevus",
    "name": "Centrosqualus primaevus",
    "scientificName": "Centrosqualus primaevus",
    "genus": "Centrosqualus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q41163300"
  },
  {
    "id": "cephaloscyllium-catum",
    "name": "Cephaloscyllium catum",
    "scientificName": "Cephaloscyllium catum",
    "genus": "Cephaloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445855"
  },
  {
    "id": "cephaloscyllium-circulopullum",
    "name": "Cephaloscyllium circulopullum",
    "scientificName": "Cephaloscyllium circulopullum",
    "genus": "Cephaloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950262"
  },
  {
    "id": "cephaloscyllium-formosanum",
    "name": "Cephaloscyllium formosanum",
    "scientificName": "Cephaloscyllium formosanum",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q16858721"
  },
  {
    "id": "cephaloscyllium-isabella",
    "name": "Cephaloscyllium isabella",
    "scientificName": "Cephaloscyllium isabella",
    "genus": "Cephaloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q116178328"
  },
  {
    "id": "cephaloscyllium-nascione",
    "name": "Cephaloscyllium nascione",
    "scientificName": "Cephaloscyllium nascione",
    "genus": "Cephaloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106445859"
  },
  {
    "id": "cephaloscyllium-parvum",
    "name": "Cephaloscyllium parvum",
    "scientificName": "Cephaloscyllium parvum",
    "genus": "Cephaloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q8343999"
  },
  {
    "id": "cephaloscyllium-sarawakense",
    "name": "Cephaloscyllium sarawakense",
    "scientificName": "Cephaloscyllium sarawakense",
    "genus": "Cephaloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q116178329"
  },
  {
    "id": "cephaloscyllium-stevensi",
    "name": "Cephaloscyllium stevensi",
    "scientificName": "Cephaloscyllium stevensi",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950240"
  },
  {
    "id": "cephaloscyllium-uter",
    "name": "Cephaloscyllium uter",
    "scientificName": "Cephaloscyllium uter",
    "genus": "Cephaloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055139"
  },
  {
    "id": "cetorhinus-huddlestoni",
    "name": "Cetorhinus huddlestoni",
    "scientificName": "Cetorhinus huddlestoni",
    "genus": "Cetorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q22105313"
  },
  {
    "id": "cetorhinus-maccoyi",
    "name": "Cetorhinus maccoyi",
    "scientificName": "Cetorhinus maccoyi",
    "genus": "Cetorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446053"
  },
  {
    "id": "cetorhinus-normani",
    "name": "Cetorhinus normani",
    "scientificName": "Cetorhinus normani",
    "genus": "Cetorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446057"
  },
  {
    "id": "cetorhinus-parvus",
    "name": "Cetorhinus parvus",
    "scientificName": "Cetorhinus parvus",
    "genus": "Cetorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2947094"
  },
  {
    "id": "cetorhinus-piersoni",
    "name": "Cetorhinus piersoni",
    "scientificName": "Cetorhinus piersoni",
    "genus": "Cetorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21346193"
  },
  {
    "id": "cetorhinus-rostratus",
    "name": "Cetorhinus rostratus",
    "scientificName": "Cetorhinus rostratus",
    "genus": "Cetorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446064"
  },
  {
    "id": "chaenogaleus-affinis",
    "name": "Chaenogaleus affinis",
    "scientificName": "Chaenogaleus affinis",
    "genus": "Chaenogaleus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5066568"
  },
  {
    "id": "chain-catshark",
    "name": "Chain catshark",
    "scientificName": "Scyliorhinus retifer",
    "genus": "Scyliorhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q648208"
  },
  {
    "id": "chiloscyllium-burmense",
    "name": "Chiloscyllium burmense",
    "scientificName": "Chiloscyllium burmense",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q116178353"
  },
  {
    "id": "chiloscyllium-caeruleopunctatum",
    "name": "Chiloscyllium caeruleopunctatum",
    "scientificName": "Chiloscyllium caeruleopunctatum",
    "genus": "Chiloscyllium",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q28846"
  },
  {
    "id": "chiloscyllium-colax",
    "name": "Chiloscyllium colax",
    "scientificName": "Chiloscyllium colax",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q15233099"
  },
  {
    "id": "chiloscyllium-confusum",
    "name": "Chiloscyllium confusum",
    "scientificName": "Chiloscyllium confusum",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2963632"
  },
  {
    "id": "chiloscyllium-dolganovi",
    "name": "Chiloscyllium dolganovi",
    "scientificName": "Chiloscyllium dolganovi",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2963631"
  },
  {
    "id": "chiloscyllium-frequens",
    "name": "Chiloscyllium frequens",
    "scientificName": "Chiloscyllium frequens",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363697"
  },
  {
    "id": "chiloscyllium-furvum",
    "name": "Chiloscyllium furvum",
    "scientificName": "Chiloscyllium furvum",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446316"
  },
  {
    "id": "chiloscyllium-margaritiferum",
    "name": "Chiloscyllium margaritiferum",
    "scientificName": "Chiloscyllium margaritiferum",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446319"
  },
  {
    "id": "chiloscyllium-modestum",
    "name": "Chiloscyllium modestum",
    "scientificName": "Chiloscyllium modestum",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446321"
  },
  {
    "id": "chiloscyllium-obscurum",
    "name": "Chiloscyllium obscurum",
    "scientificName": "Chiloscyllium obscurum",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446325"
  },
  {
    "id": "chiloscyllium-phymatodes",
    "name": "Chiloscyllium phymatodes",
    "scientificName": "Chiloscyllium phymatodes",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446328"
  },
  {
    "id": "chiloscyllium-trispeculare",
    "name": "Chiloscyllium trispeculare",
    "scientificName": "Chiloscyllium trispeculare",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446331"
  },
  {
    "id": "chiloscyllium-tuberculatus",
    "name": "Chiloscyllium tuberculatus",
    "scientificName": "Chiloscyllium tuberculatus",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446333"
  },
  {
    "id": "chiloscyllium-vulloi",
    "name": "Chiloscyllium vulloi",
    "scientificName": "Chiloscyllium vulloi",
    "genus": "Chiloscyllium",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363700"
  },
  {
    "id": "chlamydoselachus-africana",
    "name": "Chlamydoselachus africana",
    "scientificName": "Chlamydoselachus africana",
    "genus": "Chlamydoselachus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q311680"
  },
  {
    "id": "chlamydoselachus-anguineus",
    "name": "Chlamydoselachus anguineus",
    "scientificName": "Chlamydoselachus anguineus",
    "genus": "Chlamydoselachus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q194312"
  },
  {
    "id": "chlamydoselachus-bracheri",
    "name": "Chlamydoselachus bracheri",
    "scientificName": "Rolfodon bracheri",
    "genus": "Rolfodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2964059"
  },
  {
    "id": "chlamydoselachus-brancheri",
    "name": "Chlamydoselachus brancheri",
    "scientificName": "Chlamydoselachus brancheri",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q108073616"
  },
  {
    "id": "chlamydoselachus-fiedleri",
    "name": "Chlamydoselachus fiedleri",
    "scientificName": "Chlamydoselachus fiedleri",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2964058"
  },
  {
    "id": "chlamydoselachus-garmani",
    "name": "Chlamydoselachus garmani",
    "scientificName": "Chlamydoselachus garmani",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q30971392"
  },
  {
    "id": "chlamydoselachus-goliath",
    "name": "Chlamydoselachus goliath",
    "scientificName": "Chlamydoselachus goliath",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2964061"
  },
  {
    "id": "chlamydoselachus-gracilis",
    "name": "Chlamydoselachus gracilis",
    "scientificName": "Chlamydoselachus gracilis",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2964060"
  },
  {
    "id": "chlamydoselachus-keyesi",
    "name": "Chlamydoselachus keyesi",
    "scientificName": "Chlamydoselachus keyesi",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21366529"
  },
  {
    "id": "chlamydoselachus-landinii",
    "name": "Chlamydoselachus landinii",
    "scientificName": "Chlamydoselachus landinii",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q22107344"
  },
  {
    "id": "chlamydoselachus-lawleyi",
    "name": "Chlamydoselachus lawleyi",
    "scientificName": "Chlamydoselachus lawleyi",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q744957"
  },
  {
    "id": "chlamydoselachus-thomsoni",
    "name": "Chlamydoselachus thomsoni",
    "scientificName": "Chlamydoselachus thomsoni",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2964063"
  },
  {
    "id": "chlamydoselachus-tobleri",
    "name": "Chlamydoselachus tobleri",
    "scientificName": "Chlamydoselachus tobleri",
    "genus": "Chlamydoselachus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2964064"
  },
  {
    "id": "cirrhigaleus-australis",
    "name": "Cirrhigaleus australis",
    "scientificName": "Cirrhigaleus australis",
    "genus": "Cirrhigaleus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q378551"
  },
  {
    "id": "cloudy-catshark",
    "name": "cloudy catshark",
    "scientificName": "Scyliorhinus torazame",
    "genus": "Scyliorhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2420891"
  },
  {
    "id": "cobbler-wobbegong",
    "name": "cobbler wobbegong",
    "scientificName": "Sutorectus tentaculatus",
    "genus": "Sutorectus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q31776"
  },
  {
    "id": "collared-carpetshark",
    "name": "Collared carpetshark",
    "scientificName": "Parascyllium collare",
    "genus": "Parascyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q31851"
  },
  {
    "id": "combtooth-dogfish",
    "name": "Combtooth dogfish",
    "scientificName": "Centroscyllium nigrum",
    "genus": "Centroscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q953539"
  },
  {
    "id": "combtooth-lanternshark",
    "name": "Combtooth lanternshark",
    "scientificName": "Etmopterus decacuspidatus",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2408359"
  },
  {
    "id": "common-smooth-hound",
    "name": "common smooth-hound",
    "scientificName": "Mustelus mustelus",
    "genus": "Mustelus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q260097"
  },
  {
    "id": "common-thresher",
    "name": "common thresher",
    "scientificName": "Alopias vulpinus",
    "genus": "Alopias",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q618595"
  },
  {
    "id": "comoro-cat-shark",
    "name": "Comoro cat shark",
    "scientificName": "Scyliorhinus comoroensis",
    "genus": "Scyliorhinus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1951832"
  },
  {
    "id": "conoporoderma-africanum",
    "name": "Conoporoderma africanum",
    "scientificName": "Conoporoderma africanum",
    "genus": "Conoporoderma",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333122"
  },
  {
    "id": "cook-s-swellshark",
    "name": "Cook's swellshark",
    "scientificName": "Cephaloscyllium cooki",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1950333"
  },
  {
    "id": "coral-catshark",
    "name": "Coral catshark",
    "scientificName": "Atelomycterus marmoratus",
    "genus": "Atelomycterus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1544346"
  },
  {
    "id": "cosmopolitodus-planus",
    "name": "Cosmopolitodus planus",
    "scientificName": "Cosmopolitodus planus",
    "genus": "Cosmopolitodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q137528608"
  },
  {
    "id": "cosmopolitodus-plicatilis",
    "name": "Cosmopolitodus plicatilis",
    "scientificName": "Cosmopolitodus plicatilis",
    "genus": "Cosmopolitodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135236048"
  },
  {
    "id": "crassescyliorhinus-germanicus",
    "name": "Crassescyliorhinus germanicus",
    "scientificName": "Crassescyliorhinus germanicus",
    "genus": "Crassescyliorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q41163878"
  },
  {
    "id": "crassodontidanus-serratus",
    "name": "Crassodontidanus serratus",
    "scientificName": "Crassodontidanus serratus",
    "genus": "Crassodontidanus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133351882"
  },
  {
    "id": "crassodontidanus-wiedenrothi",
    "name": "Crassodontidanus wiedenrothi",
    "scientificName": "Crassodontidanus wiedenrothi",
    "genus": "Crassodontidanus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133351957"
  },
  {
    "id": "creek-whaler",
    "name": "Creek whaler",
    "scientificName": "Carcharhinus fitzroyensis",
    "genus": "Carcharhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q175689"
  },
  {
    "id": "crested-bullhead-shark",
    "name": "crested bullhead shark",
    "scientificName": "Heterodontus galeatus",
    "genus": "Heterodontus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1153211"
  },
  {
    "id": "cretalamna-appendiculata",
    "name": "Cretalamna appendiculata",
    "scientificName": "Cretalamna appendiculata",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347478"
  },
  {
    "id": "cretalamna-aschersoni",
    "name": "Cretalamna aschersoni",
    "scientificName": "Cretalamna aschersoni",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q41214852"
  },
  {
    "id": "cretalamna-borealis",
    "name": "Cretalamna borealis",
    "scientificName": "Cretalamna borealis",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347484"
  },
  {
    "id": "cretalamna-catoxodon",
    "name": "Cretalamna catoxodon",
    "scientificName": "Cretalamna catoxodon",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347490"
  },
  {
    "id": "cretalamna-deschutteri",
    "name": "Cretalamna deschutteri",
    "scientificName": "Cretalamna deschutteri",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347496"
  },
  {
    "id": "cretalamna-ewelli",
    "name": "Cretalamna ewelli",
    "scientificName": "Cretalamna ewelli",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347502"
  },
  {
    "id": "cretalamna-gertericorum",
    "name": "Cretalamna gertericorum",
    "scientificName": "Cretalamna gertericorum",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347508"
  },
  {
    "id": "cretalamna-hattini",
    "name": "Cretalamna hattini",
    "scientificName": "Cretalamna hattini",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347515"
  },
  {
    "id": "cretalamna-maroccana",
    "name": "Cretalamna maroccana",
    "scientificName": "Cretalamna maroccana",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q41214858"
  },
  {
    "id": "cretalamna-sarcoportheta",
    "name": "Cretalamna sarcoportheta",
    "scientificName": "Cretalamna sarcoportheta",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21347521"
  },
  {
    "id": "cretascyliorhinus-destombesi",
    "name": "Cretascyliorhinus destombesi",
    "scientificName": "Cretascyliorhinus destombesi",
    "genus": "Cretascyliorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q41163887"
  },
  {
    "id": "cretascymnus-adonis",
    "name": "Cretascymnus adonis",
    "scientificName": "Cretascymnus adonis",
    "genus": "Cretascymnus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135450907"
  },
  {
    "id": "cretascymnus-beauryi",
    "name": "Cretascymnus beauryi",
    "scientificName": "Cretascymnus beauryi",
    "genus": "Cretascymnus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135471928"
  },
  {
    "id": "cretolamna-gunsoni",
    "name": "Cretolamna gunsoni",
    "scientificName": "Cretolamna gunsoni",
    "genus": "Cretalamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133425821"
  },
  {
    "id": "cretomanta",
    "name": "Cretomanta",
    "scientificName": "Cretomanta",
    "genus": "Aquilolamnidae",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q134719925"
  },
  {
    "id": "cretomanta-canadensis",
    "name": "Cretomanta canadensis",
    "scientificName": "Cretomanta canadensis",
    "genus": "Cretomanta",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q134719918"
  },
  {
    "id": "cretorectolobus-olsoni",
    "name": "Cretorectolobus olsoni",
    "scientificName": "Cretorectolobus olsoni",
    "genus": "Cretorectolobus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q23654445"
  },
  {
    "id": "cretorectolobus-robustus",
    "name": "Cretorectolobus robustus",
    "scientificName": "Cretorectolobus robustus",
    "genus": "Cretorectolobus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q23654444"
  },
  {
    "id": "cretoxyrhina-agassizensis",
    "name": "Cretoxyrhina agassizensis",
    "scientificName": "Cretoxyrhina agassizensis",
    "genus": "Cretoxyrhina",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q23654451"
  },
  {
    "id": "cretoxyrhina-mantelli",
    "name": "Cretoxyrhina mantelli",
    "scientificName": "Cretoxyrhina mantelli",
    "genus": "Cretoxyrhina",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q60532113"
  },
  {
    "id": "crocodile-shark",
    "name": "crocodile shark",
    "scientificName": "Pseudocarcharias kamoharai",
    "genus": "Pseudocarcharias",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1368880"
  },
  {
    "id": "crossorhinus-dasypogon",
    "name": "Crossorhinus dasypogon",
    "scientificName": "Crossorhinus dasypogon",
    "genus": "Crossorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333145"
  },
  {
    "id": "crying-izak",
    "name": "Crying Izak",
    "scientificName": "Holohalaelurus melanostigma",
    "genus": "Holohalaelurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1952092"
  },
  {
    "id": "cuban-dogfish",
    "name": "Cuban dogfish",
    "scientificName": "Squalus cubensis",
    "genus": "Squalus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q994645"
  },
  {
    "id": "cuban-ribbontail-catshark",
    "name": "Cuban ribbontail catshark",
    "scientificName": "Eridacnis barbouri",
    "genus": "Eridacnis",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q421594"
  },
  {
    "id": "cylindrical-lanternshark",
    "name": "Cylindrical lanternshark",
    "scientificName": "Etmopterus carteri",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q245707"
  },
  {
    "id": "cynias-kanekonis",
    "name": "Cynias kanekonis",
    "scientificName": "Cynias kanekonis",
    "genus": "Cynias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333131"
  },
  {
    "id": "cyrano-spurdog",
    "name": "Cyrano spurdog",
    "scientificName": "Squalus rancureli",
    "genus": "Squalus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q994625"
  },
  {
    "id": "daggernose-shark",
    "name": "Daggernose shark",
    "scientificName": "Isogomphodon oxyrhynchus",
    "genus": "Isogomphodon",
    "conservationStatus": "Critically Endangered",
    "sourceUrl": "https://www.wikidata.org/wiki/Q942155"
  },
  {
    "id": "dalatias-licha",
    "name": "Dalatias licha",
    "scientificName": "Dalatias licha",
    "genus": "Dalatias",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1321783"
  },
  {
    "id": "dalatias-nocturnus",
    "name": "Dalatias nocturnus",
    "scientificName": "Dalatias nocturnus",
    "genus": "Dalatias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446430"
  },
  {
    "id": "dalatias-orientalis",
    "name": "Dalatias orientalis",
    "scientificName": "Dalatias orientalis",
    "genus": "Dalatias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135792575"
  },
  {
    "id": "dalatias-sparophagus",
    "name": "Dalatias sparophagus",
    "scientificName": "Dalatias sparophagus",
    "genus": "Dalatias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446433"
  },
  {
    "id": "dalatias-tachiensis",
    "name": "Dalatias tachiensis",
    "scientificName": "Dalatias tachiensis",
    "genus": "Dalatias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446436"
  },
  {
    "id": "dalatias-turkmenicus",
    "name": "Dalatias turkmenicus",
    "scientificName": "Dalatias turkmenicus",
    "genus": "Dalatias",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135792601"
  },
  {
    "id": "dallasiella-willistoni",
    "name": "Dallasiella willistoni",
    "scientificName": "Dallasiella willistoni",
    "genus": "Dallasiella",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q118299234"
  },
  {
    "id": "dark-freckled-catshark",
    "name": "Dark freckled catshark",
    "scientificName": "Scyliorhinus ugoi",
    "genus": "Scyliorhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q20686403"
  },
  {
    "id": "dark-shyshark",
    "name": "Dark shyshark",
    "scientificName": "Haploblepharus pictus",
    "genus": "Haploblepharus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q660343"
  },
  {
    "id": "deania-aciculata",
    "name": "Deania aciculata",
    "scientificName": "Deania aciculata",
    "genus": "Deania",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446405"
  },
  {
    "id": "deania-angoumeensis",
    "name": "Deania angoumeensis",
    "scientificName": "Deania angoumeensis",
    "genus": "Deania",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135687006"
  },
  {
    "id": "deania-calceus",
    "name": "Deania calceus",
    "scientificName": "Deania calceus",
    "genus": "Deania",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q111223800"
  },
  {
    "id": "deania-cremouxi",
    "name": "Deania cremouxi",
    "scientificName": "Deania cremouxi",
    "genus": "Deania",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446411"
  },
  {
    "id": "deania-eglantina",
    "name": "Deania eglantina",
    "scientificName": "Deania eglantina",
    "genus": "Deania",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446413"
  },
  {
    "id": "deania-elegans",
    "name": "Deania elegans",
    "scientificName": "Deania elegans",
    "genus": "Deania",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446417"
  },
  {
    "id": "deania-mauli",
    "name": "Deania mauli",
    "scientificName": "Deania mauli",
    "genus": "Deania",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446425"
  },
  {
    "id": "deania-quadrispinosum",
    "name": "Deania quadrispinosum",
    "scientificName": "Deania quadrispinosa",
    "genus": "Deania",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2026135"
  },
  {
    "id": "deania-rostrata",
    "name": "Deania rostrata",
    "scientificName": "Deania rostrata",
    "genus": "Deania",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446427"
  },
  {
    "id": "deepwater-catshark",
    "name": "Deepwater catshark",
    "scientificName": "Apristurus profundorum",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2510286"
  },
  {
    "id": "deepwater-sicklefin-hound-shark",
    "name": "deepwater sicklefin hound shark",
    "scientificName": "Hemitriakis abdita",
    "genus": "Hemitriakis",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1940051"
  },
  {
    "id": "dense-scale-lantern-shark",
    "name": "Dense-scale lantern shark",
    "scientificName": "Etmopterus pycnolepis",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q591597"
  },
  {
    "id": "dichichthys-melanobranchus",
    "name": "Dichichthys melanobranchus",
    "scientificName": "Dichichthys melanobranchus",
    "genus": "Dichichthys",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q109531596"
  },
  {
    "id": "dichichthys-satoi",
    "name": "Dichichthys satoi",
    "scientificName": "Dichichthys satoi",
    "genus": "Dichichthys",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q126600224"
  },
  {
    "id": "didymodus-anguineus",
    "name": "Didymodus anguineus",
    "scientificName": "Didymodus anguineus",
    "genus": "Didymodus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333146"
  },
  {
    "id": "dirrhizodon-elongatus",
    "name": "Dirrhizodon elongatus",
    "scientificName": "Dirrhizodon elongatus",
    "genus": "Dirrhizodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333112"
  },
  {
    "id": "dracipinna-bracheri",
    "name": "Dracipinna bracheri",
    "scientificName": "Dracipinna bracheri",
    "genus": "Dracipinna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q119098291"
  },
  {
    "id": "draughtsboard-shark",
    "name": "draughtsboard shark",
    "scientificName": "Cephaloscyllium isabellum",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2639518"
  },
  {
    "id": "dusky-catshark",
    "name": "Dusky catshark",
    "scientificName": "Bythaelurus canescens",
    "genus": "Bythaelurus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2615551"
  },
  {
    "id": "dusky-shark",
    "name": "Dusky shark",
    "scientificName": "Carcharhinus obscurus",
    "genus": "Carcharhinus",
    "conservationStatus": "Endangered status",
    "sourceUrl": "https://www.wikidata.org/wiki/Q833586"
  },
  {
    "id": "dusky-smooth-hound",
    "name": "dusky smooth-hound",
    "scientificName": "Mustelus canis",
    "genus": "Mustelus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q941962"
  },
  {
    "id": "dusky-snout-catshark",
    "name": "Dusky snout catshark",
    "scientificName": "Bythaelurus naylori",
    "genus": "Bythaelurus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q20686602"
  },
  {
    "id": "dwarf-catshark",
    "name": "Dwarf catshark",
    "scientificName": "Scyliorhinus torrei",
    "genus": "Scyliorhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2719453"
  },
  {
    "id": "dwarf-gulper-shark",
    "name": "dwarf gulper shark",
    "scientificName": "Centrophorus atromarginatus",
    "genus": "Centrophorus",
    "conservationStatus": "Critically Endangered",
    "sourceUrl": "https://www.wikidata.org/wiki/Q994653"
  },
  {
    "id": "dwarf-lanternshark",
    "name": "Dwarf lanternshark",
    "scientificName": "Etmopterus perryi",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q243971"
  },
  {
    "id": "dwarf-sawtail-catshark",
    "name": "Dwarf sawtail catshark",
    "scientificName": "Galeus schultzi",
    "genus": "Galeus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2719468"
  },
  {
    "id": "dwarf-spotted-wobbegong",
    "name": "dwarf spotted wobbegong",
    "scientificName": "Orectolobus parvimaculatus",
    "genus": "Orectolobus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q31815"
  },
  {
    "id": "dykeius-garethi",
    "name": "Dykeius garethi",
    "scientificName": "Dykeius garethi",
    "genus": "Dykeius",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q133352573"
  },
  {
    "id": "eastern-australian-sawshark",
    "name": "Eastern Australian sawshark",
    "scientificName": "Pristiophorus peroniensis",
    "genus": "Pristiophorus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3659115"
  },
  {
    "id": "eastern-banded-catshark",
    "name": "Eastern banded catshark",
    "scientificName": "Atelomycterus marnkalha",
    "genus": "Atelomycterus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q4034516"
  },
  {
    "id": "eastern-highfin-spurdog",
    "name": "Eastern highfin spurdog",
    "scientificName": "Squalus albifrons",
    "genus": "Squalus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2891490"
  },
  {
    "id": "eastern-longnose-spurdog",
    "name": "Eastern longnose spurdog",
    "scientificName": "Squalus grahami",
    "genus": "Squalus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3280990"
  },
  {
    "id": "echinorhinus-mccoyi",
    "name": "Echinorhinus mccoyi",
    "scientificName": "Echinorhinus mccoyi",
    "genus": "Echinorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055385"
  },
  {
    "id": "echinorhinus-obesus",
    "name": "Echinorhinus obesus",
    "scientificName": "Echinorhinus obesus",
    "genus": "Echinorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055386"
  },
  {
    "id": "echinorhinus-pfauntschi",
    "name": "Echinorhinus pfauntschi",
    "scientificName": "Echinorhinus pfauntschi",
    "genus": "Echinorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q1280679"
  },
  {
    "id": "echinorhinus-vielhus",
    "name": "Echinorhinus vielhus",
    "scientificName": "Echinorhinus vielhus",
    "genus": "Echinorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q22107153"
  },
  {
    "id": "echinorhinus-wadanohanaensis",
    "name": "Echinorhinus wadanohanaensis",
    "scientificName": "Echinorhinus wadanohanaensis",
    "genus": "Echinorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25386375"
  },
  {
    "id": "elongate-carpet-shark",
    "name": "Elongate carpet shark",
    "scientificName": "Parascyllium elongatum",
    "genus": "Parascyllium",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q31500"
  },
  {
    "id": "emissola-ganearum",
    "name": "Emissola ganearum",
    "scientificName": "Emissola ganearum",
    "genus": "Emissola",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333132"
  },
  {
    "id": "emissola-maugeana",
    "name": "Emissola maugeana",
    "scientificName": "Emissola maugeana",
    "genus": "Emissola",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333133"
  },
  {
    "id": "encheiridiodon-hendersoni",
    "name": "Encheiridiodon hendersoni",
    "scientificName": "Encheiridiodon hendersoni",
    "genus": "Encheiridiodon",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333149"
  },
  {
    "id": "eoetmopterus-davidi",
    "name": "Eoetmopterus davidi",
    "scientificName": "Eoetmopterus davidi",
    "genus": "Eoetmopterus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q135618272"
  },
  {
    "id": "eogaleus-bolcensis",
    "name": "Eogaleus bolcensis",
    "scientificName": "Eogaleus bolcensis",
    "genus": "Eogaleus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q55830858"
  },
  {
    "id": "eoptolamna-eccentrolopha",
    "name": "Eoptolamna eccentrolopha",
    "scientificName": "Eoptolamna eccentrolopha",
    "genus": "Eoptolamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363769"
  },
  {
    "id": "eoptolamna-supracretacea",
    "name": "Eoptolamna supracretacea",
    "scientificName": "Eoptolamna supracretacea",
    "genus": "Eoptolamna",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25363703"
  },
  {
    "id": "eosqualiolus-aturensis",
    "name": "Eosqualiolus aturensis",
    "scientificName": "Eosqualiolus aturensis",
    "genus": "Eosqualiolus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25360444"
  },
  {
    "id": "eosqualiolus-skrovinai",
    "name": "Eosqualiolus skrovinai",
    "scientificName": "Eosqualiolus skrovinai",
    "genus": "Eosqualiolus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q25360446"
  },
  {
    "id": "eostriatolamia-paucicorrugata",
    "name": "Eostriatolamia paucicorrugata",
    "scientificName": "Eostriatolamia paucicorrugata",
    "genus": "Eostriatolamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q23654446"
  },
  {
    "id": "epaulette-shark",
    "name": "epaulette shark",
    "scientificName": "Hemiscyllium ocellatum",
    "genus": "Hemiscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q29243"
  },
  {
    "id": "etmopterus-abernethyi",
    "name": "Etmopterus abernethyi",
    "scientificName": "Etmopterus abernethyi",
    "genus": "Etmopterus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055388"
  },
  {
    "id": "etmopterus-aculeatus",
    "name": "Etmopterus aculeatus",
    "scientificName": "Etmopterus aculeatus",
    "genus": "Etmopterus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055389"
  },
  {
    "id": "etmopterus-alphus",
    "name": "Etmopterus alphus",
    "scientificName": "Etmopterus alphus",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q28746374"
  },
  {
    "id": "etmopterus-bigelowei",
    "name": "Etmopterus bigelowei",
    "scientificName": "Etmopterus bigelowei",
    "genus": "Etmopterus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q21354223"
  },
  {
    "id": "etmopterus-brosei",
    "name": "Etmopterus brosei",
    "scientificName": "Etmopterus brosei",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q116178609"
  },
  {
    "id": "etmopterus-burgessi",
    "name": "Etmopterus burgessi",
    "scientificName": "Etmopterus burgessi",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3659270"
  },
  {
    "id": "etmopterus-compagnoi",
    "name": "Etmopterus compagnoi",
    "scientificName": "Etmopterus compagnoi",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5030071"
  },
  {
    "id": "etmopterus-dislineatus",
    "name": "Etmopterus dislineatus",
    "scientificName": "Etmopterus dislineatus",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q145690"
  },
  {
    "id": "etmopterus-frontimaculatus",
    "name": "Etmopterus frontimaculatus",
    "scientificName": "Etmopterus frontimaculatus",
    "genus": "Etmopterus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055390"
  },
  {
    "id": "etmopterus-joungi",
    "name": "Etmopterus joungi",
    "scientificName": "Etmopterus joungi",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5015825"
  },
  {
    "id": "etmopterus-lailae",
    "name": "Etmopterus lailae",
    "scientificName": "Etmopterus lailae",
    "genus": "Etmopterus",
    "conservationStatus": "Data Deficient",
    "sourceUrl": "https://www.wikidata.org/wiki/Q46644228"
  },
  {
    "id": "etmopterus-marshae",
    "name": "Etmopterus marshae",
    "scientificName": "Etmopterus marshae",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q61885698"
  },
  {
    "id": "etmopterus-parini",
    "name": "Etmopterus parini",
    "scientificName": "Etmopterus parini",
    "genus": "Etmopterus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q116178613"
  },
  {
    "id": "etmopterus-samadiae",
    "name": "Etmopterus samadiae",
    "scientificName": "Etmopterus samadiae",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q46644240"
  },
  {
    "id": "etmopterus-schmidti",
    "name": "Etmopterus schmidti",
    "scientificName": "Etmopterus schmidti",
    "genus": "Etmopterus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q8843691"
  },
  {
    "id": "etmopterus-sculptus",
    "name": "Etmopterus sculptus",
    "scientificName": "Etmopterus sculptus",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q5850105"
  },
  {
    "id": "etmopterus-sheikoi",
    "name": "Etmopterus sheikoi",
    "scientificName": "Etmopterus sheikoi",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q116178614"
  },
  {
    "id": "etmopterus-viator",
    "name": "Etmopterus viator",
    "scientificName": "Etmopterus viator",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q13613561"
  },
  {
    "id": "eucrossorhinus-dasypogon",
    "name": "Eucrossorhinus dasypogon",
    "scientificName": "Eucrossorhinus dasypogon",
    "genus": "Eucrossorhinus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q29090"
  },
  {
    "id": "eucrossorhinus-ogilbyi",
    "name": "Eucrossorhinus ogilbyi",
    "scientificName": "Eucrossorhinus ogilbyi",
    "genus": "Eucrossorhinus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446350"
  },
  {
    "id": "eugaleus-galeus",
    "name": "Eugaleus galeus",
    "scientificName": "Eugaleus galeus",
    "genus": "Eugaleus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333123"
  },
  {
    "id": "eugaleus-hyugaensis",
    "name": "Eugaleus hyugaensis",
    "scientificName": "Eugaleus hyugaensis",
    "genus": "Eugaleus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333124"
  },
  {
    "id": "eugaleus-omanensis",
    "name": "Eugaleus omanensis",
    "scientificName": "Eugaleus omanensis",
    "genus": "Eugaleus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333125"
  },
  {
    "id": "eulamia-ahenea",
    "name": "Eulamia ahenea",
    "scientificName": "Eulamia ahenea",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333086"
  },
  {
    "id": "eulamia-albimarginata",
    "name": "Eulamia albimarginata",
    "scientificName": "Eulamia albimarginata",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333087"
  },
  {
    "id": "eulamia-altima",
    "name": "Eulamia altima",
    "scientificName": "Eulamia altima",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333088"
  },
  {
    "id": "eulamia-gangetica",
    "name": "Eulamia gangetica",
    "scientificName": "Eulamia gangetica",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333089"
  },
  {
    "id": "eulamia-malpeloensis",
    "name": "Eulamia malpeloensis",
    "scientificName": "Eulamia malpeloensis",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333090"
  },
  {
    "id": "eulamia-menisorrah",
    "name": "Eulamia menisorrah",
    "scientificName": "Eulamia menisorrah",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333091"
  },
  {
    "id": "eulamia-milberti",
    "name": "Eulamia milberti",
    "scientificName": "Eulamia milberti",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333092"
  },
  {
    "id": "eulamia-nicaraguensis",
    "name": "Eulamia nicaraguensis",
    "scientificName": "Eulamia nicaraguensis",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333093"
  },
  {
    "id": "eulamia-obscura",
    "name": "Eulamia obscura",
    "scientificName": "Eulamia obscura",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333094"
  },
  {
    "id": "eulamia-odontaspis",
    "name": "Eulamia odontaspis",
    "scientificName": "Eulamia odontaspis",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333097"
  },
  {
    "id": "eulamia-platyrhynchus",
    "name": "Eulamia platyrhynchus",
    "scientificName": "Eulamia platyrhynchus",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333098"
  },
  {
    "id": "eulamia-pleurotaenia",
    "name": "Eulamia pleurotaenia",
    "scientificName": "Eulamia pleurotaenia",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333099"
  },
  {
    "id": "eulamia-spallanzani",
    "name": "Eulamia spallanzani",
    "scientificName": "Eulamia spallanzani",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333100"
  },
  {
    "id": "eulamia-springeri",
    "name": "Eulamia springeri",
    "scientificName": "Eulamia springeri",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333101"
  },
  {
    "id": "eulamia-temmincki",
    "name": "Eulamia temmincki",
    "scientificName": "Eulamia temmincki",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333102"
  },
  {
    "id": "eulamia-tephrodes",
    "name": "Eulamia tephrodes",
    "scientificName": "Eulamia tephrodes",
    "genus": "Eulamia",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107333103"
  },
  {
    "id": "euprotomicrus-hyalinus",
    "name": "Euprotomicrus hyalinus",
    "scientificName": "Euprotomicrus hyalinus",
    "genus": "Euprotomicrus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446442"
  },
  {
    "id": "euprotomicrus-labordii",
    "name": "Euprotomicrus labordii",
    "scientificName": "Euprotomicrus labordii",
    "genus": "Euprotomicrus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446446"
  },
  {
    "id": "euprotomicrus-laticaudus",
    "name": "Euprotomicrus laticaudus",
    "scientificName": "Euprotomicrus laticaudus",
    "genus": "Euprotomicrus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q106446448"
  },
  {
    "id": "eusphyra-blochii",
    "name": "Eusphyra blochii",
    "scientificName": "Eusphyra blochii",
    "genus": "Eusphyra",
    "conservationStatus": "Critically Endangered",
    "sourceUrl": "https://www.wikidata.org/wiki/Q890336"
  },
  {
    "id": "false-catshark",
    "name": "false catshark",
    "scientificName": "Pseudotriakis microdon",
    "genus": "Pseudotriakis",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q978303"
  },
  {
    "id": "false-lanternshark",
    "name": "False lanternshark",
    "scientificName": "Etmopterus pseudosqualiolus",
    "genus": "Etmopterus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3758660"
  },
  {
    "id": "fatspine-spurdog",
    "name": "Fatspine spurdog",
    "scientificName": "Squalus crassispinus",
    "genus": "Squalus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q3281142"
  },
  {
    "id": "figaro-melanobranchus",
    "name": "Figaro melanobranchus",
    "scientificName": "Figaro melanobranchus",
    "genus": "Figaro",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q107055140"
  },
  {
    "id": "figaro-piceus",
    "name": "Figaro piceus",
    "scientificName": "Figaro piceus",
    "genus": "Figaro",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q11116716"
  },
  {
    "id": "filetail-catshark",
    "name": "Filetail catshark",
    "scientificName": "Parmaturus xaniurus",
    "genus": "Parmaturus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2709696"
  },
  {
    "id": "finetooth-shark",
    "name": "Finetooth shark",
    "scientificName": "Carcharhinus isodon",
    "genus": "Carcharhinus",
    "conservationStatus": "Near Threatened",
    "sourceUrl": "https://www.wikidata.org/wiki/Q979951"
  },
  {
    "id": "flagtail-swellshark",
    "name": "Flagtail swellshark",
    "scientificName": "Cephaloscyllium signourum",
    "genus": "Cephaloscyllium",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q286591"
  },
  {
    "id": "flapnose-houndshark",
    "name": "flapnose houndshark",
    "scientificName": "Scylliogaleus quecketti",
    "genus": "Scylliogaleus",
    "conservationStatus": "Vulnerable",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2341869"
  },
  {
    "id": "flathead-catshark",
    "name": "flathead catshark",
    "scientificName": "Apristurus macrorhynchus",
    "genus": "Apristurus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q576911"
  },
  {
    "id": "flatnose-cat-shark",
    "name": "flatnose cat shark",
    "scientificName": "Apristurus acanutus",
    "genus": "Apristurus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q2258434"
  },
  {
    "id": "floral-banded-wobbegong",
    "name": "floral banded wobbegong",
    "scientificName": "Orectolobus floridus",
    "genus": "Orectolobus",
    "conservationStatus": "Least Concern",
    "sourceUrl": "https://www.wikidata.org/wiki/Q31490"
  },
  {
    "id": "fornicatus-austriacus",
    "name": "Fornicatus austriacus",
    "scientificName": "Fornicatus austriacus",
    "genus": "Fornicatus",
    "conservationStatus": "not listed",
    "sourceUrl": "https://www.wikidata.org/wiki/Q128712102"
  }
] as const;

export const buildingLibrary = [
  {
    "id": "burj-khalifa",
    "name": "Burj Khalifa",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 829.8,
    "heightFeet": 2722,
    "sourceUrl": "https://www.wikidata.org/wiki/Q12495"
  },
  {
    "id": "dubai-one-tower",
    "name": "Dubai One Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 711,
    "heightFeet": 2333,
    "sourceUrl": "https://www.wikidata.org/wiki/Q21609086"
  },
  {
    "id": "merdeka-118",
    "name": "Merdeka 118",
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "heightMeters": 678.9,
    "heightFeet": 2227,
    "sourceUrl": "https://www.wikidata.org/wiki/Q7969454"
  },
  {
    "id": "shanghai-tower",
    "name": "Shanghai Tower",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 632,
    "heightFeet": 2073,
    "sourceUrl": "https://www.wikidata.org/wiki/Q18547"
  },
  {
    "id": "abraj-al-bait",
    "name": "Abraj Al Bait",
    "city": "Mecca",
    "country": "Saudi Arabia",
    "heightMeters": 601,
    "heightFeet": 1972,
    "sourceUrl": "https://www.wikidata.org/wiki/Q189476"
  },
  {
    "id": "phuong-trach-tower",
    "name": "Phuong Trach Tower",
    "city": "unknown city",
    "country": "unknown country",
    "heightMeters": 600,
    "heightFeet": 1969,
    "sourceUrl": "https://www.wikidata.org/wiki/Q125217526"
  },
  {
    "id": "ping-an-finance-centre",
    "name": "Ping An Finance Centre",
    "city": "Futian Subdistrict",
    "country": "People's Republic of China",
    "heightMeters": 599.1,
    "heightFeet": 1966,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1077308"
  },
  {
    "id": "lotte-world-tower",
    "name": "Lotte World Tower",
    "city": "Songpa District",
    "country": "South Korea",
    "heightMeters": 555.7,
    "heightFeet": 1823,
    "sourceUrl": "https://www.wikidata.org/wiki/Q494895"
  },
  {
    "id": "one-world-trade-center",
    "name": "One World Trade Center",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 546.2,
    "heightFeet": 1792,
    "sourceUrl": "https://www.wikidata.org/wiki/Q11245"
  },
  {
    "id": "ctf-finance-centre",
    "name": "CTF Finance Centre",
    "city": "Guangzhou",
    "country": "People's Republic of China",
    "heightMeters": 530,
    "heightFeet": 1739,
    "sourceUrl": "https://www.wikidata.org/wiki/Q168575"
  },
  {
    "id": "china-zun",
    "name": "China Zun",
    "city": "Jianwai Subdistrict",
    "country": "People's Republic of China",
    "heightMeters": 528,
    "heightFeet": 1732,
    "sourceUrl": "https://www.wikidata.org/wiki/Q197833"
  },
  {
    "id": "dalian-greenland-center",
    "name": "Dalian Greenland Center",
    "city": "Dalian",
    "country": "People's Republic of China",
    "heightMeters": 518,
    "heightFeet": 1699,
    "sourceUrl": "https://www.wikidata.org/wiki/Q5210921"
  },
  {
    "id": "pentominium",
    "name": "Pentominium",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 516,
    "heightFeet": 1693,
    "sourceUrl": "https://www.wikidata.org/wiki/Q374662"
  },
  {
    "id": "taipei-101",
    "name": "Taipei 101",
    "city": "Xicun Village",
    "country": "Taiwan",
    "heightMeters": 508,
    "heightFeet": 1667,
    "sourceUrl": "https://www.wikidata.org/wiki/Q83101"
  },
  {
    "id": "shanghai-world-financial-center",
    "name": "Shanghai World Financial Center",
    "city": "Pudong",
    "country": "People's Republic of China",
    "heightMeters": 494.3,
    "heightFeet": 1622,
    "sourceUrl": "https://www.wikidata.org/wiki/Q80852"
  },
  {
    "id": "yongsan-landmark-tower",
    "name": "Yongsan Landmark Tower",
    "city": "unknown city",
    "country": "unknown country",
    "heightMeters": 485,
    "heightFeet": 1591,
    "sourceUrl": "https://www.wikidata.org/wiki/Q124842164"
  },
  {
    "id": "international-commerce-centre",
    "name": "International Commerce Centre",
    "city": "Yau Tsim Mong District",
    "country": "People's Republic of China",
    "heightMeters": 484,
    "heightFeet": 1588,
    "sourceUrl": "https://www.wikidata.org/wiki/Q317034"
  },
  {
    "id": "wuhan-greenland-center",
    "name": "Wuhan Greenland Center",
    "city": "Wuhan",
    "country": "People's Republic of China",
    "heightMeters": 475.6,
    "heightFeet": 1560,
    "sourceUrl": "https://www.wikidata.org/wiki/Q143235"
  },
  {
    "id": "central-park-tower",
    "name": "Central Park Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 472.4,
    "heightFeet": 1550,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2631701"
  },
  {
    "id": "oriental-pearl-tower",
    "name": "Oriental Pearl Tower",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 468,
    "heightFeet": 1535,
    "sourceUrl": "https://www.wikidata.org/wiki/Q223207"
  },
  {
    "id": "tianjin-r-f-guangdong-tower",
    "name": "Tianjin R&F Guangdong Tower",
    "city": "Binhai New Area",
    "country": "People's Republic of China",
    "heightMeters": 468,
    "heightFeet": 1535,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2431130"
  },
  {
    "id": "american-commerce-center",
    "name": "American Commerce Center",
    "city": "Philadelphia",
    "country": "United States",
    "heightMeters": 460,
    "heightFeet": 1509,
    "sourceUrl": "https://www.wikidata.org/wiki/Q463759"
  },
  {
    "id": "international-commerce-center-1",
    "name": "International Commerce Center 1",
    "city": "Chongqing",
    "country": "People's Republic of China",
    "heightMeters": 458,
    "heightFeet": 1503,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1666430"
  },
  {
    "id": "empire-state-building",
    "name": "Empire State Building",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 457.2,
    "heightFeet": 1500,
    "sourceUrl": "https://www.wikidata.org/wiki/Q9188"
  },
  {
    "id": "the-exchange-106",
    "name": "The Exchange 106",
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "heightMeters": 453.5,
    "heightFeet": 1488,
    "sourceUrl": "https://www.wikidata.org/wiki/Q27670200"
  },
  {
    "id": "changsha-ifs",
    "name": "Changsha IFS",
    "city": "Furong District",
    "country": "People's Republic of China",
    "heightMeters": 452.1,
    "heightFeet": 1483,
    "sourceUrl": "https://www.wikidata.org/wiki/Q5410187"
  },
  {
    "id": "petronas-towers",
    "name": "Petronas Towers",
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "heightMeters": 452,
    "heightFeet": 1483,
    "sourceUrl": "https://www.wikidata.org/wiki/Q83063"
  },
  {
    "id": "suzhou-ifs",
    "name": "Suzhou IFS",
    "city": "Suzhou",
    "country": "People's Republic of China",
    "heightMeters": 450,
    "heightFeet": 1476,
    "sourceUrl": "https://www.wikidata.org/wiki/Q617082"
  },
  {
    "id": "zifeng-tower",
    "name": "Zifeng Tower",
    "city": "Nanjing",
    "country": "People's Republic of China",
    "heightMeters": 450,
    "heightFeet": 1476,
    "sourceUrl": "https://www.wikidata.org/wiki/Q382121"
  },
  {
    "id": "willis-tower",
    "name": "Willis Tower",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 442.1,
    "heightFeet": 1450,
    "sourceUrl": "https://www.wikidata.org/wiki/Q29294"
  },
  {
    "id": "kingkey-100",
    "name": "Kingkey 100",
    "city": "Guiyuan Subdistrict",
    "country": "People's Republic of China",
    "heightMeters": 442,
    "heightFeet": 1450,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1470046"
  },
  {
    "id": "guangzhou-international-finance-center",
    "name": "Guangzhou International Finance Center",
    "city": "Guangzhou",
    "country": "People's Republic of China",
    "heightMeters": 440,
    "heightFeet": 1444,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1043438"
  },
  {
    "id": "80-south-street",
    "name": "80 South Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 438,
    "heightFeet": 1437,
    "sourceUrl": "https://www.wikidata.org/wiki/Q672984"
  },
  {
    "id": "wuhan-center",
    "name": "Wuhan Center",
    "city": "Wuhan",
    "country": "People's Republic of China",
    "heightMeters": 438,
    "heightFeet": 1437,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2484373"
  },
  {
    "id": "dubai-towers-doha",
    "name": "Dubai Towers Doha",
    "city": "Doha",
    "country": "Qatar",
    "heightMeters": 437,
    "heightFeet": 1434,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1207442"
  },
  {
    "id": "riverview-plaza",
    "name": "Riverview Plaza",
    "city": "Wuhan",
    "country": "People's Republic of China",
    "heightMeters": 436,
    "heightFeet": 1430,
    "sourceUrl": "https://www.wikidata.org/wiki/Q7338767"
  },
  {
    "id": "111-west-57th-street",
    "name": "111 West 57th Street",
    "city": "New York City",
    "country": "United States",
    "heightMeters": 435.3,
    "heightFeet": 1428,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2631268"
  },
  {
    "id": "diamond-tower",
    "name": "Diamond Tower",
    "city": "Jeddah",
    "country": "Saudi Arabia",
    "heightMeters": 432,
    "heightFeet": 1417,
    "sourceUrl": "https://www.wikidata.org/wiki/Q5270933"
  },
  {
    "id": "chongqing-tall-tower",
    "name": "Chongqing Tall Tower",
    "city": "Chongqing",
    "country": "People's Republic of China",
    "heightMeters": 431,
    "heightFeet": 1414,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1076139"
  },
  {
    "id": "asia-plaza",
    "name": "Asia Plaza",
    "city": "Kaohsiung",
    "country": "Taiwan",
    "heightMeters": 431,
    "heightFeet": 1414,
    "sourceUrl": "https://www.wikidata.org/wiki/Q24837257"
  },
  {
    "id": "432-park-avenue",
    "name": "432 Park Avenue",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 425.5,
    "heightFeet": 1396,
    "sourceUrl": "https://www.wikidata.org/wiki/Q233940"
  },
  {
    "id": "marina-101",
    "name": "Marina 101",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 425,
    "heightFeet": 1394,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1165269"
  },
  {
    "id": "trump-international-hotel-and-tower",
    "name": "Trump International Hotel and Tower",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 423.2,
    "heightFeet": 1388,
    "sourceUrl": "https://www.wikidata.org/wiki/Q546221"
  },
  {
    "id": "270-park-avenue",
    "name": "270 Park Avenue",
    "city": "New York City",
    "country": "United States",
    "heightMeters": 423.1,
    "heightFeet": 1388,
    "sourceUrl": "https://www.wikidata.org/wiki/Q109648853"
  },
  {
    "id": "kuala-lumpur-tower",
    "name": "Kuala Lumpur Tower",
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "heightMeters": 421,
    "heightFeet": 1381,
    "sourceUrl": "https://www.wikidata.org/wiki/Q745016"
  },
  {
    "id": "jin-mao-tower",
    "name": "Jin Mao Tower",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 421,
    "heightFeet": 1381,
    "sourceUrl": "https://www.wikidata.org/wiki/Q80813"
  },
  {
    "id": "princess-tower",
    "name": "Princess Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 414,
    "heightFeet": 1358,
    "sourceUrl": "https://www.wikidata.org/wiki/Q19492"
  },
  {
    "id": "al-hamra-tower",
    "name": "Al Hamra Tower",
    "city": "Kuwait City",
    "country": "Kuwait",
    "heightMeters": 412,
    "heightFeet": 1352,
    "sourceUrl": "https://www.wikidata.org/wiki/Q557933"
  },
  {
    "id": "haeundae-lct-the-sharp",
    "name": "Haeundae LCT The Sharp",
    "city": "Haeundae District",
    "country": "South Korea",
    "heightMeters": 411,
    "heightFeet": 1348,
    "sourceUrl": "https://www.wikidata.org/wiki/Q5961370"
  },
  {
    "id": "gift-diamond-tower",
    "name": "GIFT Diamond Tower",
    "city": "Ahmedabad",
    "country": "India",
    "heightMeters": 410,
    "heightFeet": 1345,
    "sourceUrl": "https://www.wikidata.org/wiki/Q5513479"
  },
  {
    "id": "ningbo-center",
    "name": "Ningbo Center",
    "city": "Ningbo",
    "country": "People's Republic of China",
    "heightMeters": 409,
    "heightFeet": 1342,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1605680"
  },
  {
    "id": "2-world-trade-center",
    "name": "2 World Trade Center",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 403.3,
    "heightFeet": 1323,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1127212"
  },
  {
    "id": "edgar-towers-skyvoid",
    "name": "Edgar Towers Skyvoid",
    "city": "New York City",
    "country": "United States",
    "heightMeters": 396.2,
    "heightFeet": 1300,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1284184"
  },
  {
    "id": "23-marina",
    "name": "23 Marina",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 392.4,
    "heightFeet": 1287,
    "sourceUrl": "https://www.wikidata.org/wiki/Q216264"
  },
  {
    "id": "citic-plaza",
    "name": "CITIC Plaza",
    "city": "Guangzhou",
    "country": "People's Republic of China",
    "heightMeters": 390.2,
    "heightFeet": 1280,
    "sourceUrl": "https://www.wikidata.org/wiki/Q245246"
  },
  {
    "id": "citymark-centre",
    "name": "Citymark Centre",
    "city": "Shenzhen",
    "country": "People's Republic of China",
    "heightMeters": 388,
    "heightFeet": 1273,
    "sourceUrl": "https://www.wikidata.org/wiki/Q130693037"
  },
  {
    "id": "luxury-hotel-residence-hotel",
    "name": "Luxury Hotel & Residence Hotel",
    "city": "unknown city",
    "country": "unknown country",
    "heightMeters": 385.9,
    "heightFeet": 1266,
    "sourceUrl": "https://www.wikidata.org/wiki/Q125179238"
  },
  {
    "id": "shun-hing-square",
    "name": "Shun Hing Square",
    "city": "Guiyuan Subdistrict",
    "country": "People's Republic of China",
    "heightMeters": 384,
    "heightFeet": 1260,
    "sourceUrl": "https://www.wikidata.org/wiki/Q236201"
  },
  {
    "id": "forum-66-tower-1",
    "name": "Forum 66 Tower 1",
    "city": "unknown city",
    "country": "People's Republic of China",
    "heightMeters": 384,
    "heightFeet": 1260,
    "sourceUrl": "https://www.wikidata.org/wiki/Q111669486"
  },
  {
    "id": "dalian-eton-center",
    "name": "Dalian Eton Center",
    "city": "Dalian",
    "country": "People's Republic of China",
    "heightMeters": 383.2,
    "heightFeet": 1257,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1139123"
  },
  {
    "id": "eton-place-dalian-tower-1",
    "name": "Eton Place Dalian Tower 1",
    "city": "Dalian",
    "country": "People's Republic of China",
    "heightMeters": 383.2,
    "heightFeet": 1257,
    "sourceUrl": "https://www.wikidata.org/wiki/Q24036646"
  },
  {
    "id": "central-market-project",
    "name": "Central Market Project",
    "city": "Abu Dhabi",
    "country": "United Arab Emirates",
    "heightMeters": 381,
    "heightFeet": 1250,
    "sourceUrl": "https://www.wikidata.org/wiki/Q615950"
  },
  {
    "id": "elite-residence",
    "name": "Elite Residence",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 381,
    "heightFeet": 1250,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1330847"
  },
  {
    "id": "busan-lotte-world-tower",
    "name": "Busan Lotte World Tower",
    "city": "Busan",
    "country": "South Korea",
    "heightMeters": 380,
    "heightFeet": 1247,
    "sourceUrl": "https://www.wikidata.org/wiki/Q496218"
  },
  {
    "id": "square-capital-tower",
    "name": "Square Capital Tower",
    "city": "Kuwait City",
    "country": "Kuwait",
    "heightMeters": 376,
    "heightFeet": 1234,
    "sourceUrl": "https://www.wikidata.org/wiki/Q691263"
  },
  {
    "id": "central-plaza",
    "name": "Central Plaza",
    "city": "Wan Chai District",
    "country": "People's Republic of China",
    "heightMeters": 374,
    "heightFeet": 1227,
    "sourceUrl": "https://www.wikidata.org/wiki/Q112640"
  },
  {
    "id": "china-merchants-prince-bay-tower",
    "name": "China Merchants Prince Bay Tower",
    "city": "unknown city",
    "country": "People's Republic of China",
    "heightMeters": 374,
    "heightFeet": 1227,
    "sourceUrl": "https://www.wikidata.org/wiki/Q109464453"
  },
  {
    "id": "15-penn-plaza",
    "name": "15 Penn Plaza",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 370.6,
    "heightFeet": 1216,
    "sourceUrl": "https://www.wikidata.org/wiki/Q194347"
  },
  {
    "id": "dalian-international-trade-center",
    "name": "Dalian International Trade Center",
    "city": "Dalian",
    "country": "People's Republic of China",
    "heightMeters": 370.2,
    "heightFeet": 1215,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2673004"
  },
  {
    "id": "shenzhen-galaxy-twin-towers",
    "name": "Shenzhen Galaxy Twin Towers",
    "city": "Shenzhen",
    "country": "People's Republic of China",
    "heightMeters": 369,
    "heightFeet": 1211,
    "sourceUrl": "https://www.wikidata.org/wiki/Q131920063"
  },
  {
    "id": "address-boulevard",
    "name": "Address Boulevard",
    "city": "Downtown Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 368,
    "heightFeet": 1207,
    "sourceUrl": "https://www.wikidata.org/wiki/Q7712376"
  },
  {
    "id": "bank-of-china-tower",
    "name": "Bank of China Tower",
    "city": "Hong Kong",
    "country": "People's Republic of China",
    "heightMeters": 367.4,
    "heightFeet": 1205,
    "sourceUrl": "https://www.wikidata.org/wiki/Q214855"
  },
  {
    "id": "bank-of-america-tower",
    "name": "Bank of America Tower",
    "city": "New York City",
    "country": "United States",
    "heightMeters": 365.8,
    "heightFeet": 1200,
    "sourceUrl": "https://www.wikidata.org/wiki/Q328505"
  },
  {
    "id": "almas-tower",
    "name": "Almas Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 363,
    "heightFeet": 1191,
    "sourceUrl": "https://www.wikidata.org/wiki/Q838780"
  },
  {
    "id": "taipei-twins",
    "name": "Taipei Twins",
    "city": "Taipei",
    "country": "Taiwan",
    "heightMeters": 360,
    "heightFeet": 1181,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1495752"
  },
  {
    "id": "sino-steel-tower",
    "name": "Sino-Steel Tower",
    "city": "Tianjin",
    "country": "People's Republic of China",
    "heightMeters": 358,
    "heightFeet": 1175,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2289545"
  },
  {
    "id": "galaxy-world-tower-1",
    "name": "Galaxy World Tower 1",
    "city": "Shenzhen",
    "country": "People's Republic of China",
    "heightMeters": 356,
    "heightFeet": 1168,
    "sourceUrl": "https://www.wikidata.org/wiki/Q113006408"
  },
  {
    "id": "galaxy-world-tower-2",
    "name": "Galaxy World Tower 2",
    "city": "Shenzhen",
    "country": "People's Republic of China",
    "heightMeters": 356,
    "heightFeet": 1168,
    "sourceUrl": "https://www.wikidata.org/wiki/Q113006416"
  },
  {
    "id": "il-primo-tower",
    "name": "Il Primo Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 356,
    "heightFeet": 1168,
    "sourceUrl": "https://www.wikidata.org/wiki/Q113660049"
  },
  {
    "id": "emirates-office-tower",
    "name": "Emirates Office Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 355,
    "heightFeet": 1165,
    "sourceUrl": "https://www.wikidata.org/wiki/Q845182"
  },
  {
    "id": "jw-marriott-marquis-dubai-tower-1",
    "name": "JW Marriott Marquis Dubai Tower 1",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 355,
    "heightFeet": 1165,
    "sourceUrl": "https://www.wikidata.org/wiki/Q24061819"
  },
  {
    "id": "jw-marriott-marquis-dubai-tower-2",
    "name": "JW Marriott Marquis Dubai Tower 2",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 355,
    "heightFeet": 1165,
    "sourceUrl": "https://www.wikidata.org/wiki/Q24061869"
  },
  {
    "id": "the-marina-torch",
    "name": "The Marina Torch",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 352,
    "heightFeet": 1155,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1808317"
  },
  {
    "id": "grand-international-mansion",
    "name": "Grand International Mansion",
    "city": "Guangzhou",
    "country": "People's Republic of China",
    "heightMeters": 350.3,
    "heightFeet": 1149,
    "sourceUrl": "https://www.wikidata.org/wiki/Q139815"
  },
  {
    "id": "aon-hanoi-landmark-tower",
    "name": "AON Hanoi Landmark Tower",
    "city": "Mễ Trì",
    "country": "Vietnam",
    "heightMeters": 346,
    "heightFeet": 1135,
    "sourceUrl": "https://www.wikidata.org/wiki/Q609140"
  },
  {
    "id": "the-center",
    "name": "The Center",
    "city": "Hong Kong",
    "country": "People's Republic of China",
    "heightMeters": 346,
    "heightFeet": 1135,
    "sourceUrl": "https://www.wikidata.org/wiki/Q130478"
  },
  {
    "id": "neva-towers",
    "name": "Neva Towers",
    "city": "Moscow International Business Center",
    "country": "Russia",
    "heightMeters": 345,
    "heightFeet": 1132,
    "sourceUrl": "https://www.wikidata.org/wiki/Q21026850"
  },
  {
    "id": "875-north-michigan-avenue",
    "name": "875 North Michigan Avenue",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 344,
    "heightFeet": 1129,
    "sourceUrl": "https://www.wikidata.org/wiki/Q217727"
  },
  {
    "id": "burj-2020",
    "name": "Burj 2020",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 340,
    "heightFeet": 1115,
    "sourceUrl": "https://www.wikidata.org/wiki/Q17175396"
  },
  {
    "id": "wuxi-ifs",
    "name": "Wuxi IFS",
    "city": "Wuxi",
    "country": "People's Republic of China",
    "heightMeters": 339,
    "heightFeet": 1112,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1558596"
  },
  {
    "id": "chongqing-world-financial-center",
    "name": "Chongqing World Financial Center",
    "city": "Chongqing",
    "country": "People's Republic of China",
    "heightMeters": 338.9,
    "heightFeet": 1112,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1076144"
  },
  {
    "id": "mercury-city-tower",
    "name": "Mercury City Tower",
    "city": "Moscow",
    "country": "Russia",
    "heightMeters": 338.8,
    "heightFeet": 1112,
    "sourceUrl": "https://www.wikidata.org/wiki/Q59483"
  },
  {
    "id": "tianjin-world-financial-center",
    "name": "Tianjin World Financial Center",
    "city": "Tianjin",
    "country": "People's Republic of China",
    "heightMeters": 337,
    "heightFeet": 1106,
    "sourceUrl": "https://www.wikidata.org/wiki/Q186406"
  },
  {
    "id": "spiral-tower",
    "name": "Spiral Tower",
    "city": "Tel Aviv",
    "country": "Israel",
    "heightMeters": 336,
    "heightFeet": 1102,
    "sourceUrl": "https://www.wikidata.org/wiki/Q131338833"
  },
  {
    "id": "ryugyong-hotel",
    "name": "Ryugyong Hotel",
    "city": "Pyongyang",
    "country": "North Korea",
    "heightMeters": 335,
    "heightFeet": 1099,
    "sourceUrl": "https://www.wikidata.org/wiki/Q29272"
  },
  {
    "id": "damac-heights",
    "name": "DAMAC Heights",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 335,
    "heightFeet": 1099,
    "sourceUrl": "https://www.wikidata.org/wiki/Q134137"
  },
  {
    "id": "huaguoyuan-towers",
    "name": "Huaguoyuan Towers",
    "city": "Guiyang",
    "country": "People's Republic of China",
    "heightMeters": 335,
    "heightFeet": 1099,
    "sourceUrl": "https://www.wikidata.org/wiki/Q124256640"
  },
  {
    "id": "shimao-international-plaza",
    "name": "Shimao International Plaza",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 333.3,
    "heightFeet": 1094,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1161278"
  },
  {
    "id": "rose-tower",
    "name": "Rose Tower",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 333,
    "heightFeet": 1093,
    "sourceUrl": "https://www.wikidata.org/wiki/Q648338"
  },
  {
    "id": "parc1",
    "name": "Parc1",
    "city": "Seoul",
    "country": "South Korea",
    "heightMeters": 333,
    "heightFeet": 1093,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1774820"
  },
  {
    "id": "sky-walk-residence",
    "name": "Sky-walk Residence",
    "city": "unknown city",
    "country": "unknown country",
    "heightMeters": 333,
    "heightFeet": 1093,
    "sourceUrl": "https://www.wikidata.org/wiki/Q125120728"
  },
  {
    "id": "tianjin-kerry-center",
    "name": "Tianjin Kerry Center",
    "city": "Tianjin",
    "country": "People's Republic of China",
    "heightMeters": 332,
    "heightFeet": 1089,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1753759"
  },
  {
    "id": "al-yaqoub-tower",
    "name": "Al Yaqoub Tower",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 330.1,
    "heightFeet": 1083,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1808295"
  },
  {
    "id": "hon-kwok-city-center",
    "name": "Hon Kwok City Center",
    "city": "Shenzhen",
    "country": "People's Republic of China",
    "heightMeters": 329,
    "heightFeet": 1079,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1626452"
  },
  {
    "id": "3-world-trade-center",
    "name": "3 World Trade Center",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 328.9,
    "heightFeet": 1079,
    "sourceUrl": "https://www.wikidata.org/wiki/Q941908"
  },
  {
    "id": "longxi-international-hotel",
    "name": "Longxi International Hotel",
    "city": "Wuxi",
    "country": "People's Republic of China",
    "heightMeters": 328,
    "heightFeet": 1076,
    "sourceUrl": "https://www.wikidata.org/wiki/Q604289"
  },
  {
    "id": "the-index",
    "name": "The Index",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 328,
    "heightFeet": 1076,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1264855"
  },
  {
    "id": "wuxi-suning-plaza-1",
    "name": "Wuxi Suning Plaza 1",
    "city": "Wuxi",
    "country": "People's Republic of China",
    "heightMeters": 328,
    "heightFeet": 1076,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2595525"
  },
  {
    "id": "nanjing-world-trade-center-tower-1",
    "name": "Nanjing World Trade Center Tower 1",
    "city": "Nanjing",
    "country": "People's Republic of China",
    "heightMeters": 326,
    "heightFeet": 1070,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1964601"
  },
  {
    "id": "azabudai-hills-mori-jp-tower",
    "name": "Azabudai Hills Mori JP Tower",
    "city": "Azabudai",
    "country": "Japan",
    "heightMeters": 325.2,
    "heightFeet": 1067,
    "sourceUrl": "https://www.wikidata.org/wiki/Q109703244"
  },
  {
    "id": "brooklyn-tower",
    "name": "Brooklyn Tower",
    "city": "Brooklyn",
    "country": "United States",
    "heightMeters": 325,
    "heightFeet": 1066,
    "sourceUrl": "https://www.wikidata.org/wiki/Q22329554"
  },
  {
    "id": "the-landmark",
    "name": "The Landmark",
    "city": "Abu Dhabi",
    "country": "United Arab Emirates",
    "heightMeters": 324,
    "heightFeet": 1063,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1735111"
  },
  {
    "id": "tuntex-sky-tower",
    "name": "Tuntex Sky Tower",
    "city": "Lingya District",
    "country": "Taiwan",
    "heightMeters": 323,
    "heightFeet": 1060,
    "sourceUrl": "https://www.wikidata.org/wiki/Q337631"
  },
  {
    "id": "q1-tower",
    "name": "Q1 Tower",
    "city": "Queensland",
    "country": "Australia",
    "heightMeters": 322,
    "heightFeet": 1056,
    "sourceUrl": "https://www.wikidata.org/wiki/Q125846"
  },
  {
    "id": "wenzhou-world-trade-center",
    "name": "Wenzhou World Trade Center",
    "city": "Wenzhou",
    "country": "People's Republic of China",
    "heightMeters": 321.9,
    "heightFeet": 1056,
    "sourceUrl": "https://www.wikidata.org/wiki/Q713832"
  },
  {
    "id": "heartland-66-office-tower",
    "name": "Heartland 66 Office Tower",
    "city": "Wuhan",
    "country": "People's Republic of China",
    "heightMeters": 320.9,
    "heightFeet": 1053,
    "sourceUrl": "https://www.wikidata.org/wiki/Q21451544"
  },
  {
    "id": "sinar-mas-center",
    "name": "Sinar Mas Center",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 320,
    "heightFeet": 1050,
    "sourceUrl": "https://www.wikidata.org/wiki/Q598603"
  },
  {
    "id": "palais-royale",
    "name": "Palais Royale",
    "city": "Worli",
    "country": "India",
    "heightMeters": 320,
    "heightFeet": 1050,
    "sourceUrl": "https://www.wikidata.org/wiki/Q620809"
  },
  {
    "id": "one-bayfront-plaza",
    "name": "One Bayfront Plaza",
    "city": "Miami",
    "country": "United States",
    "heightMeters": 320,
    "heightFeet": 1050,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2023952"
  },
  {
    "id": "53w53",
    "name": "53W53",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 320,
    "heightFeet": 1050,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2446907"
  },
  {
    "id": "zhujiang-new-city-tower",
    "name": "Zhujiang New City Tower",
    "city": "Guangzhou",
    "country": "People's Republic of China",
    "heightMeters": 319,
    "heightFeet": 1047,
    "sourceUrl": "https://www.wikidata.org/wiki/Q198226"
  },
  {
    "id": "chrysler-building",
    "name": "Chrysler Building",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 318.9,
    "heightFeet": 1046,
    "sourceUrl": "https://www.wikidata.org/wiki/Q11274"
  },
  {
    "id": "new-york-times-building",
    "name": "New York Times Building",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 318.8,
    "heightFeet": 1046,
    "sourceUrl": "https://www.wikidata.org/wiki/Q192680"
  },
  {
    "id": "hhhr-tower",
    "name": "HHHR Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 317,
    "heightFeet": 1040,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1470076"
  },
  {
    "id": "bank-of-america-plaza",
    "name": "Bank of America Plaza",
    "city": "Atlanta",
    "country": "United States",
    "heightMeters": 311.8,
    "heightFeet": 1023,
    "sourceUrl": "https://www.wikidata.org/wiki/Q499486"
  },
  {
    "id": "diamond-of-istanbul",
    "name": "Diamond of Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "heightMeters": 311,
    "heightFeet": 1020,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1208733"
  },
  {
    "id": "u-s-bank-tower",
    "name": "U.S. Bank Tower",
    "city": "Los Angeles",
    "country": "United States",
    "heightMeters": 310.3,
    "heightFeet": 1018,
    "sourceUrl": "https://www.wikidata.org/wiki/Q57900"
  },
  {
    "id": "telekom-tower",
    "name": "Telekom Tower",
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "heightMeters": 310,
    "heightFeet": 1017,
    "sourceUrl": "https://www.wikidata.org/wiki/Q118214"
  },
  {
    "id": "ocean-heights",
    "name": "Ocean Heights",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 310,
    "heightFeet": 1017,
    "sourceUrl": "https://www.wikidata.org/wiki/Q134124"
  },
  {
    "id": "varso-tower",
    "name": "Varso Tower",
    "city": "Wola",
    "country": "Poland",
    "heightMeters": 310,
    "heightFeet": 1017,
    "sourceUrl": "https://www.wikidata.org/wiki/Q116847270"
  },
  {
    "id": "fortune-center",
    "name": "Fortune Center",
    "city": "Guangzhou",
    "country": "People's Republic of China",
    "heightMeters": 309,
    "heightFeet": 1014,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1552767"
  },
  {
    "id": "eurasia",
    "name": "Eurasia",
    "city": "Moscow",
    "country": "Russia",
    "heightMeters": 308.9,
    "heightFeet": 1013,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1374287"
  },
  {
    "id": "cayan-tower",
    "name": "Cayan Tower",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 306.4,
    "heightFeet": 1005,
    "sourceUrl": "https://www.wikidata.org/wiki/Q391648"
  },
  {
    "id": "one57",
    "name": "One57",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 306.3,
    "heightFeet": 1005,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2023928"
  },
  {
    "id": "one-bloor-west",
    "name": "One Bloor West",
    "city": "Toronto",
    "country": "Canada",
    "heightMeters": 306.3,
    "heightFeet": 1005,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28163699"
  },
  {
    "id": "the-shard",
    "name": "The Shard",
    "city": "London",
    "country": "United Kingdom",
    "heightMeters": 306,
    "heightFeet": 1004,
    "sourceUrl": "https://www.wikidata.org/wiki/Q18536"
  },
  {
    "id": "jpmorgan-chase-tower",
    "name": "JPMorgan Chase Tower",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 305.4,
    "heightFeet": 1002,
    "sourceUrl": "https://www.wikidata.org/wiki/Q935919"
  },
  {
    "id": "wuxi-maoye-city-marriott-hotel",
    "name": "Wuxi Maoye City - Marriott Hotel",
    "city": "Wuxi",
    "country": "People's Republic of China",
    "heightMeters": 304,
    "heightFeet": 997,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2595527"
  },
  {
    "id": "two-prudential-plaza",
    "name": "Two Prudential Plaza",
    "city": "Illinois",
    "country": "United States",
    "heightMeters": 303.3,
    "heightFeet": 995,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1121971"
  },
  {
    "id": "chang-fu-jin-mao-tower",
    "name": "Chang Fu Jin Mao Tower",
    "city": "Shenzhen",
    "country": "People's Republic of China",
    "heightMeters": 303,
    "heightFeet": 994,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2278111"
  },
  {
    "id": "diwang-international-fortune-center",
    "name": "Diwang International Fortune Center",
    "city": "Liubei District",
    "country": "People's Republic of China",
    "heightMeters": 303,
    "heightFeet": 994,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2676828"
  },
  {
    "id": "zhongzhou-holdings-financial-center",
    "name": "Zhongzhou Holdings Financial Center",
    "city": "Nanshan District",
    "country": "People's Republic of China",
    "heightMeters": 303,
    "heightFeet": 994,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2717933"
  },
  {
    "id": "wells-fargo-plaza",
    "name": "Wells Fargo Plaza",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 302.4,
    "heightFeet": 992,
    "sourceUrl": "https://www.wikidata.org/wiki/Q57767"
  },
  {
    "id": "kingdom-centre",
    "name": "Kingdom Centre",
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "heightMeters": 302,
    "heightFeet": 991,
    "sourceUrl": "https://www.wikidata.org/wiki/Q656743"
  },
  {
    "id": "gate-to-the-east",
    "name": "Gate to the East",
    "city": "Suzhou",
    "country": "People's Republic of China",
    "heightMeters": 302,
    "heightFeet": 991,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1495771"
  },
  {
    "id": "3-hudson-boulevard",
    "name": "3 Hudson Boulevard",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 301,
    "heightFeet": 988,
    "sourceUrl": "https://www.wikidata.org/wiki/Q229605"
  },
  {
    "id": "commerzbank-tower",
    "name": "Commerzbank Tower",
    "city": "Frankfurt-Innenstadt I",
    "country": "Germany",
    "heightMeters": 300.1,
    "heightFeet": 985,
    "sourceUrl": "https://www.wikidata.org/wiki/Q151765"
  },
  {
    "id": "arraya-tower",
    "name": "Arraya Tower",
    "city": "Kuwait City",
    "country": "Kuwait",
    "heightMeters": 300,
    "heightFeet": 984,
    "sourceUrl": "https://www.wikidata.org/wiki/Q699317"
  },
  {
    "id": "aspire-tower",
    "name": "Aspire Tower",
    "city": "Doha",
    "country": "Qatar",
    "heightMeters": 300,
    "heightFeet": 984,
    "sourceUrl": "https://www.wikidata.org/wiki/Q737602"
  },
  {
    "id": "8-spruce-street",
    "name": "8 Spruce Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 300,
    "heightFeet": 984,
    "sourceUrl": "https://www.wikidata.org/wiki/Q274916"
  },
  {
    "id": "gran-torre-costanera",
    "name": "Gran Torre Costanera",
    "city": "Santiago",
    "country": "Chile",
    "heightMeters": 300,
    "heightFeet": 984,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1542408"
  },
  {
    "id": "we-ve-the-zenith-tower-a",
    "name": "We've the Zenith Tower A",
    "city": "Busan",
    "country": "South Korea",
    "heightMeters": 300,
    "heightFeet": 984,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1242598"
  },
  {
    "id": "dubai-pearl",
    "name": "Dubai Pearl",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 300,
    "heightFeet": 984,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1262915"
  },
  {
    "id": "tameer-commercial-tower",
    "name": "Tameer Commercial Tower",
    "city": "Abu Dhabi",
    "country": "United Arab Emirates",
    "heightMeters": 300,
    "heightFeet": 984,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2391485"
  },
  {
    "id": "one-island-east",
    "name": "One Island East",
    "city": "Eastern District",
    "country": "People's Republic of China",
    "heightMeters": 298.4,
    "heightFeet": 979,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1417597"
  },
  {
    "id": "first-canadian-place",
    "name": "First Canadian Place",
    "city": "Toronto",
    "country": "Canada",
    "heightMeters": 298,
    "heightFeet": 978,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1052475"
  },
  {
    "id": "shanghai-wheelock-square",
    "name": "Shanghai Wheelock Square",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 298,
    "heightFeet": 978,
    "sourceUrl": "https://www.wikidata.org/wiki/Q430218"
  },
  {
    "id": "4-world-trade-center",
    "name": "4 World Trade Center",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 297.7,
    "heightFeet": 977,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1351208"
  },
  {
    "id": "comcast-center",
    "name": "Comcast Center",
    "city": "Philadelphia",
    "country": "United States",
    "heightMeters": 297,
    "heightFeet": 974,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1113808"
  },
  {
    "id": "emirates-crown",
    "name": "Emirates Crown",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 296,
    "heightFeet": 971,
    "sourceUrl": "https://www.wikidata.org/wiki/Q575128"
  },
  {
    "id": "yokohama-landmark-tower",
    "name": "Yokohama Landmark Tower",
    "city": "Minatomirai",
    "country": "Japan",
    "heightMeters": 295.8,
    "heightFeet": 970,
    "sourceUrl": "https://www.wikidata.org/wiki/Q587108"
  },
  {
    "id": "capital-towers",
    "name": "Capital Towers",
    "city": "Moscow",
    "country": "Russia",
    "heightMeters": 295,
    "heightFeet": 968,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28053434"
  },
  {
    "id": "columbia-center",
    "name": "Columbia Center",
    "city": "Seattle",
    "country": "United States",
    "heightMeters": 294.8,
    "heightFeet": 967,
    "sourceUrl": "https://www.wikidata.org/wiki/Q908703"
  },
  {
    "id": "khalid-al-attar-tower-2",
    "name": "Khalid Al Attar Tower 2",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 294,
    "heightFeet": 965,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1436004"
  },
  {
    "id": "311-south-wacker-drive",
    "name": "311 South Wacker Drive",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 292.9,
    "heightFeet": 961,
    "sourceUrl": "https://www.wikidata.org/wiki/Q224563"
  },
  {
    "id": "sky-tower",
    "name": "Sky Tower",
    "city": "Abu Dhabi",
    "country": "United Arab Emirates",
    "heightMeters": 292,
    "heightFeet": 958,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1435741"
  },
  {
    "id": "haeundae-i-park",
    "name": "Haeundae I Park",
    "city": "Busan",
    "country": "South Korea",
    "heightMeters": 292,
    "heightFeet": 958,
    "sourceUrl": "https://www.wikidata.org/wiki/Q5638300"
  },
  {
    "id": "seg-plaza",
    "name": "SEG Plaza",
    "city": "Huaqiangbei Subdistrict",
    "country": "People's Republic of China",
    "heightMeters": 291.6,
    "heightFeet": 957,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1368798"
  },
  {
    "id": "70-pine-street",
    "name": "70 Pine Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 290.2,
    "heightFeet": 952,
    "sourceUrl": "https://www.wikidata.org/wiki/Q262041"
  },
  {
    "id": "guoco-tower",
    "name": "Guoco Tower",
    "city": "Tanjong Pagar",
    "country": "Singapore",
    "heightMeters": 290,
    "heightFeet": 951,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28873239"
  },
  {
    "id": "key-tower",
    "name": "Key Tower",
    "city": "Ohio",
    "country": "United States",
    "heightMeters": 288,
    "heightFeet": 945,
    "sourceUrl": "https://www.wikidata.org/wiki/Q684027"
  },
  {
    "id": "chongqing-poly-tower",
    "name": "Chongqing Poly Tower",
    "city": "Chongqing",
    "country": "People's Republic of China",
    "heightMeters": 287,
    "heightFeet": 942,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1076137"
  },
  {
    "id": "commerce-court-west",
    "name": "Commerce Court West",
    "city": "Toronto",
    "country": "Canada",
    "heightMeters": 287,
    "heightFeet": 942,
    "sourceUrl": "https://www.wikidata.org/wiki/Q23527286"
  },
  {
    "id": "30-park-place",
    "name": "30 Park Place",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 286,
    "heightFeet": 938,
    "sourceUrl": "https://www.wikidata.org/wiki/Q224126"
  },
  {
    "id": "yingli-tower",
    "name": "Yingli Tower",
    "city": "Chongqing",
    "country": "People's Republic of China",
    "heightMeters": 285,
    "heightFeet": 935,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1092242"
  },
  {
    "id": "millennium-tower",
    "name": "Millennium Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 285,
    "heightFeet": 935,
    "sourceUrl": "https://www.wikidata.org/wiki/Q623517"
  },
  {
    "id": "sulafa-tower",
    "name": "Sulafa Tower",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 285,
    "heightFeet": 935,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1641386"
  },
  {
    "id": "40-wall-street",
    "name": "40 Wall Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 284,
    "heightFeet": 932,
    "sourceUrl": "https://www.wikidata.org/wiki/Q218305"
  },
  {
    "id": "chongqing-world-trade-center",
    "name": "Chongqing World Trade Center",
    "city": "Chongqing",
    "country": "People's Republic of China",
    "heightMeters": 283,
    "heightFeet": 928,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1076164"
  },
  {
    "id": "cheung-kong-center",
    "name": "Cheung Kong Center",
    "city": "Central and Western District",
    "country": "People's Republic of China",
    "heightMeters": 283,
    "heightFeet": 928,
    "sourceUrl": "https://www.wikidata.org/wiki/Q700058"
  },
  {
    "id": "al-hekma-tower",
    "name": "Al Hekma Tower",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 282,
    "heightFeet": 925,
    "sourceUrl": "https://www.wikidata.org/wiki/Q4704024"
  },
  {
    "id": "lodha-world-one",
    "name": "Lodha World One",
    "city": "Mumbai",
    "country": "India",
    "heightMeters": 280.2,
    "heightFeet": 919,
    "sourceUrl": "https://www.wikidata.org/wiki/Q507939"
  },
  {
    "id": "one-raffles-place",
    "name": "One Raffles Place",
    "city": "Raffles Place",
    "country": "Singapore",
    "heightMeters": 280,
    "heightFeet": 919,
    "sourceUrl": "https://www.wikidata.org/wiki/Q333305"
  },
  {
    "id": "citigroup-center",
    "name": "Citigroup Center",
    "city": "New York City",
    "country": "United States",
    "heightMeters": 279,
    "heightFeet": 915,
    "sourceUrl": "https://www.wikidata.org/wiki/Q391243"
  },
  {
    "id": "22-bishopsgate",
    "name": "22 Bishopsgate",
    "city": "City of London",
    "country": "United Kingdom",
    "heightMeters": 278.2,
    "heightFeet": 913,
    "sourceUrl": "https://www.wikidata.org/wiki/Q18602"
  },
  {
    "id": "diwang-international-commerce-center",
    "name": "Diwang International Commerce Center",
    "city": "Nanning",
    "country": "People's Republic of China",
    "heightMeters": 276,
    "heightFeet": 906,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1231655"
  },
  {
    "id": "scotia-plaza",
    "name": "Scotia Plaza",
    "city": "Toronto",
    "country": "Canada",
    "heightMeters": 275,
    "heightFeet": 902,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1327514"
  },
  {
    "id": "williams-tower",
    "name": "Williams Tower",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 274.6,
    "heightFeet": 901,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1357650"
  },
  {
    "id": "five-towers",
    "name": "Five Towers",
    "city": "Donskoy District",
    "country": "Russia",
    "heightMeters": 274,
    "heightFeet": 899,
    "sourceUrl": "https://www.wikidata.org/wiki/Q134672288"
  },
  {
    "id": "neo-tower",
    "name": "NEO Tower",
    "city": "Guangdong",
    "country": "People's Republic of China",
    "heightMeters": 273,
    "heightFeet": 896,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1664761"
  },
  {
    "id": "nantong-zhongnan-international-plaza",
    "name": "Nantong Zhongnan International Plaza",
    "city": "Nantong",
    "country": "People's Republic of China",
    "heightMeters": 273,
    "heightFeet": 896,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1964773"
  },
  {
    "id": "songhwa-street-main-tower",
    "name": "Songhwa Street Main Tower",
    "city": "Pyongyang",
    "country": "North Korea",
    "heightMeters": 273,
    "heightFeet": 896,
    "sourceUrl": "https://www.wikidata.org/wiki/Q118849690"
  },
  {
    "id": "aura",
    "name": "Aura",
    "city": "Toronto",
    "country": "Canada",
    "heightMeters": 272,
    "heightFeet": 892,
    "sourceUrl": "https://www.wikidata.org/wiki/Q774178"
  },
  {
    "id": "taipei-nan-shan-plaza",
    "name": "Taipei Nan Shan Plaza",
    "city": "Xinyi District",
    "country": "Taiwan",
    "heightMeters": 272,
    "heightFeet": 892,
    "sourceUrl": "https://www.wikidata.org/wiki/Q24840610"
  },
  {
    "id": "renaissance-tower",
    "name": "Renaissance Tower",
    "city": "Texas",
    "country": "United States",
    "heightMeters": 270,
    "heightFeet": 886,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1515605"
  },
  {
    "id": "bohai-bank-tower",
    "name": "Bohai Bank Tower",
    "city": "Tianjin",
    "country": "People's Republic of China",
    "heightMeters": 270,
    "heightFeet": 886,
    "sourceUrl": "https://www.wikidata.org/wiki/Q21619033"
  },
  {
    "id": "one-lujiazui",
    "name": "One Lujiazui",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 269,
    "heightFeet": 883,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2024017"
  },
  {
    "id": "south-asian-gate",
    "name": "South Asian Gate",
    "city": "Kunming",
    "country": "People's Republic of China",
    "heightMeters": 268,
    "heightFeet": 879,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1586256"
  },
  {
    "id": "al-faisaliah-centre",
    "name": "Al Faisaliah Centre",
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "heightMeters": 267,
    "heightFeet": 876,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2303314"
  },
  {
    "id": "toranomon-hills-station-tower",
    "name": "Toranomon Hills Station Tower",
    "city": "Minato",
    "country": "Japan",
    "heightMeters": 265.8,
    "heightFeet": 872,
    "sourceUrl": "https://www.wikidata.org/wiki/Q130621500"
  },
  {
    "id": "bitexco-financial-tower",
    "name": "Bitexco Financial Tower",
    "city": "Ho Chi Minh City",
    "country": "Vietnam",
    "heightMeters": 265.5,
    "heightFeet": 871,
    "sourceUrl": "https://www.wikidata.org/wiki/Q638512"
  },
  {
    "id": "bocom-financial-towers",
    "name": "Bocom Financial Towers",
    "city": "Shanghai",
    "country": "People's Republic of China",
    "heightMeters": 265,
    "heightFeet": 869,
    "sourceUrl": "https://www.wikidata.org/wiki/Q368017"
  },
  {
    "id": "120-collins-street",
    "name": "120 Collins Street",
    "city": "Melbourne",
    "country": "Australia",
    "heightMeters": 265,
    "heightFeet": 869,
    "sourceUrl": "https://www.wikidata.org/wiki/Q172402"
  },
  {
    "id": "suntrust-plaza",
    "name": "SunTrust Plaza",
    "city": "Georgia",
    "country": "United States",
    "heightMeters": 265,
    "heightFeet": 869,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1706824"
  },
  {
    "id": "inxignia-tower",
    "name": "Inxignia tower",
    "city": "Heroica Puebla de Zaragoza",
    "country": "Mexico",
    "heightMeters": 265,
    "heightFeet": 869,
    "sourceUrl": "https://www.wikidata.org/wiki/Q119853699"
  },
  {
    "id": "triumph-palace",
    "name": "Triumph Palace",
    "city": "Moscow",
    "country": "Russia",
    "heightMeters": 264,
    "heightFeet": 866,
    "sourceUrl": "https://www.wikidata.org/wiki/Q80367"
  },
  {
    "id": "samsung-tower-palace-3-tower-g",
    "name": "Samsung Tower Palace 3 – Tower G",
    "city": "Gangnam District",
    "country": "South Korea",
    "heightMeters": 263.7,
    "heightFeet": 865,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1320312"
  },
  {
    "id": "trump-world-tower",
    "name": "Trump World Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 262,
    "heightFeet": 860,
    "sourceUrl": "https://www.wikidata.org/wiki/Q844324"
  },
  {
    "id": "shenzhen-special-zone-press-tower",
    "name": "Shenzhen Special Zone Press Tower",
    "city": "Lianhua Subdistrict",
    "country": "People's Republic of China",
    "heightMeters": 262,
    "heightFeet": 860,
    "sourceUrl": "https://www.wikidata.org/wiki/Q572970"
  },
  {
    "id": "aon-center",
    "name": "Aon Center",
    "city": "California",
    "country": "United States",
    "heightMeters": 262,
    "heightFeet": 860,
    "sourceUrl": "https://www.wikidata.org/wiki/Q607743"
  },
  {
    "id": "aqua",
    "name": "Aqua",
    "city": "Illinois",
    "country": "United States",
    "heightMeters": 262,
    "heightFeet": 860,
    "sourceUrl": "https://www.wikidata.org/wiki/Q622895"
  },
  {
    "id": "water-tower-place",
    "name": "Water Tower Place",
    "city": "Illinois",
    "country": "United States",
    "heightMeters": 262,
    "heightFeet": 860,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1582716"
  },
  {
    "id": "grand-lisboa",
    "name": "Grand Lisboa",
    "city": "Macau",
    "country": "People's Republic of China",
    "heightMeters": 261,
    "heightFeet": 856,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1033099"
  },
  {
    "id": "istanbul-sapphire",
    "name": "Istanbul Sapphire",
    "city": "Istanbul",
    "country": "Turkey",
    "heightMeters": 261,
    "heightFeet": 856,
    "sourceUrl": "https://www.wikidata.org/wiki/Q166882"
  },
  {
    "id": "transamerica-pyramid",
    "name": "Transamerica Pyramid",
    "city": "San Francisco",
    "country": "United States",
    "heightMeters": 260,
    "heightFeet": 853,
    "sourceUrl": "https://www.wikidata.org/wiki/Q216865"
  },
  {
    "id": "101-collins-street",
    "name": "101 Collins Street",
    "city": "Melbourne",
    "country": "Australia",
    "heightMeters": 260,
    "heightFeet": 853,
    "sourceUrl": "https://www.wikidata.org/wiki/Q165506"
  },
  {
    "id": "the-42",
    "name": "The 42",
    "city": "Ward No. 63, Kolkata Municipal Corporation",
    "country": "India",
    "heightMeters": 260,
    "heightFeet": 853,
    "sourceUrl": "https://www.wikidata.org/wiki/Q7711913"
  },
  {
    "id": "vision-tower",
    "name": "Vision Tower",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 260,
    "heightFeet": 853,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1614219"
  },
  {
    "id": "kingbridge-tower",
    "name": "KingBridge Tower",
    "city": "Bangkok",
    "country": "Thailand",
    "heightMeters": 260,
    "heightFeet": 853,
    "sourceUrl": "https://www.wikidata.org/wiki/Q134885353"
  },
  {
    "id": "revenue-tower-jakarta",
    "name": "Revenue Tower Jakarta",
    "city": "Jakarta",
    "country": "Indonesia",
    "heightMeters": 260,
    "heightFeet": 853,
    "sourceUrl": "https://www.wikidata.org/wiki/Q127043383"
  },
  {
    "id": "30-rockefeller-plaza",
    "name": "30 Rockefeller Plaza",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 259,
    "heightFeet": 850,
    "sourceUrl": "https://www.wikidata.org/wiki/Q680614"
  },
  {
    "id": "the-river-south-tower",
    "name": "The River South Tower",
    "city": "Bangkok",
    "country": "Thailand",
    "heightMeters": 258,
    "heightFeet": 846,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2376507"
  },
  {
    "id": "park-tower",
    "name": "Park Tower",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 257,
    "heightFeet": 843,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1810424"
  },
  {
    "id": "the-masterpiece",
    "name": "The Masterpiece",
    "city": "Hong Kong",
    "country": "People's Republic of China",
    "heightMeters": 257,
    "heightFeet": 843,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1983016"
  },
  {
    "id": "number-one-bloor",
    "name": "Number One Bloor",
    "city": "Toronto",
    "country": "Canada",
    "heightMeters": 257,
    "heightFeet": 843,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1338561"
  },
  {
    "id": "messeturm",
    "name": "Messeturm",
    "city": "Frankfurt-Innenstadt II",
    "country": "Germany",
    "heightMeters": 256.5,
    "heightFeet": 842,
    "sourceUrl": "https://www.wikidata.org/wiki/Q156198"
  },
  {
    "id": "osaka-prefectural-government-sakishima-building",
    "name": "Osaka Prefectural Government Sakishima Building",
    "city": "Nankō-kita",
    "country": "Japan",
    "heightMeters": 256,
    "heightFeet": 840,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1201344"
  },
  {
    "id": "sis-rinku-tower",
    "name": "SiS Rinku Tower",
    "city": "Izumisano",
    "country": "Japan",
    "heightMeters": 256,
    "heightFeet": 840,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2673535"
  },
  {
    "id": "evolution-tower",
    "name": "Evolution Tower",
    "city": "Moscow",
    "country": "Russia",
    "heightMeters": 255,
    "heightFeet": 837,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1985903"
  },
  {
    "id": "capital-tower",
    "name": "Capital Tower",
    "city": "Downtown Core",
    "country": "Singapore",
    "heightMeters": 255,
    "heightFeet": 837,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2614510"
  },
  {
    "id": "spx-tower",
    "name": "SPX Tower",
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "heightMeters": 255,
    "heightFeet": 837,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28791021"
  },
  {
    "id": "al-fardan-residences",
    "name": "Al Fardan Residences",
    "city": "Doha",
    "country": "Qatar",
    "heightMeters": 253.3,
    "heightFeet": 831,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2884587"
  },
  {
    "id": "highcliff",
    "name": "Highcliff",
    "city": "Wan Chai District",
    "country": "People's Republic of China",
    "heightMeters": 252.4,
    "heightFeet": 828,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2669877"
  },
  {
    "id": "rialto-towers",
    "name": "Rialto Towers",
    "city": "Victoria",
    "country": "Australia",
    "heightMeters": 251,
    "heightFeet": 823,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1138772"
  },
  {
    "id": "stantec-tower",
    "name": "Stantec Tower",
    "city": "Alberta",
    "country": "Canada",
    "heightMeters": 250.8,
    "heightFeet": 823,
    "sourceUrl": "https://www.wikidata.org/wiki/Q21092654"
  },
  {
    "id": "5-taian-dao",
    "name": "5 Taian Dao",
    "city": "Tianjin",
    "country": "People's Republic of China",
    "heightMeters": 250.8,
    "heightFeet": 823,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28057934"
  },
  {
    "id": "56-leonard-street",
    "name": "56 Leonard Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 250.2,
    "heightFeet": 821,
    "sourceUrl": "https://www.wikidata.org/wiki/Q244358"
  },
  {
    "id": "chelsea-tower",
    "name": "Chelsea Tower",
    "city": "Emirate of Dubai",
    "country": "United Arab Emirates",
    "heightMeters": 250,
    "heightFeet": 820,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1069161"
  },
  {
    "id": "30-st-mary-axe",
    "name": "30 St Mary Axe",
    "city": "City of London",
    "country": "United Kingdom",
    "heightMeters": 250,
    "heightFeet": 820,
    "sourceUrl": "https://www.wikidata.org/wiki/Q191161"
  },
  {
    "id": "legacy-at-millennium-park",
    "name": "Legacy at Millennium Park",
    "city": "Illinois",
    "country": "United States",
    "heightMeters": 250,
    "heightFeet": 820,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1812350"
  },
  {
    "id": "mohammed-vi-tower",
    "name": "Mohammed VI Tower",
    "city": "Salé",
    "country": "Morocco",
    "heightMeters": 250,
    "heightFeet": 820,
    "sourceUrl": "https://www.wikidata.org/wiki/Q25452628"
  },
  {
    "id": "torre-de-cristal",
    "name": "Torre de Cristal",
    "city": "Madrid",
    "country": "Spain",
    "heightMeters": 249,
    "heightFeet": 817,
    "sourceUrl": "https://www.wikidata.org/wiki/Q953610"
  },
  {
    "id": "63-building",
    "name": "63 Building",
    "city": "Yeoui-dong",
    "country": "South Korea",
    "heightMeters": 249,
    "heightFeet": 817,
    "sourceUrl": "https://www.wikidata.org/wiki/Q22968"
  },
  {
    "id": "torre-moeve",
    "name": "Torre Moeve",
    "city": "Madrid",
    "country": "Spain",
    "heightMeters": 248.3,
    "heightFeet": 815,
    "sourceUrl": "https://www.wikidata.org/wiki/Q519568"
  },
  {
    "id": "cityspire",
    "name": "CitySpire",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 248.1,
    "heightFeet": 814,
    "sourceUrl": "https://www.wikidata.org/wiki/Q910101"
  },
  {
    "id": "midtown-tower",
    "name": "Midtown Tower",
    "city": "Akasaka",
    "country": "Japan",
    "heightMeters": 248.1,
    "heightFeet": 814,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1150357"
  },
  {
    "id": "28-liberty-street",
    "name": "28 Liberty Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 247.8,
    "heightFeet": 813,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1050074"
  },
  {
    "id": "midland-square",
    "name": "Midland Square",
    "city": "Meieki 4-chōme",
    "country": "Japan",
    "heightMeters": 247,
    "heightFeet": 810,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1155401"
  },
  {
    "id": "4-times-square",
    "name": "4 Times Square",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 246.5,
    "heightFeet": 809,
    "sourceUrl": "https://www.wikidata.org/wiki/Q687413"
  },
  {
    "id": "metlife-building",
    "name": "MetLife Building",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 246,
    "heightFeet": 807,
    "sourceUrl": "https://www.wikidata.org/wiki/Q464482"
  },
  {
    "id": "bank-of-china-tower-ningbo",
    "name": "Bank of China Tower, Ningbo",
    "city": "Ningbo",
    "country": "People's Republic of China",
    "heightMeters": 246,
    "heightFeet": 807,
    "sourceUrl": "https://www.wikidata.org/wiki/Q118639158"
  },
  {
    "id": "shangbang-leasing-tower",
    "name": "Shangbang Leasing Tower",
    "city": "Tianjin",
    "country": "People's Republic of China",
    "heightMeters": 246,
    "heightFeet": 807,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28057941"
  },
  {
    "id": "731-lexington-avenue",
    "name": "731 Lexington Avenue",
    "city": "Midtown Manhattan",
    "country": "United States",
    "heightMeters": 245.7,
    "heightFeet": 806,
    "sourceUrl": "https://www.wikidata.org/wiki/Q875078"
  },
  {
    "id": "jr-central-towers",
    "name": "JR Central Towers",
    "city": "Nakamura-ku",
    "country": "Japan",
    "heightMeters": 245.1,
    "heightFeet": 804,
    "sourceUrl": "https://www.wikidata.org/wiki/Q6108856"
  },
  {
    "id": "138-east-50th-street",
    "name": "138 East 50th Street",
    "city": "Turtle Bay",
    "country": "United States",
    "heightMeters": 245,
    "heightFeet": 804,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28003830"
  },
  {
    "id": "shin-kong-life-tower",
    "name": "Shin Kong Life Tower",
    "city": "Taipei",
    "country": "Taiwan",
    "heightMeters": 244.8,
    "heightFeet": 803,
    "sourceUrl": "https://www.wikidata.org/wiki/Q704778"
  },
  {
    "id": "moshe-aviv-tower",
    "name": "Moshe Aviv Tower",
    "city": "Ramat Gan",
    "country": "Israel",
    "heightMeters": 244.1,
    "heightFeet": 801,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1093913"
  },
  {
    "id": "tokyo-metropolitan-government-building-i",
    "name": "Tokyo Metropolitan Government Building I",
    "city": "Nishi-Shinjuku",
    "country": "Japan",
    "heightMeters": 243.4,
    "heightFeet": 799,
    "sourceUrl": "https://www.wikidata.org/wiki/Q24191410"
  },
  {
    "id": "r-f-centre",
    "name": "R&F Centre",
    "city": "Tianhe District",
    "country": "People's Republic of China",
    "heightMeters": 243,
    "heightFeet": 797,
    "sourceUrl": "https://www.wikidata.org/wiki/Q7273221"
  },
  {
    "id": "john-hancock-tower",
    "name": "John Hancock Tower",
    "city": "Boston",
    "country": "United States",
    "heightMeters": 241,
    "heightFeet": 791,
    "sourceUrl": "https://www.wikidata.org/wiki/Q798416"
  },
  {
    "id": "woolworth-building",
    "name": "Woolworth Building",
    "city": "Tribeca",
    "country": "United States",
    "heightMeters": 241,
    "heightFeet": 791,
    "sourceUrl": "https://www.wikidata.org/wiki/Q217652"
  },
  {
    "id": "one-canada-square",
    "name": "One Canada Square",
    "city": "Isle of Dogs",
    "country": "United Kingdom",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q503477"
  },
  {
    "id": "bahrain-world-trade-center",
    "name": "Bahrain World Trade Center",
    "city": "Manama",
    "country": "Bahrain",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q511612"
  },
  {
    "id": "seven-sisters",
    "name": "Seven Sisters",
    "city": "Moscow",
    "country": "Russia",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q521935"
  },
  {
    "id": "main-tower",
    "name": "Main Tower",
    "city": "Frankfurt-Innenstadt I",
    "country": "Germany",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q321291"
  },
  {
    "id": "deutsche-bank-place",
    "name": "Deutsche Bank Place",
    "city": "New South Wales",
    "country": "Australia",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q54492"
  },
  {
    "id": "four-seasons-hotel-miami",
    "name": "Four Seasons Hotel Miami",
    "city": "Miami",
    "country": "United States",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1440000"
  },
  {
    "id": "ryomyong-tower-70-floors-240-m-790-ft",
    "name": "Ryomyong Tower 70 floors 240 m (790 ft)",
    "city": "Pyongyang",
    "country": "North Korea",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q118583861"
  },
  {
    "id": "banyan-tree-signatures",
    "name": "Banyan Tree Signatures",
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "heightMeters": 240,
    "heightFeet": 787,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28873268"
  },
  {
    "id": "sunshine-60",
    "name": "Sunshine 60",
    "city": "Higashi-Ikebukuro",
    "country": "Japan",
    "heightMeters": 239.7,
    "heightFeet": 786,
    "sourceUrl": "https://www.wikidata.org/wiki/Q602942"
  },
  {
    "id": "300-north-lasalle",
    "name": "300 North LaSalle",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 239,
    "heightFeet": 784,
    "sourceUrl": "https://www.wikidata.org/wiki/Q223788"
  },
  {
    "id": "50-west-street",
    "name": "50 West Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 239,
    "heightFeet": 784,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1710345"
  },
  {
    "id": "imperia-tower",
    "name": "Imperia Tower",
    "city": "Moscow",
    "country": "Russia",
    "heightMeters": 239,
    "heightFeet": 784,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2493262"
  },
  {
    "id": "azrieli-sarona-tower",
    "name": "Azrieli Sarona Tower",
    "city": "Tel Aviv",
    "country": "Israel",
    "heightMeters": 238.5,
    "heightFeet": 782,
    "sourceUrl": "https://www.wikidata.org/wiki/Q24885196"
  },
  {
    "id": "qingdao-agora",
    "name": "Qingdao Agora",
    "city": "Qingdao",
    "country": "People's Republic of China",
    "heightMeters": 238.3,
    "heightFeet": 782,
    "sourceUrl": "https://www.wikidata.org/wiki/Q22978400"
  },
  {
    "id": "tc-energy-center",
    "name": "TC Energy Center",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 238,
    "heightFeet": 781,
    "sourceUrl": "https://www.wikidata.org/wiki/Q806669"
  },
  {
    "id": "roppongi-hills-mori-tower",
    "name": "Roppongi Hills Mori Tower",
    "city": "Roppongi",
    "country": "Japan",
    "heightMeters": 238,
    "heightFeet": 781,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1771772"
  },
  {
    "id": "30-hudson-street",
    "name": "30 Hudson Street",
    "city": "Jersey City",
    "country": "United States",
    "heightMeters": 238,
    "heightFeet": 781,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2275601"
  },
  {
    "id": "55-hudson-yards",
    "name": "55 Hudson Yards",
    "city": "New York City",
    "country": "United States",
    "heightMeters": 238,
    "heightFeet": 781,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2593778"
  },
  {
    "id": "the-bow",
    "name": "The Bow",
    "city": "Alberta",
    "country": "Canada",
    "heightMeters": 237.5,
    "heightFeet": 779,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1229086"
  },
  {
    "id": "one-worldwide-plaza",
    "name": "One Worldwide Plaza",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 237.1,
    "heightFeet": 778,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1342690"
  },
  {
    "id": "torre-pwc",
    "name": "Torre PwC",
    "city": "Madrid",
    "country": "Spain",
    "heightMeters": 236,
    "heightFeet": 774,
    "sourceUrl": "https://www.wikidata.org/wiki/Q651643"
  },
  {
    "id": "1201-third-avenue",
    "name": "1201 Third Avenue",
    "city": "Washington",
    "country": "United States",
    "heightMeters": 235.3,
    "heightFeet": 772,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2301069"
  },
  {
    "id": "tokyo-opera-city-tower",
    "name": "Tokyo Opera City Tower",
    "city": "Nishi-Shinjuku",
    "country": "Japan",
    "heightMeters": 234.4,
    "heightFeet": 769,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1201889"
  },
  {
    "id": "china-media-group-guanghua-road-office-area",
    "name": "China Media Group Guanghua Road Office Area",
    "city": "Hujialou Subdistrict",
    "country": "People's Republic of China",
    "heightMeters": 234,
    "heightFeet": 768,
    "sourceUrl": "https://www.wikidata.org/wiki/Q754321"
  },
  {
    "id": "ice-condominiums-at-york-centre",
    "name": "ÏCE Condominiums at York Centre",
    "city": "Toronto",
    "country": "Canada",
    "heightMeters": 234,
    "heightFeet": 768,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1656109"
  },
  {
    "id": "three-first-national-plaza",
    "name": "Three First National Plaza",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 234,
    "heightFeet": 768,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1787391"
  },
  {
    "id": "southeast-financial-center",
    "name": "Southeast Financial Center",
    "city": "Miami",
    "country": "United States",
    "heightMeters": 233,
    "heightFeet": 764,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1749785"
  },
  {
    "id": "heritage-plaza",
    "name": "Heritage Plaza",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 232,
    "heightFeet": 761,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1510199"
  },
  {
    "id": "carnegie-hall-tower",
    "name": "Carnegie Hall Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 231,
    "heightFeet": 758,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1043966"
  },
  {
    "id": "tour-first",
    "name": "Tour First",
    "city": "Courbevoie",
    "country": "France",
    "heightMeters": 231,
    "heightFeet": 758,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1509747"
  },
  {
    "id": "torre-mayor",
    "name": "Torre Mayor",
    "city": "Mexico City",
    "country": "Mexico",
    "heightMeters": 230.4,
    "heightFeet": 756,
    "sourceUrl": "https://www.wikidata.org/wiki/Q844813"
  },
  {
    "id": "383-madison-avenue",
    "name": "383 Madison Avenue",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 230,
    "heightFeet": 755,
    "sourceUrl": "https://www.wikidata.org/wiki/Q228242"
  },
  {
    "id": "palace-of-culture-and-science",
    "name": "Palace of Culture and Science",
    "city": "Warsaw",
    "country": "Poland",
    "heightMeters": 230,
    "heightFeet": 755,
    "sourceUrl": "https://www.wikidata.org/wiki/Q167566"
  },
  {
    "id": "heron-tower",
    "name": "Heron Tower",
    "city": "City of London",
    "country": "United Kingdom",
    "heightMeters": 230,
    "heightFeet": 755,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1613853"
  },
  {
    "id": "enterprise-plaza",
    "name": "Enterprise Plaza",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 230,
    "heightFeet": 755,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1344723"
  },
  {
    "id": "emperador-castellana-tower",
    "name": "Emperador Castellana Tower",
    "city": "Madrid",
    "country": "Spain",
    "heightMeters": 230,
    "heightFeet": 755,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1364354"
  },
  {
    "id": "122-leadenhall-street",
    "name": "122 Leadenhall Street",
    "city": "City of London",
    "country": "United Kingdom",
    "heightMeters": 230,
    "heightFeet": 755,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2742547"
  },
  {
    "id": "1717-broadway",
    "name": "1717 Broadway",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 229.7,
    "heightFeet": 754,
    "sourceUrl": "https://www.wikidata.org/wiki/Q198238"
  },
  {
    "id": "axa-equitable-center",
    "name": "AXA Equitable Center",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 229,
    "heightFeet": 751,
    "sourceUrl": "https://www.wikidata.org/wiki/Q300254"
  },
  {
    "id": "exxon-building",
    "name": "Exxon Building",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 229,
    "heightFeet": 751,
    "sourceUrl": "https://www.wikidata.org/wiki/Q173498"
  },
  {
    "id": "one-penn-plaza",
    "name": "One Penn Plaza",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 229,
    "heightFeet": 751,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1138648"
  },
  {
    "id": "paramount-tower",
    "name": "Paramount Tower",
    "city": "Nashville",
    "country": "United States",
    "heightMeters": 228.6,
    "heightFeet": 750,
    "sourceUrl": "https://www.wikidata.org/wiki/Q130618769"
  },
  {
    "id": "200-west-street",
    "name": "200 West Street",
    "city": "Battery Park City",
    "country": "United States",
    "heightMeters": 228.3,
    "heightFeet": 749,
    "sourceUrl": "https://www.wikidata.org/wiki/Q116002"
  },
  {
    "id": "gas-company-tower",
    "name": "Gas Company Tower",
    "city": "Los Angeles",
    "country": "United States",
    "heightMeters": 228.3,
    "heightFeet": 749,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2424258"
  },
  {
    "id": "the-met",
    "name": "The Met",
    "city": "Bangkok",
    "country": "Thailand",
    "heightMeters": 228,
    "heightFeet": 748,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1426419"
  },
  {
    "id": "one-astor-plaza",
    "name": "One Astor Plaza",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 227,
    "heightFeet": 745,
    "sourceUrl": "https://www.wikidata.org/wiki/Q659652"
  },
  {
    "id": "60-wall-street",
    "name": "60 Wall Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 227,
    "heightFeet": 745,
    "sourceUrl": "https://www.wikidata.org/wiki/Q247887"
  },
  {
    "id": "empire-tower",
    "name": "Empire Tower",
    "city": "Bangkok",
    "country": "Thailand",
    "heightMeters": 227,
    "heightFeet": 745,
    "sourceUrl": "https://www.wikidata.org/wiki/Q120546"
  },
  {
    "id": "centerpoint-energy-plaza",
    "name": "CenterPoint Energy Plaza",
    "city": "Texas",
    "country": "United States",
    "heightMeters": 226,
    "heightFeet": 741,
    "sourceUrl": "https://www.wikidata.org/wiki/Q531752"
  },
  {
    "id": "20-exchange-place",
    "name": "20 Exchange Place",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 226,
    "heightFeet": 741,
    "sourceUrl": "https://www.wikidata.org/wiki/Q212831"
  },
  {
    "id": "one-liberty-plaza",
    "name": "One Liberty Plaza",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 226,
    "heightFeet": 741,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1144187"
  },
  {
    "id": "swissotel-the-stamford",
    "name": "Swissôtel The Stamford",
    "city": "Singapore",
    "country": "Singapore",
    "heightMeters": 226,
    "heightFeet": 741,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1343055"
  },
  {
    "id": "7-world-trade-center",
    "name": "7 World Trade Center",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 225,
    "heightFeet": 738,
    "sourceUrl": "https://www.wikidata.org/wiki/Q270066"
  },
  {
    "id": "tokyu-kabukicho-tower",
    "name": "Tokyu Kabukicho Tower",
    "city": "Kabukichō",
    "country": "Japan",
    "heightMeters": 225,
    "heightFeet": 738,
    "sourceUrl": "https://www.wikidata.org/wiki/Q109595002"
  },
  {
    "id": "fontainebleau-las-vegas",
    "name": "Fontainebleau Las Vegas",
    "city": "Paradise",
    "country": "United States",
    "heightMeters": 224,
    "heightFeet": 735,
    "sourceUrl": "https://www.wikidata.org/wiki/Q278380"
  },
  {
    "id": "1600-smith-street",
    "name": "1600 Smith Street",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 223,
    "heightFeet": 732,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1128788"
  },
  {
    "id": "bertelsmann-building",
    "name": "Bertelsmann Building",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 223,
    "heightFeet": 732,
    "sourceUrl": "https://www.wikidata.org/wiki/Q827638"
  },
  {
    "id": "carlton-centre",
    "name": "Carlton Centre",
    "city": "Johannesburg",
    "country": "South Africa",
    "heightMeters": 222.5,
    "heightFeet": 730,
    "sourceUrl": "https://www.wikidata.org/wiki/Q976172"
  },
  {
    "id": "chang-gu-world-trade-center",
    "name": "Chang-Gu World Trade Center",
    "city": "Sanmin District",
    "country": "Taiwan",
    "heightMeters": 222,
    "heightFeet": 728,
    "sourceUrl": "https://www.wikidata.org/wiki/Q697076"
  },
  {
    "id": "raffles-city-shanghai",
    "name": "Raffles City Shanghai",
    "city": "Huangpu District",
    "country": "People's Republic of China",
    "heightMeters": 222,
    "heightFeet": 728,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2195212"
  },
  {
    "id": "olympic-tower",
    "name": "Olympic Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 221,
    "heightFeet": 725,
    "sourceUrl": "https://www.wikidata.org/wiki/Q510272"
  },
  {
    "id": "times-square-tower",
    "name": "Times Square Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 221,
    "heightFeet": 725,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1580807"
  },
  {
    "id": "olympia-centre",
    "name": "Olympia Centre",
    "city": "Chicago",
    "country": "United States",
    "heightMeters": 221,
    "heightFeet": 725,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1787863"
  },
  {
    "id": "777-tower",
    "name": "777 Tower",
    "city": "Los Angeles",
    "country": "United States",
    "heightMeters": 221,
    "heightFeet": 725,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1937376"
  },
  {
    "id": "saint-luke-s-tower",
    "name": "Saint Luke's Tower",
    "city": "Akashichō",
    "country": "Japan",
    "heightMeters": 220.6,
    "heightFeet": 724,
    "sourceUrl": "https://www.wikidata.org/wiki/Q2736562"
  },
  {
    "id": "warsaw-spire",
    "name": "Warsaw Spire",
    "city": "Warsaw",
    "country": "Poland",
    "heightMeters": 220,
    "heightFeet": 722,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1357866"
  },
  {
    "id": "hi-tower-building",
    "name": "Hi Tower building",
    "city": "Givatayim",
    "country": "Israel",
    "heightMeters": 220,
    "heightFeet": 722,
    "sourceUrl": "https://www.wikidata.org/wiki/Q111337545"
  },
  {
    "id": "250-east-57th-street",
    "name": "250 East 57th Street",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 218,
    "heightFeet": 715,
    "sourceUrl": "https://www.wikidata.org/wiki/Q217827"
  },
  {
    "id": "one-shell-plaza",
    "name": "One Shell Plaza",
    "city": "Houston",
    "country": "United States",
    "heightMeters": 218,
    "heightFeet": 715,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1537698"
  },
  {
    "id": "metropolitan-tower",
    "name": "Metropolitan Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 218,
    "heightFeet": 715,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1925883"
  },
  {
    "id": "900-biscayne-bay",
    "name": "900 Biscayne Bay",
    "city": "Miami",
    "country": "United States",
    "heightMeters": 217,
    "heightFeet": 712,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28833"
  },
  {
    "id": "610-lexington-avenue",
    "name": "610 Lexington Avenue",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 217,
    "heightFeet": 712,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1710367"
  },
  {
    "id": "500-fifth-avenue",
    "name": "500 Fifth Avenue",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 216.1,
    "heightFeet": 709,
    "sourceUrl": "https://www.wikidata.org/wiki/Q133599"
  },
  {
    "id": "shiodome-city-center",
    "name": "Shiodome City Center",
    "city": "Higashi-Shinbashi",
    "country": "Japan",
    "heightMeters": 215.8,
    "heightFeet": 708,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1134566"
  },
  {
    "id": "terminal-tower",
    "name": "Terminal Tower",
    "city": "Cleveland",
    "country": "United States",
    "heightMeters": 215.8,
    "heightFeet": 708,
    "sourceUrl": "https://www.wikidata.org/wiki/Q598604"
  },
  {
    "id": "general-motors-building",
    "name": "General Motors Building",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 215,
    "heightFeet": 705,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1501652"
  },
  {
    "id": "sumitomo-fudosan-tokyo-mita-garden-tower",
    "name": "Sumitomo Fudosan Tokyo Mita Garden Tower",
    "city": "Mita",
    "country": "Japan",
    "heightMeters": 215,
    "heightFeet": 705,
    "sourceUrl": "https://www.wikidata.org/wiki/Q116947281"
  },
  {
    "id": "torre-ejecutiva-pemex",
    "name": "Torre Ejecutiva Pemex",
    "city": "Mexico City",
    "country": "Mexico",
    "heightMeters": 214,
    "heightFeet": 702,
    "sourceUrl": "https://www.wikidata.org/wiki/Q948178"
  },
  {
    "id": "metropolitan-life-insurance-company-tower",
    "name": "Metropolitan Life Insurance Company Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 213,
    "heightFeet": 699,
    "sourceUrl": "https://www.wikidata.org/wiki/Q652452"
  },
  {
    "id": "victoria-towers",
    "name": "Victoria Towers",
    "city": "Yau Tsim Mong District",
    "country": "People's Republic of China",
    "heightMeters": 213,
    "heightFeet": 699,
    "sourceUrl": "https://www.wikidata.org/wiki/Q241648"
  },
  {
    "id": "act-tower",
    "name": "Act Tower",
    "city": "Hamamatsu",
    "country": "Japan",
    "heightMeters": 212.8,
    "heightFeet": 698,
    "sourceUrl": "https://www.wikidata.org/wiki/Q1096141"
  },
  {
    "id": "hancock-whitney-center",
    "name": "Hancock Whitney Center",
    "city": "New Orleans",
    "country": "United States",
    "heightMeters": 212.5,
    "heightFeet": 697,
    "sourceUrl": "https://www.wikidata.org/wiki/Q28868"
  },
  {
    "id": "eighth-avenue-place-east-tower",
    "name": "Eighth Avenue Place East Tower",
    "city": "Alberta",
    "country": "Canada",
    "heightMeters": 212.3,
    "heightFeet": 697,
    "sourceUrl": "https://www.wikidata.org/wiki/Q122474969"
  },
  {
    "id": "omkar-1973-tower-a",
    "name": "Omkar 1973 Tower A",
    "city": "Mumbai",
    "country": "India",
    "heightMeters": 212,
    "heightFeet": 696,
    "sourceUrl": "https://www.wikidata.org/wiki/Q122853217"
  },
  {
    "id": "cathay-landmark",
    "name": "Cathay Landmark",
    "city": "Xinyi Planning District",
    "country": "Taiwan",
    "heightMeters": 212,
    "heightFeet": 696,
    "sourceUrl": "https://www.wikidata.org/wiki/Q21449366"
  },
  {
    "id": "brookfield-tower",
    "name": "Brookfield Tower",
    "city": "Los Angeles",
    "country": "United States",
    "heightMeters": 211.7,
    "heightFeet": 695,
    "sourceUrl": "https://www.wikidata.org/wiki/Q113153161"
  },
  {
    "id": "seven-stars-tower",
    "name": "Seven stars tower",
    "city": "Bnei Brak",
    "country": "Israel",
    "heightMeters": 211.3,
    "heightFeet": 693,
    "sourceUrl": "https://www.wikidata.org/wiki/Q113612483"
  },
  {
    "id": "americas-tower",
    "name": "Americas Tower",
    "city": "Manhattan",
    "country": "United States",
    "heightMeters": 211,
    "heightFeet": 692,
    "sourceUrl": "https://www.wikidata.org/wiki/Q467467"
  },
  {
    "id": "china-merchants-tower",
    "name": "China Merchants Tower",
    "city": "Nanshan District",
    "country": "People's Republic of China",
    "heightMeters": 211,
    "heightFeet": 692,
    "sourceUrl": "https://www.wikidata.org/wiki/Q23945453"
  }
] as const;

export const jetLibrary = [
  { id: "f-35-lightning-ii", name: "F-35 Lightning II", country: "United States", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q167811" },
  { id: "f-22-raptor", name: "F-22 Raptor", country: "United States", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q182048" },
  { id: "su-57", name: "Sukhoi Su-57", country: "Russia", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q753410" },
  { id: "j-20", name: "Chengdu J-20", country: "China", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q1072516" },
  { id: "b-2-spirit", name: "B-2 Spirit", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q179388" },
  { id: "b-21-raider", name: "B-21 Raider", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q1649200" },
  { id: "f-117-nighthawk", name: "F-117 Nighthawk", country: "United States", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q216713" },
  { id: "sr-71-blackbird", name: "SR-71 Blackbird", country: "United States", category: "recon", sourceUrl: "https://www.wikidata.org/wiki/Q214581" },
  { id: "u-2", name: "Lockheed U-2", country: "United States", category: "recon", sourceUrl: "https://www.wikidata.org/wiki/Q218416" },
  { id: "f-15-eagle", name: "F-15 Eagle", country: "United States", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q207556" },
  { id: "f-a-18-hornet", name: "F/A-18 Hornet", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188155" },
  { id: "f-a-18-super-hornet", name: "F/A-18E/F Super Hornet", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q182878" },
  { id: "f-16-fighting-falcon", name: "F-16 Fighting Falcon", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188153" },
  { id: "f-14-tomcat", name: "F-14 Tomcat", country: "United States", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q182979" },
  { id: "a-10-thunderbolt-ii", name: "A-10 Thunderbolt II", country: "United States", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q183550" },
  { id: "rafale", name: "Dassault Rafale", country: "France", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188163" },
  { id: "eurofighter-typhoon", name: "Eurofighter Typhoon", country: "United Kingdom/Germany/Italy/Spain", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q187961" },
  { id: "jas-39-gripen", name: "Saab JAS 39 Gripen", country: "Sweden", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188158" },
  { id: "mig-29", name: "Mikoyan MiG-29", country: "Russia", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q184905" },
  { id: "su-27", name: "Sukhoi Su-27", country: "Russia", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q184907" },
  { id: "su-35", name: "Sukhoi Su-35", country: "Russia", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q752099" },
  { id: "su-34", name: "Sukhoi Su-34", country: "Russia", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q753392" },
  { id: "mig-31", name: "Mikoyan MiG-31", country: "Russia", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q184910" },
  { id: "tu-160", name: "Tupolev Tu-160", country: "Russia", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q183754" },
  { id: "tu-22m", name: "Tupolev Tu-22M", country: "Russia", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q218247" },
  { id: "b-1-lancer", name: "B-1 Lancer", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q193598" },
  { id: "b-52-stratofortress", name: "B-52 Stratofortress", country: "United States", category: "bomber", sourceUrl: "https://www.wikidata.org/wiki/Q179391" },
  { id: "mirage-2000", name: "Dassault Mirage 2000", country: "France", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q188167" },
  { id: "mirage-f1", name: "Dassault Mirage F1", country: "France", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q465786" },
  { id: "sepecat-jaguar", name: "SEPECAT Jaguar", country: "United Kingdom/France", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q213778" },
  { id: "panavia-tornado", name: "Panavia Tornado", country: "United Kingdom/Germany/Italy", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q161062" },
  { id: "av-8b-harrier-ii", name: "AV-8B Harrier II", country: "United States/United Kingdom", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q747709" },
  { id: "hawker-harrier", name: "Hawker Siddeley Harrier", country: "United Kingdom", category: "attack", sourceUrl: "https://www.wikidata.org/wiki/Q383342" },
  { id: "l-39-albatros", name: "Aero L-39 Albatros", country: "Czechoslovakia", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q217457" },
  { id: "t-50-golden-eagle", name: "T-50 Golden Eagle", country: "South Korea", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q489410" },
  { id: "yak-130", name: "Yakovlev Yak-130", country: "Russia", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q4514" },
  { id: "hongdu-l-15", name: "Hongdu L-15", country: "China", category: "trainer", sourceUrl: "https://www.wikidata.org/wiki/Q740536" },
  { id: "j-10", name: "Chengdu J-10", country: "China", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q620300" },
  { id: "j-11", name: "Shenyang J-11", country: "China", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q625850" },
  { id: "j-16", name: "Shenyang J-16", country: "China", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q3897132" },
  { id: "fc-31", name: "Shenyang FC-31", country: "China", category: "stealth", sourceUrl: "https://www.wikidata.org/wiki/Q131176348" },
  { id: "hal-tejas", name: "HAL Tejas", country: "India", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q319131" },
  { id: "mitsubishi-f-2", name: "Mitsubishi F-2", country: "Japan", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q592814" },
  { id: "f-15j", name: "Mitsubishi F-15J", country: "Japan", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q1140645" },
  { id: "f-ck-1", name: "AIDC F-CK-1 Ching-kuo", country: "Taiwan", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q465819" },
  { id: "iai-kfir", name: "IAI Kfir", country: "Israel", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q610877" },
  { id: "f-5", name: "Northrop F-5", country: "United States", category: "dogfighter", sourceUrl: "https://www.wikidata.org/wiki/Q192440" },
  { id: "f-4-phantom-ii", name: "F-4 Phantom II", country: "United States", category: "multirole", sourceUrl: "https://www.wikidata.org/wiki/Q206734" },
  { id: "english-electric-lightning", name: "English Electric Lightning", country: "United Kingdom", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q844935" },
  { id: "mig-21", name: "MiG-21", country: "Soviet Union", category: "interceptor", sourceUrl: "https://www.wikidata.org/wiki/Q182478" },
] as const;

export const contentLibraryStats = {
  peppers: pepperLibrary.length,
  sharks: sharkLibrary.length,
  buildings: buildingLibrary.length,
  jets: jetLibrary.length,
  total: pepperLibrary.length + sharkLibrary.length + buildingLibrary.length + jetLibrary.length,
} as const;

import type { Pack } from "./pack-types";

export type LandingTopicCard = {
  id: string;
  title: string;
  detail: string;
  image: string;
  imageFit: "cover" | "contain";
  order: number;
};

const builtInLandingTopicCards: LandingTopicCard[] = [
  { id: "peppers", title: "Peppers", detail: "Scoville heat, ranked", image: "/burrow-assets/peppers/carolina-reaper.jpg", imageFit: "cover", order: 10 },
  { id: "sharks", title: "Sharks", detail: "species & size", image: "/burrow-assets/sharks/great-white.jpg", imageFit: "cover", order: 20 },
  { id: "space", title: "Space", detail: "planets & moons", image: "/burrow-assets/space/saturn.jpg", imageFit: "cover", order: 30 },
  { id: "jets", title: "Jets", detail: "speed & stealth", image: "/burrow-assets/jets/f-22-raptor.jpg", imageFit: "cover", order: 40 },
  { id: "buildings", title: "Towers", detail: "height, floor by floor", image: "/burrow-assets/buildings/burj-khalifa.jpg", imageFit: "cover", order: 50 },
  { id: "countries", title: "World", detail: "flags & borders", image: "/world-map-land.svg", imageFit: "contain", order: 60 },
];

const landingCardForPack = (pack: Pack): LandingTopicCard => ({
  id: pack.id,
  title: pack.landing?.title ?? pack.title,
  detail: pack.landing?.detail ?? pack.summary,
  image: pack.landing?.image ?? pack.cards[0]?.image ?? "/icons/burrow-icon-512.png",
  imageFit: pack.landing?.imageFit ?? "cover",
  order: pack.landing?.order ?? 1_000,
});

export const buildLandingTopicCards = (packs: readonly Pack[]): LandingTopicCard[] =>
  [...builtInLandingTopicCards, ...packs.map(landingCardForPack)]
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));

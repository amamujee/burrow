import { BurrowGame } from "@/components/burrow-game";
import { loadPlayablePacks } from "@/lib/pack-loader";

export default function PlayPage() {
  const packs = loadPlayablePacks();
  return <BurrowGame packs={packs} />;
}

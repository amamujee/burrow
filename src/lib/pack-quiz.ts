import type { Difficulty } from "./game-data";
import type { PlayablePackDeck } from "./pack-adapter";
import { poolForDifficulty } from "./difficulty-pool";
import { questionDepthForSelection } from "./difficulty";
import { shuffle, seedRandom } from "./random";
import type { Question } from "./questions";

// Answers are grounded in each card's existing sourced fact. The fact itself
// is the reading passage, so uncertainty and qualifications stay visible.
// A null prompt reuses the card author's original reading prompt.
type Reading = [prompt: string | null, answer: string, ...distractors: [string, string, string]];
export const packReadings: Record<string, Reading> = {
  "dinosaurs:tyrannosaurus-rex": [null, "Its teeth and powerful bite", "Its bony frill", "Its long neck", "Its tail spikes"],
  "dinosaurs:triceratops": [null, "Three", "One", "Two", "Four"],
  "dinosaurs:stegosaurus": [null, "Sharp spikes", "A bony frill", "Large wings", "A long horn"],
  "dinosaurs:velociraptor": ["Which description fits the fossil animal in the note?", "A small, feathered hunter", "A giant without feathers", "A long-necked plant eater", "An animal with a bony frill"],
  "fruits:apple": ["Will a seed always grow the same kind of apple as its parent?", "No, its fruit can be very different", "Yes, every seed makes identical fruit", "Only the skin color can change", "Every seed preserves the parent’s flavor"],
  "fruits:banana": ["What forms the banana plant's tall stem?", "Tightly wrapped leaf bases", "A solid wooden trunk", "Layers of woody branches", "Roots growing above the ground"],
  "fruits:orange": ["What holds the juice inside an orange's segments?", "Tiny sacs", "Hard seeds", "The outer peel", "Large air pockets"],
  "fruits:mango": ["Why is skin color alone a poor test for ripeness?", "Mango skins can be several colors", "Every ripe mango is red", "Green always means unripe", "Yellow always means ripe"],
  "bridges-and-tunnels:brooklyn-bridge": ["Which details support the idea that this bridge uses cables?", "Suspension cables and diagonal stays", "Stone arches with no cables", "A deck held up only by beams", "A floating deck anchored to shore"],
  "bridges-and-tunnels:manhattan-bridge": ["What can you infer about the bridge from the note?", "It serves several kinds of traffic", "It is only for subway trains", "People cannot cross on foot", "It connects Manhattan to New Jersey"],
  "bridges-and-tunnels:williamsburg-bridge": ["What does 'was once the longest' tell us?", "It held a length record in the past", "It holds the length record today", "It is the oldest suspension bridge", "It was the first bridge across the river"],
  "bridges-and-tunnels:queensboro-bridge": ["What is another name for the same bridge?", "Ed Koch Queensboro Bridge", "Brooklyn Bridge", "Manhattan Bridge", "Williamsburg Bridge"],
  "hot-sauces:secret-aardvark-habanero": ["Which pair joins habanero in this sauce?", "Roasted tomato and mustard", "Carrots and lime", "Apple and cinnamon", "Coconut and mint"],
  "hot-sauces:marie-sharps-belizean-heat": ["Which vegetable is named alongside onions and garlic?", "Carrots", "Potatoes", "Peas", "Cabbage"],
  "hot-sauces:nandos-hot-peri-peri": ["What does peri-peri refer to in this note?", "African bird's eye chillies", "A type of mustard", "Roasted tomatoes", "A variety of carrot"],
  "hot-sauces:hot-ones-the-classic": ["Which pepper is named in the note?", "Chile de árbol", "Habanero", "Ghost pepper", "Carolina Reaper"],
  "tall-trees:dave-human": ["Why use Dave to help picture a tree's height?", "His height stays fixed at 6 feet", "His height changes to match each tree", "He represents the height of every person", "He measures how fast a tree grows"],
  "tall-trees:geoffrey-giraffe": ["Does this note say every giraffe is exactly 18 feet tall?", "No, it uses an approximate example", "Yes, they are all identical", "Yes, 'about' means exactly", "No, it says giraffes are 6 feet tall"],
  "tall-trees:english-oak": ["How can an oak help woodland animals?", "By providing food and shelter", "By sheltering animals but offering no food", "By offering food but no shelter", "By giving animals only a place to drink"],
  "tall-trees:atlantis-shuttle-stack": ["What does the 184-foot height describe?", "The shuttle, fuel tank and boosters together", "The shuttle alone", "Only the fuel tank", "Only one booster"],
  "tallest-mountains:mount-everest": ["What qualification matters in Everest's height record?", "Height above sea level", "Distance from Earth's center", "Height from its underwater base", "Width of the mountain"],
  "tallest-mountains:k2": ["Which conditions could make climbing K2 difficult?", "Steep routes and severe weather", "Flat routes and mild weather", "Sheltered trails and steady warmth", "Gentle slopes and predictable weather"],
  "tallest-mountains:kangchenjunga": ["What does 'on the border' tell you about its location?", "It lies where Nepal and India meet", "It is entirely inside Nepal", "It is entirely inside India", "It lies where China and Pakistan meet"],
  "tallest-mountains:lhotse": ["Which mountain is next to Lhotse?", "Everest", "K2", "Kilimanjaro", "Denali"],
};

export function packQuizCandidates(deck: PlayablePackDeck, difficulty: Difficulty, seed: number): Question[] {
  const preferred = poolForDifficulty(deck.cards, difficulty);
  const cards = preferred.length >= 4 ? preferred : deck.cards;
  const random = seedRandom(seed);
  const depth = questionDepthForSelection(difficulty, seed);
  return cards.flatMap((card): Question[] => {
    const base = {
      id: `${seed}-${deck.id}-${card.id}`, topic: deck.id, image: card.image,
      imageAlt: card.imageAlt, imageCredit: card.imageCredit, collectionTitles: [card.title],
    };
    const readings = packReadings[`${deck.id}:${card.id}`];
    const questions: Question[] = [];
    if (readings) {
      const [prompt, answer, ...distractors] = readings;
      questions.push({ ...base, id: `${base.id}-reading`, kind: "pack-reading",
        prompt: prompt ?? card.readingPrompts![0], readingClue: card.fact,
        choices: shuffle([answer, ...distractors], random), answer, explanation: card.fact });
    }
    const group = card.metadata?.taxonomyGroup;
    const otherGroups = [...new Set(deck.cards.map((other) => other.metadata?.taxonomyGroup)
      .filter((value): value is string => Boolean(value) && value !== group))];
    if (group && otherGroups.length >= 3) {
      const human = (value: string) => value.replace(/-/g, " ");
      questions.push({ ...base, id: `${base.id}-group`, kind: "pack-classification",
        prompt: `Which group does ${card.title} belong to?`,
        choices: shuffle([human(group), ...shuffle(otherGroups, random).slice(0, 3).map(human)], random),
        answer: human(group), explanation: `${card.title} belongs to the ${human(group)} group. ${card.fact}` });
    }
    // Recognition remains available at every depth; harder selections favor
    // reading and classification without changing the four-choice format.
    if (depth === 1 || !questions.length) questions.push({ ...base, id: `${base.id}-name`, kind: "pack-name",
      prompt: "What is shown in this picture?", answer: card.title,
      choices: shuffle([card.title, ...shuffle(cards.filter((other) => other.id !== card.id), random).slice(0, 3).map((other) => other.title)], random),
      explanation: card.fact });
    return questions;
  });
}

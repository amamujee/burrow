import Image from "next/image";
import Link from "next/link";

type Direction = {
  id: string;
  name: string;
  line: string;
  background: string;
  frame: string;
  hud: string;
  stage: string;
  panel: string;
  badge: string;
  accent: string;
  button: string;
  text: string;
  muted: string;
  image: string;
  imageAlt: string;
  topic: string;
  prompt: string;
  choices: string[];
  stat: string;
  note: string;
};

const directions: Direction[] = [
  {
    id: "field-guide",
    name: "Field Guide Deluxe",
    line: "Premium nature-book energy: polished, tactile, warm, and still very kid-readable.",
    background: "bg-[#0d332f]",
    frame: "border-[#092421] bg-[#f7f0df] shadow-[6px_6px_0_#092421]",
    hud: "border-[#d9c7a7] bg-[#fff9ec]",
    stage: "border-[#092421] bg-[#123d38]",
    panel: "border-[#d9c7a7] bg-[#fffdf6]",
    badge: "border-[#092421] bg-[#f0c84b] text-[#092421]",
    accent: "bg-[#70d392]",
    button: "border-[#092421] bg-[#123d38] text-white shadow-[3px_3px_0_#092421]",
    text: "text-[#102f36]",
    muted: "text-[#6b5a45]",
    image: "/burrow-assets/peppers/carolina-reaper.jpg",
    imageAlt: "Carolina Reaper peppers",
    topic: "Pepper Round",
    prompt: "What heat zone is Carolina Reaper?",
    choices: ["hot", "very hot", "insane"],
    stat: "1,641,183 SHU",
    note: "Greenhouse texture, sturdy paper panels, and a little museum-label polish.",
  },
  {
    id: "moon-lab",
    name: "Moon Lab",
    line: "High-contrast discovery lab: cinematic, focused, and a little electric without feeling teen-gamer.",
    background: "bg-[#061826]",
    frame: "border-[#b8e6ff] bg-[#0b2233] shadow-[6px_6px_0_#031019]",
    hud: "border-[#21455b] bg-[#102d42]",
    stage: "border-[#b8e6ff] bg-[#05111c]",
    panel: "border-[#21455b] bg-[#f4fbff]",
    badge: "border-[#b8e6ff] bg-[#d7f45f] text-[#071f2f]",
    accent: "bg-[#54d7b7]",
    button: "border-[#b8e6ff] bg-[#d7f45f] text-[#071f2f] shadow-[3px_3px_0_#031019]",
    text: "text-[#0c2633]",
    muted: "text-[#7d95a3]",
    image: "/burrow-assets/space/nebula.jpg",
    imageAlt: "A bright nebula in space",
    topic: "Space Round",
    prompt: "Which clue points to a stellar nursery?",
    choices: ["nebula", "black hole", "Mercury"],
    stat: "stars forming",
    note: "More cinematic image treatment, slim lab controls, and bright reward accents.",
  },
  {
    id: "sticker-quest",
    name: "Sticker Quest",
    line: "Bouncier and more toy-like: collectible, chunky, colorful, and built for younger kids.",
    background: "bg-[#143c52]",
    frame: "border-[#082329] bg-[#eaf7ff] shadow-[6px_6px_0_#082329]",
    hud: "border-[#a7d8e8] bg-white",
    stage: "border-[#082329] bg-[#92d8ef]",
    panel: "border-[#a7d8e8] bg-white",
    badge: "border-[#082329] bg-[#ffcf4d] text-[#102f36]",
    accent: "bg-[#ff8f72]",
    button: "border-[#082329] bg-[#ffcf4d] text-[#102f36] shadow-[3px_3px_0_#082329]",
    text: "text-[#102f36]",
    muted: "text-[#50717d]",
    image: "/burrow-assets/sharks/whale-shark.jpg",
    imageAlt: "A whale shark swimming underwater",
    topic: "Shark Round",
    prompt: "Which shark is the biggest filter feeder?",
    choices: ["whale shark", "blue shark", "shortfin mako"],
    stat: "about 40 ft",
    note: "Sticker-like labels, friendlier shapes, and more collectible-game personality.",
  },
];

export default function DesignDirectionsPage() {
  return (
    <main className="min-h-dvh bg-[#071f26] px-4 py-5 text-white sm:px-6 lg:px-8">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#75d5c0]">Burrow visual directions</p>
          <h1 className="mt-1 text-3xl font-black leading-none tracking-normal sm:text-5xl">App page mockups</h1>
        </div>
        <Link
          href="/play"
          className="rounded-lg border-2 border-[#b8e6ff] bg-white px-4 py-2 text-sm font-black text-[#071f26] shadow-[3px_3px_0_#031019]"
        >
          Back to app
        </Link>
      </header>

      <div className="mx-auto mt-6 grid max-w-7xl gap-8">
        {directions.map((direction, index) => (
          <DesignDirection key={direction.id} direction={direction} index={index + 1} />
        ))}
      </div>
    </main>
  );
}

function DesignDirection({ direction, index }: { direction: Direction; index: number }) {
  return (
    <section className={`rounded-lg border-2 border-white/15 p-3 shadow-[6px_6px_0_#031019] ${direction.background}`}>
      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">Option {index}</p>
          <h2 className="mt-1 text-2xl font-black leading-none tracking-normal text-white sm:text-4xl">{direction.name}</h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-snug text-white/80 sm:text-base">{direction.line}</p>
        </div>
        <p className="rounded-lg border-2 border-white/25 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/80">
          Mock only
        </p>
      </div>

      <div className={`rounded-lg border-2 p-2 ${direction.frame}`}>
        <MockHud direction={direction} />
        <div className="mt-2 grid gap-2 min-[900px]:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
          <MockStage direction={direction} />
          <MockQuestion direction={direction} />
        </div>
      </div>
    </section>
  );
}

function MockHud({ direction }: { direction: Direction }) {
  return (
    <div className={`grid gap-2 rounded-lg border-2 p-2 ${direction.hud} min-[900px]:grid-cols-[minmax(220px,.9fr)_minmax(220px,.75fr)_minmax(320px,1fr)_auto]`}>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/burrow-icon-64.png"
          alt=""
          width={44}
          height={44}
          className="rounded-lg border-2 border-[#082329] bg-[#f5d39c]"
        />
        <div>
          <p className={`text-xl font-black leading-none ${direction.text}`}>Burrow</p>
          <p className={`text-[10px] font-black uppercase tracking-[0.12em] ${direction.muted}`}>Kal</p>
        </div>
      </div>

      <div className={`grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg border-2 p-2 ${direction.panel}`}>
        <div className={`grid h-12 w-12 place-items-center rounded-lg border-2 text-center ${direction.badge}`}>
          <span className="block text-[8px] font-black uppercase leading-none tracking-[0.1em]">Level</span>
          <span className="block text-2xl font-black leading-none">8</span>
        </div>
        <div>
          <p className={`text-sm font-black leading-tight ${direction.text}`}>Glow</p>
          <div className="mt-1 grid grid-cols-6 gap-1">
            {Array.from({ length: 6 }, (_, item) => (
              <span key={item} className={`h-3 rounded-sm border-2 border-[#082329] ${item < 3 ? direction.accent : "bg-white"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-1 rounded-lg border-2 p-1 ${direction.panel}`}>
        {["Easy", "Med", "Hard"].map((item, itemIndex) => (
          <div
            key={item}
            className={`rounded-md border-2 px-2 py-2 text-center text-sm font-black ${
              itemIndex === 0 ? `${direction.badge} shadow-[2px_2px_0_#082329]` : "border-transparent bg-transparent"
            } ${direction.text}`}
          >
            {item}
          </div>
        ))}
      </div>

      <div className={`grid min-h-12 place-items-center rounded-lg border-2 px-4 text-sm font-black ${direction.panel} ${direction.text}`}>
        Setup
      </div>
    </div>
  );
}

function MockStage({ direction }: { direction: Direction }) {
  return (
    <article className={`relative min-h-[360px] overflow-hidden rounded-lg border-2 ${direction.stage}`}>
      <Image src={direction.image} alt={direction.imageAlt} fill sizes="(min-width: 900px) 62vw, 100vw" className="object-cover" />
      <div className={`absolute left-3 top-3 rounded-lg border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${direction.badge}`}>
        {direction.topic}
      </div>
      <div className="absolute inset-x-3 bottom-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="rounded-lg bg-black/72 px-3 py-2 text-xs font-bold leading-tight text-white">Image: real Burrow asset</div>
        <div className={`rounded-lg border-2 px-3 py-2 text-sm font-black ${direction.badge}`}>{direction.stat}</div>
      </div>
    </article>
  );
}

function MockQuestion({ direction }: { direction: Direction }) {
  return (
    <article className={`flex min-h-[360px] flex-col rounded-lg border-2 p-3 shadow-[3px_3px_0_#082329] ${direction.panel}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-lg border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${direction.badge}`}>Easy</span>
        <span className={`rounded-lg px-2 py-1 text-xs font-black ${direction.text} bg-black/5`}>1/16</span>
      </div>

      <h3 className={`mt-3 text-3xl font-black leading-[1.02] tracking-normal ${direction.text}`}>{direction.prompt}</h3>

      <div className="mt-4 grid gap-2">
        {direction.choices.map((choice, choiceIndex) => (
          <div
            key={choice}
            className={`min-h-14 rounded-lg border-2 px-4 py-3 text-lg font-black ${direction.text} ${
              choiceIndex === 0 ? `${direction.badge} shadow-[2px_2px_0_#082329]` : "border-[#cdbfae] bg-white/80"
            }`}
          >
            {choice}
          </div>
        ))}
      </div>

      <div className={`mt-auto rounded-lg border-2 p-2.5 ${direction.panel}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`grid h-10 w-10 place-items-center rounded-lg border-2 text-xl font-black ${direction.badge}`}>+</span>
          <p className={`text-lg font-black leading-tight ${direction.text}`}>Nice catch</p>
          <span className={`rounded-full border-2 px-2 py-0.5 text-sm font-black ${direction.badge}`}>+32 glow</span>
        </div>
        <p className={`mt-2 text-sm font-bold leading-snug ${direction.muted}`}>{direction.note}</p>
        <div className={`mt-3 rounded-lg border-2 px-4 py-3 text-center text-base font-black ${direction.button}`}>Next</div>
      </div>
    </article>
  );
}

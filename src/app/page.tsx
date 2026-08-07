import Image from "next/image";
import Link from "next/link";

const previewModes = [
  { label: "Mix", detail: "a bit of everything", color: "#f0c84b", active: true },
  { label: "Head to Head", detail: "compare the numbers", color: "#f59a7d", active: false },
  { label: "Top Trumps", detail: "beat the CPU", color: "#8fc4e0", active: false },
  { label: "Sort", detail: "put cards in order", color: "#d9a8e0", active: false },
  { label: "True/False", detail: "read closely, decide fast", color: "#c9d97a", active: false },
  { label: "Peek", detail: "guess from a zoomed-in clue", color: "#70d392", active: false },
] as const;

const practiceAreas = [
  {
    title: "Math",
    color: "#70d392",
    body: "Addition, subtraction, and multiplication — using real numbers pulled from real stats: Scoville units, wingspans, summit heights.",
    modes: "Numbers · Head to Head · Top Trumps",
  },
  {
    title: "Reading",
    color: "#f0c84b",
    body: "Every round starts with something to read closely — a fact, a clue, a true-or-false statement — before the answer choices even matter.",
    modes: "Quiz · True/False · Sort · Odd One",
  },
  {
    title: "Geography",
    color: "#8fc4e0",
    body: "Tap the right spot on a real world map in Geo Finder, or match flags and borders in the World pack.",
    modes: "Geo Finder · World pack",
  },
  {
    title: "Science",
    color: "#f59a7d",
    body: "Heat scales, bite force, thrust, gravity — every topic pack carries real facts about how the natural and built world actually works.",
    modes: "Peppers · Sharks · Space · Dinosaurs",
  },
] as const;

const topicCards = [
  { title: "Peppers", detail: "Scoville heat, ranked", image: "/burrow-assets/peppers/carolina-reaper.jpg" },
  { title: "Sharks", detail: "species & size", image: "/burrow-assets/sharks/great-white.jpg" },
  { title: "Space", detail: "planets & moons", image: "/burrow-assets/space/saturn.jpg" },
  { title: "Jets", detail: "speed & stealth", image: "/burrow-assets/jets/f-22-raptor.jpg" },
  { title: "Towers", detail: "height, floor by floor", image: "/burrow-assets/buildings/burj-khalifa.jpg" },
  { title: "World", detail: "flags & borders", image: "/world-map-land.svg" },
  { title: "Dinosaurs", detail: "size, era, diet", image: "/burrow-assets/dinosaurs/brachiosaurus.jpg" },
  { title: "Tall Trees", detail: "the tallest living things", image: "/burrow-assets/tall-trees/general-sherman.jpg" },
  { title: "Tallest Mountains", detail: "elevation, ranked", image: "/burrow-assets/tallest-mountains/k2.jpg" },
  { title: "Bridges & Tunnels", detail: "spans & records", image: "/burrow-assets/bridges-and-tunnels/golden-gate-bridge.jpg" },
] as const;

const playButtonClass = "inline-flex rounded-[10px] border-2 border-[#082329] bg-[#f3c647] px-5 py-3 text-base font-black text-[#102f36] shadow-[3px_3px_0_#082329] transition hover:-translate-y-0.5 hover:bg-[#ffd85f]";

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#fff4df] text-[#102f36]">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-[#fff4df]/90 px-5 py-3.5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3" aria-label="Burrow home">
          <Image
            src="/icons/burrow-icon-64.png"
            alt=""
            width={44}
            height={44}
            priority
            className="rounded-lg border-2 border-[#082329] bg-[#f5d39c] shadow-[2px_2px_0_#082329]"
          />
          <span className="text-xl font-black">Burrow</span>
        </Link>
        <Link href="/play" className={`${playButtonClass} px-4 py-2.5 text-sm`}>
          Play Burrow
        </Link>
      </header>

      <section className="relative flex min-h-[calc(100dvh-72px)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,#fff8db_0_6%,transparent_7%),linear-gradient(120deg,#fff8ea_0%,#ffe9b8_58%,#f6cf91_100%)]" />
        <div className="absolute -bottom-24 -right-20 h-[clamp(20rem,34vw,34rem)] w-[clamp(20rem,34vw,34rem)] rounded-full bg-[#6f4126]/20" />
        <div className="absolute -bottom-32 -right-32 h-[clamp(26rem,44vw,44rem)] w-[clamp(26rem,44vw,44rem)] rounded-full bg-[#4a271b]/20" />
        <div className="absolute -bottom-44 -right-44 h-[clamp(34rem,56vw,56rem)] w-[clamp(34rem,56vw,56rem)] rounded-full bg-[#2d1812]/12" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#7b4b2c]" />
        <div className="absolute inset-x-0 bottom-0 h-16 rounded-t-[50%] bg-[#4a271b]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col px-5 pb-0 pt-5">
          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(400px,.85fr)] lg:py-8">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b5538]">Parents set the topic</p>
              <h1 className="mt-4 text-[clamp(3.25rem,10vw,7.5rem)] font-black leading-[0.9] text-[#321e16]">Burrow</h1>
              <p className="mt-5 max-w-xl text-[clamp(1.25rem,2vw,1.5rem)] font-bold leading-snug text-[#253f45]">
                Dinosaurs, sharks, skyscrapers — whatever&apos;s stuck in their head. Burrow turns it into learning.
              </p>
              <p className="mt-5 max-w-xl text-base font-bold leading-relaxed text-[#4d4038] sm:text-lg">
                Built by{" "}
                <a href="https://github.com/amamujee" target="_blank" rel="noreferrer" className="underline decoration-[#102f36]/45 decoration-2 underline-offset-4 transition hover:decoration-[#102f36]">@amamujee</a>.
                {" "}Source on{" "}
                <a href="https://github.com/amamujee/burrow" target="_blank" rel="noreferrer" className="underline decoration-[#102f36]/45 decoration-2 underline-offset-4 transition hover:decoration-[#102f36]">GitHub</a>.
              </p>
              <div className="mt-8">
                <Link href="/play" className={playButtonClass}>Play Burrow</Link>
              </div>
            </div>

            <div className="relative min-h-[31rem]" aria-label="Example Burrow pepper game">
              <div className="absolute left-[8%] top-0 h-24 w-24 rounded-full bg-[#fff8db]" />
              <div className="absolute bottom-[4%] right-[4%] h-[clamp(14rem,22vw,21rem)] w-[clamp(14rem,22vw,21rem)] rounded-full bg-[#2b1711]" />
              <div className="absolute bottom-[16%] right-[16%] h-[clamp(10rem,16vw,16rem)] w-[clamp(10rem,16vw,16rem)] rounded-full bg-[#0f0f0f]" />
              <div className="absolute bottom-[28%] right-[28%] h-[clamp(5.5rem,9vw,9rem)] w-[clamp(5.5rem,9vw,9rem)] rounded-full bg-[#f3c647]" />

              <div className="relative mx-auto w-full max-w-[27rem] rounded-[10px] border-2 border-[#082329] bg-[#fffaf4] p-4 shadow-[5px_5px_0_#082329] lg:mx-0">
                <div className="flex items-center justify-between gap-4 border-b-2 border-[#e3c899] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Image src="/burrow-assets/peppers/carolina-reaper.jpg" alt="" width={32} height={32} priority className="h-8 w-8 rounded-lg border-2 border-[#082329] object-cover" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9b5538]">Topic pack</p>
                      <p className="text-2xl font-black leading-tight text-[#321e16]">Peppers</p>
                    </div>
                  </div>
                  <p className="rounded-[10px] border-2 border-[#082329] bg-[#e5f6e9] px-3 py-2 text-xs font-black text-[#305a3a]">Level 2</p>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  {previewModes.map((mode) => (
                    <div key={mode.label} className={`rounded-[10px] border-2 p-2.5 ${mode.active ? "border-[#082329] bg-[#fff1bf]" : "border-[#d5bea0] bg-white"}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: mode.color }} />
                        <p className="text-sm font-black leading-tight text-[#102f36]">{mode.label}</p>
                      </div>
                      <p className="mt-0.5 text-[11px] font-bold text-[#5b4438]">{mode.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 rounded-[10px] border-2 border-[#d5bea0] bg-white px-3 py-2 text-[11px]">
                  <p className="font-bold text-[#5b4438]">+ 3 more modes</p>
                  <p className="text-right font-black text-[#9b5538]">Collection cards reinforce learning →</p>
                </div>
                <div className="mt-2.5 rounded-[10px] border-2 border-[#082329] bg-[#f3c647] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#81533b]">Sample question</p>
                  <p className="mt-1 text-lg font-black leading-tight text-[#102f36]">What heat zone is Carolina Reaper?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff4df] px-5 pb-16 pt-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9b5538]">What they&apos;re practicing</p>
          <h2 className="mt-2.5 max-w-2xl text-[clamp(1.75rem,3.2vw,2.5rem)] font-black leading-tight text-[#321e16]">Every mode teaches new skills.</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {practiceAreas.map((area) => (
              <article key={area.title} className="rounded-[10px] border-2 border-[#082329] bg-[#fffaf4] p-[18px] shadow-[4px_4px_0_#082329]">
                <span className="block h-3 w-3 rounded-[3px]" style={{ backgroundColor: area.color }} />
                <h3 className="mt-3 text-xl font-black text-[#102f36]">{area.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#4d4038]">{area.body}</p>
                <p className="mt-2.5 text-[11px] font-extrabold text-[#9b5538]">{area.modes}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-[#e3c899] bg-[#fdecc8] px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9b5538]">What&apos;s inside</p>
          <h2 className="mt-2.5 max-w-2xl text-[clamp(1.75rem,3.2vw,2.5rem)] font-black leading-tight text-[#321e16]">Ten content packs from peppers to mountains — more to come.</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4d4038]">Every pack is real, credited photos saved right on the device — so it keeps working on a plane, in a car, anywhere the wifi doesn&apos;t.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {topicCards.map((topic) => (
              <article key={topic.title} className="group relative aspect-square overflow-hidden rounded-[10px] border-2 border-[#082329] bg-[#123d38] shadow-[4px_4px_0_#082329] transition hover:-translate-y-1">
                <Image
                  src={topic.image}
                  alt={topic.title}
                  fill
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
                  className={topic.title === "World" ? "object-contain p-[10%] opacity-85 brightness-150 invert" : "object-cover"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#092421]/90 via-transparent to-transparent" />
                <div className="absolute inset-x-2.5 bottom-2.5 text-white">
                  <h3 className="text-[15px] font-black">{topic.title}</h3>
                  <p className="mt-0.5 text-[11px] font-bold text-[#e9d9a8]">{topic.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

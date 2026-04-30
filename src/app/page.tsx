import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const gameModes = [
    { label: "Quiz", detail: "reading clues" },
    { label: "Head-to-head", detail: "compare numbers" },
    { label: "Reorder", detail: "sequence facts" },
    { label: "Coloring", detail: "label and shade" },
    { label: "Image reveal", detail: "guess in pieces" },
    { label: "Number line", detail: "place values" },
    { label: "True or false", detail: "read closely" },
    { label: "Collection", detail: "unlock cards" },
  ];

  return (
    <main className="min-h-screen min-h-dvh bg-[#fff4df] text-[#102f36]">
      <section className="relative flex min-h-screen min-h-dvh overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,#fff8db_0_6%,transparent_7%),linear-gradient(120deg,#fff8ea_0%,#ffe9b8_58%,#f6cf91_100%)]" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#6f4126]/20 sm:h-[34rem] sm:w-[34rem]" />
        <div className="absolute -bottom-32 -right-32 h-[26rem] w-[26rem] rounded-full bg-[#4a271b]/20 sm:h-[44rem] sm:w-[44rem]" />
        <div className="absolute -bottom-44 -right-44 h-[34rem] w-[34rem] rounded-full bg-[#2d1812]/12 sm:h-[56rem] sm:w-[56rem]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#7b4b2c]" />
        <div className="absolute inset-x-0 bottom-0 h-16 rounded-t-[50%] bg-[#4a271b]" />

        <div className="relative z-10 flex w-full flex-col px-5 py-5 sm:px-8 lg:px-12">
          <header className="flex items-center">
            <Link href="/" className="flex items-center gap-3" aria-label="Burrow home">
              <Image
                src="/icons/burrow-icon-64.png"
                alt=""
                width={44}
                height={44}
                className="rounded-lg border-2 border-[#082329] bg-[#f5d39c] shadow-[2px_2px_0_#082329]"
              />
              <span className="text-xl font-black tracking-normal">Burrow</span>
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,0.9fr)] lg:py-8">
            <div className="w-full max-w-[21rem] sm:max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b5538]">Parents set the topic</p>
              <h1 className="mt-4 text-[clamp(3.25rem,10vw,7.5rem)] font-black leading-[0.9] tracking-normal text-[#321e16]">
                Burrow
              </h1>
              <p className="mt-5 max-w-full text-xl font-bold leading-snug text-[#253f45] sm:max-w-xl sm:text-2xl">
                Pick your kid&apos;s current obsession. Burrow turns it into quick games that practice reading and math in context.
              </p>
              <div className="mt-8">
                <Link
                  href="/play"
                  className="inline-flex rounded-lg border-2 border-[#082329] bg-[#f3c647] px-5 py-3 text-base font-black text-[#102f36] shadow-[3px_3px_0_#082329] transition hover:-translate-y-0.5 hover:bg-[#ffd85f]"
                >
                  Play Burrow
                </Link>
              </div>
              <div className="mt-8 grid max-w-[21rem] grid-cols-2 gap-2 lg:hidden">
                {gameModes.map((mode) => (
                  <div key={mode.label} className="rounded-lg border-2 border-[#d5bea0] bg-[#fffaf4]/90 px-3 py-2">
                    <p className="text-sm font-black leading-tight text-[#102f36]">{mode.label}</p>
                    <p className="text-[11px] font-bold leading-tight text-[#5b4438]">{mode.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden min-h-[27rem] lg:block" aria-hidden="true">
              <div className="absolute left-6 top-0 h-24 w-24 rounded-full bg-[#fff8db]" />
              <div className="absolute bottom-4 right-4 h-[21rem] w-[21rem] rounded-full bg-[#2b1711]" />
              <div className="absolute bottom-16 right-16 h-64 w-64 rounded-full bg-[#0f0f0f]" />
              <div className="absolute bottom-28 right-28 h-36 w-36 rounded-full bg-[#f3c647]" />
              <div className="absolute bottom-36 right-36 h-20 w-20 rounded-full bg-[#0f0f0f]" />
              <Image
                src="/icons/burrow-icon-180.png"
                alt=""
                width={132}
                height={132}
                className="absolute bottom-44 right-40 rounded-lg border-2 border-[#082329] bg-[#f5d39c] shadow-[3px_3px_0_#082329]"
              />
              <div className="absolute left-0 top-12 w-[27rem] rounded-lg border-2 border-[#082329] bg-[#fffaf4] p-4 shadow-[5px_5px_0_#082329]">
                <div className="flex items-center justify-between gap-4 border-b-2 border-[#e3c899] pb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9b5538]">Topic pack</p>
                    <p className="text-2xl font-black leading-tight text-[#321e16]">Solar system</p>
                  </div>
                  <p className="rounded-lg border-2 border-[#082329] bg-[#e5f6e9] px-3 py-2 text-xs font-black text-[#305a3a]">
                    Level 2
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {gameModes.map((mode) => (
                    <div key={mode.label} className="rounded-lg border-2 border-[#d5bea0] bg-white px-3 py-2">
                      <p className="text-sm font-black leading-tight text-[#102f36]">{mode.label}</p>
                      <p className="mt-1 text-xs font-bold text-[#5b4438]">{mode.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border-2 border-[#082329] bg-[#f3c647] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#81533b]">Sample question</p>
                  <p className="mt-1 text-lg font-black leading-tight text-[#102f36]">Which planet has the most moons?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

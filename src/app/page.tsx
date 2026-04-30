import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const previewImages = [
    { src: "/burrow-assets/sharks/whale-shark.jpg", alt: "Whale shark" },
    { src: "/burrow-assets/buildings/one-wtc.jpg", alt: "One World Trade Center" },
    { src: "/burrow-assets/peppers/carolina-reaper.jpg", alt: "Carolina Reaper pepper" },
  ];

  return (
    <main className="min-h-screen min-h-dvh bg-[#f7fbf7] text-[#102f36]">
      <section className="relative flex min-h-screen min-h-dvh overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3">
          {previewImages.map((image, index) => (
            <div key={image.src} className="relative min-h-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="34vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,251,247,.98)_0%,rgba(247,251,247,.9)_42%,rgba(247,251,247,.42)_72%,rgba(247,251,247,.1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(16,47,54,.16),transparent_42%)]" />

        <div className="relative z-10 flex w-full flex-col px-5 py-5 sm:px-8 lg:px-12">
          <header className="flex items-center">
            <Link href="/" className="flex items-center gap-3" aria-label="Burrow home">
              <Image
                src="/icons/burrow-icon-64.png"
                alt=""
                width={44}
                height={44}
                className="rounded-xl border-2 border-[#082329] bg-[#f5d39c] shadow-[2px_2px_0_#082329]"
              />
              <span className="text-xl font-black tracking-normal">Burrow</span>
            </Link>
          </header>

          <div className="flex flex-1 items-center">
            <div className="w-full max-w-[20rem] py-16 sm:max-w-2xl sm:py-20">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b5538]">Parents set the topic</p>
            <h1 className="mt-4 text-[clamp(3rem,10vw,7.5rem)] font-black leading-[0.9] tracking-normal text-[#321e16]">
              Burrow
            </h1>
            <p className="mt-5 max-w-full text-xl font-bold leading-snug text-[#253f45] sm:max-w-xl sm:text-2xl">
              Pick your kid&apos;s current obsession. Burrow turns it into quick games that help them go deeper.
            </p>
            <div className="mt-8">
              <Link
                href="/play"
                className="rounded-lg border-2 border-[#082329] bg-[#f3c647] px-5 py-3 text-base font-black text-[#102f36] shadow-[3px_3px_0_#082329] transition hover:-translate-y-0.5 hover:bg-[#ffd85f]"
              >
                Play Burrow
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

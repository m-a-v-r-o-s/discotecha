import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import LineupLedger from "@/components/LineupLedger";
import { TIERS } from "@/lib/tiers";

const RULES = [
  {
    head: "Twenty-one and over",
    body: "ID at the door, every night, no exceptions. If you look like you're having a great year, bring proof of it.",
  },
  {
    head: "Phones stay down on the floor",
    body: "Shoot the bar, shoot your friends, shoot the ceiling. Not the floor and not the booth. Cameras go in the pocket past the curtain.",
  },
  {
    head: "You'll find the door on the map",
    body: "We're easy enough to find. Getting past the door is the part that takes a name: a table or a confirmed reservation.",
  },
  {
    head: "The room decides",
    body: "Right of admission reserved. A confirmed reservation is an invitation, not a contract.",
  },
];

const ROOM = [
  { src: "/images/neon-stairs.png", alt: "The stairs down into the club, lit in red" },
  { src: "/images/red-sun.png", alt: "A dancer silhouetted against a red light disc" },
  { src: "/images/red-bar.png", alt: "Bar stools against a red-lit wall" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* ── Manifesto ─────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-[1400px] gap-14 px-6 py-24 md:grid-cols-2 md:items-center md:gap-20 md:px-10 md:py-36">
          <Reveal>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/images/window-couple.png"
                alt="Two people in a shuttered window in the Cyclades"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="plate object-cover"
                priority
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="mb-7 text-[9px] font-semibold uppercase tracking-door text-signal">
              Since the first summer
            </p>
            <h2 className="mb-8 text-[30px] font-extrabold uppercase leading-[0.95] tracking-tightest text-bone md:text-[46px]">
              A small room,
              <br />
              a loud sound system,
              <br />
              and a door that means it.
            </h2>
            <div className="max-w-md space-y-5 text-[14px] leading-relaxed text-bone/60">
              <p>
                Discotecha holds a few hundred people, three nights a week, from the end of June
                until the island empties out. The floor is the point. Everything else (the bar, the
                booths) exists to keep the floor moving.
              </p>
              <p>
                We book residents and we book friends. We don&apos;t book anyone who&apos;d rather be
                filmed than heard.
              </p>
            </div>
            <Link
              href="#lineup"
              className="mt-9 inline-block border-b border-signal pb-1 text-[10px] font-semibold uppercase tracking-door text-signal"
            >
              See who&apos;s playing
            </Link>
          </Reveal>
        </section>

        {/* ── Line up ───────────────────────────────────────────── */}
        <section id="lineup" className="scroll-mt-24 border-t border-bone/10 bg-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
            <Reveal>
              <div className="mb-14 flex items-end justify-between">
                <div>
                  <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
                    Discotecha sounds
                  </p>
                  <h2 className="text-[40px] font-extrabold uppercase leading-none tracking-tightest text-signal md:text-[64px]">
                    Line up
                  </h2>
                </div>
                <p className="hidden text-right text-[10px] uppercase tracking-[0.16em] text-ash sm:block">
                  Summer 2026
                  <br />
                  Fri · Sat · Sun
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <LineupLedger />
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-12 text-[10px] uppercase tracking-[0.16em] text-ash">
                Pick a night to reserve. Doors 23:30.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Tables ────────────────────────────────────────────── */}
        <section className="border-t border-bone/10">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
            <Reveal>
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
                Tables
              </p>
              <h2 className="mb-14 max-w-2xl text-[30px] font-extrabold uppercase leading-[0.95] tracking-tightest text-bone md:text-[46px]">
                Four ways to hold a spot in the room.
              </h2>
            </Reveal>

            <div className="grid gap-px bg-bone/10 md:grid-cols-3">
              {TIERS.map((t, i) => (
                <Reveal key={t.id} delay={i * 90}>
                  <div className="group h-full bg-ink p-8 transition-colors duration-500 hover:bg-pitch md:p-10">
                    <div className="mb-6 flex items-baseline justify-between">
                      <h3 className="text-[20px] font-extrabold uppercase tracking-tightest text-bone transition-colors duration-300 group-hover:text-signal md:text-[26px]">
                        {t.name}
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-ash">
                        {t.seats} guests
                      </span>
                    </div>

                    <p className="mb-8 max-w-sm text-[13px] leading-relaxed text-bone/55">{t.blurb}</p>

                    <div className="flex items-end justify-between border-t border-bone/10 pt-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-door text-ash">Minimum spend</p>
                        <p className="text-[15px] font-semibold text-bone">TBD</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-door text-ash">Deposit now</p>
                        <p className="text-[15px] font-semibold text-signal">TBD</p>
                      </div>
                    </div>

                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Link
                  href="/reserve"
                  className="border border-signal bg-signal px-8 py-4 text-center text-[11px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-signal"
                >
                  Reserve a table
                </Link>
                <Link
                  href="/reserve?kind=guestlist"
                  className="border border-bone/25 px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-door text-bone transition-colors duration-300 hover:border-bone"
                >
                  Or ask for the guest list
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Door policy ───────────────────────────────────────── */}
        <section id="rules" className="scroll-mt-24 border-t border-bone/10 bg-pitch">
          <div className="mx-auto grid max-w-[1400px] gap-16 px-6 py-24 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-32">
            <Reveal>
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
                Read before you come
              </p>
              <h2 className="text-[34px] font-extrabold uppercase leading-[0.92] tracking-tightest text-bone md:text-[52px]">
                Door
                <br />
                policy
              </h2>
              <p className="mt-8 max-w-xs text-[13px] leading-relaxed text-bone/50">
                Four rules. They are the reason the room feels the way it does.
              </p>
            </Reveal>

            <div>
              {RULES.map((r, i) => (
                <Reveal key={r.head} delay={i * 90}>
                  <div className="flex gap-6 border-b border-bone/10 py-7 first:pt-0">
                    <span className="mt-1 shrink-0 text-[10px] font-semibold tabular-nums tracking-door text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="mb-2 text-[15px] font-extrabold uppercase tracking-[0.04em] text-bone md:text-[18px]">
                        {r.head}
                      </h3>
                      <p className="max-w-lg text-[13px] leading-relaxed text-bone/55">{r.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── The room ──────────────────────────────────────────── */}
        <section id="room" className="scroll-mt-24 border-t border-bone/10">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
            <Reveal>
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
                The room
              </p>
              <h2 className="mb-14 text-[30px] font-extrabold uppercase leading-none tracking-tightest text-bone md:text-[46px]">
                Less talking, more dancing.
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {ROOM.map((img, i) => (
                <Reveal key={img.src} delay={i * 70}>
                  <div
                    className={`group relative overflow-hidden ${
                      i % 5 === 0 ? "aspect-[3/4]" : "aspect-square"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="plate object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 group-hover:[filter:none]"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-t border-bone/10">
          <Image
            src="/images/wordmark-gradient.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40"
            aria-hidden
          />
          <div className="absolute inset-0 bg-ink/50" aria-hidden />
          <div className="relative mx-auto max-w-[1400px] px-6 py-28 text-center md:px-10 md:py-40">
            <Reveal>
              <h2 className="mx-auto max-w-3xl text-[32px] font-extrabold uppercase leading-[0.95] tracking-tightest text-bone md:text-[58px]">
                You know where the door is.
                <br />
                Getting past it is the reservation.
              </h2>
              <Link
                href="/reserve"
                className="mt-10 inline-block border border-bone bg-bone px-10 py-4 text-[11px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-bone"
              >
                Reserve
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

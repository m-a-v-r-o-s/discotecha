import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import LineupLedger from "@/components/LineupLedger";
import LightRays from "@/components/LightRays";
import { TIERS } from "@/lib/tiers";

const RULES = [
  {
    head: "Twenty-one and over",
    body: "ID at the door, every night, no exceptions. If you look like you’re having a great year, bring proof of it.",
  },
  {
    head: "Phones stay down on the floor",
    body: "Shoot the bar, shoot your friends, shoot the ceiling. Not the floor and not the booth. Cameras go in the pocket past the curtain.",
  },
  {
    head: "You’ll find the door on the map",
    body: "We’re easy enough to find. Getting past the door is the part that takes a name: a table or a confirmed reservation.",
  },
  {
    head: "The room decides",
    body: "Right of admission reserved. A confirmed reservation is an invitation, not a contract.",
  },
];

/* The contact sheet is hung, not gridded: each frame carries its own crop and
   its own drop, so the bottom edge stays ragged on purpose. */
const ROOM = [
  {
    src: "/images/neon-steps.webp",
    alt: "Red neon strips over the steps down to the floor",
    shape: "aspect-[3/4]",
    drop: "",
  },
  {
    src: "/images/red-floor.webp",
    alt: "Hands up in the red haze of the dance floor",
    shape: "aspect-square",
    drop: "mt-6 md:mt-16",
  },
  {
    src: "/images/neon-bar.webp",
    alt: "Neon tubes burning red behind the bar",
    shape: "aspect-[4/5]",
    drop: "md:mt-7",
  },
];

/* Type set to the size of the room you are taking: the panels widen and the
   names grow from the booth on the edge to the table in the middle of it. */
const TIER_SCALE = ["md:text-[26px]", "md:text-[30px]", "md:text-[36px]"];

export default function Home() {
  return (
    <>
      <LightRays />
      <Header />
      <main>
        <Hero />

        {/* ── Manifesto ─────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-[1400px] gap-14 px-6 py-24 md:grid-cols-2 md:items-center md:gap-20 md:px-10 md:py-36">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src="/images/red-window.webp"
              alt="A red-shuttered window in a whitewashed island wall"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="plate object-cover"
              priority
            />
          </div>

          <Reveal>
            <h2 className="mb-8 text-[30px] font-extrabold uppercase leading-[0.95] tracking-tightest text-bone md:text-[46px]">
              A small room,
              <br />
              a loud sound system,
              <br />
              and a door that means it.
            </h2>
            <div className="max-w-md space-y-5 text-[14px] leading-relaxed text-bone/60">
              <p>
                Nocturne holds a few hundred people, three nights a week, from the end of June
                until the island empties out. The floor is the point. Everything else (the bar, the
                booths) exists to keep the floor moving.
              </p>
              <p>
                We book residents and we book friends. We don’t book anyone who’d rather be
                filmed than heard.
              </p>
            </div>
            <Link
              href="#lineup"
              className="mt-9 inline-block whitespace-nowrap border-b border-signal pb-1 text-[10px] font-semibold uppercase tracking-door text-signal"
            >
              See who’s playing
            </Link>
          </Reveal>
        </section>

        {/* ── Line up ───────────────────────────────────────────── */}
        <section id="lineup" className="scroll-mt-24 border-t border-bone/10 bg-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-28">
            <Reveal>
              <div className="mb-14 flex items-end justify-between gap-6">
                <h2 className="text-[40px] font-extrabold uppercase leading-none tracking-tightest text-signal md:text-[64px]">
                  Line up
                </h2>
                <p className="hidden shrink-0 text-right text-[10px] uppercase tracking-[0.16em] text-ash sm:block">
                  Summer 2026
                  <br />
                  Fri · Sat · Sun
                </p>
              </div>

              <LineupLedger />

              <p className="mt-12 text-[10px] uppercase tracking-[0.16em] text-ash">
                Pick a night to reserve. Doors 23:30.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Tables ────────────────────────────────────────────── */}
        <section className="border-t border-bone/10">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-40">
            <Reveal>
              <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <h2 className="max-w-2xl text-[30px] font-extrabold uppercase leading-[0.95] tracking-tightest text-bone md:text-[46px]">
                  Three tables,
                  <br />
                  or a name on the list.
                </h2>
                <p className="shrink-0 text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ash md:text-right">
                  Deposit holds it
                  <br />
                  Released at 01:00
                </p>
              </div>
            </Reveal>

            <div className="grid gap-px bg-bone/10 md:grid-cols-[0.85fr_1fr_1.3fr]">
              {TIERS.map((t, i) => (
                <div
                  key={t.id}
                  className="group h-full bg-ink p-8 transition-colors duration-500 hover:bg-pitch md:p-10"
                >
                  <div className="mb-6 flex items-baseline justify-between gap-4">
                    <h3
                      className={`text-[20px] font-extrabold uppercase leading-none tracking-tightest text-bone transition-colors duration-300 group-hover:text-signal ${TIER_SCALE[i]}`}
                    >
                      {t.name}
                    </h3>
                    <span className="shrink-0 text-[10px] uppercase tabular-nums tracking-[0.16em] text-ash">
                      {t.seats} guests
                    </span>
                  </div>

                  <p className="mb-8 max-w-sm text-[13px] leading-relaxed text-bone/60">{t.blurb}</p>

                  <div className="flex items-end justify-between gap-4 border-t border-bone/10 pt-5">
                    <div>
                      <p className="text-[9px] uppercase tracking-door text-ash">Minimum spend</p>
                      <p className="text-[15px] font-semibold tabular-nums text-bone">TBD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-door text-ash">Deposit now</p>
                      <p className="text-[15px] font-semibold tabular-nums text-signal">TBD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link
                href="/reserve"
                className="whitespace-nowrap border border-signal bg-signal px-8 py-4 text-center text-[11px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-signal"
              >
                Reserve a table
              </Link>
              <Link
                href="/reserve?kind=guestlist"
                className="whitespace-nowrap border border-bone/25 px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-door text-bone transition-colors duration-300 hover:border-bone"
              >
                Ask for the guest list
              </Link>
            </div>
          </div>
        </section>

        {/* ── Door policy ───────────────────────────────────────── */}
        <section id="rules" className="scroll-mt-24 border-t border-bone/10 bg-pitch">
          <div className="mx-auto grid max-w-[1400px] gap-16 px-6 py-24 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-28">
            <div>
              <h2 className="text-[34px] font-extrabold uppercase leading-[0.92] tracking-tightest text-bone md:text-[52px]">
                Door
                <br />
                policy
              </h2>
              <p className="mt-8 max-w-xs text-[13px] leading-relaxed text-bone/60">
                Four rules. They are the reason the room feels the way it does.
              </p>
            </div>

            <div>
              {RULES.map((r, i) => (
                <div key={r.head} className="flex gap-6 border-b border-bone/10 py-7 first:pt-0">
                  <span className="mt-1 shrink-0 text-[10px] font-semibold tabular-nums tracking-door text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="mb-2 text-[15px] font-extrabold uppercase tracking-[0.04em] text-bone md:text-[18px]">
                      {r.head}
                    </h3>
                    <p className="max-w-lg text-[13px] leading-relaxed text-bone/60">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The room ──────────────────────────────────────────── */}
        <section id="room" className="scroll-mt-24 border-t border-bone/10">
          <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
            <Reveal>
              <h2 className="mb-14 text-[30px] font-extrabold uppercase leading-none tracking-tightest text-bone md:text-[46px]">
                Less talking, more dancing.
              </h2>

              <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-3 md:gap-5">
                {ROOM.map((img) => (
                  <div
                    key={img.src}
                    className={`group relative overflow-hidden ${img.shape} ${img.drop}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="plate object-cover group-hover:[filter:none]"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Closing ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-t border-bone/10 bg-pitch">
          <div
            className="absolute inset-0 bg-[url('/images/press-crowd.webp')] bg-cover bg-center"
            aria-hidden
          />
          <div className="absolute inset-0 bg-ink/70" aria-hidden />
          <div className="relative mx-auto max-w-[1400px] px-6 py-28 text-center md:px-10 md:py-40">
            <Reveal>
              <h2 className="mx-auto max-w-3xl text-[32px] font-extrabold uppercase leading-[0.95] tracking-tightest text-bone md:text-[58px]">
                You know where the door is.
                <br />
                Getting past it is the reservation.
              </h2>
              <Link
                href="/reserve"
                className="mt-10 inline-block whitespace-nowrap border border-bone bg-bone px-10 py-4 text-[11px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-bone"
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

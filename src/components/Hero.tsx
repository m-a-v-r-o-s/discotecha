"use client";

import Link from "next/link";
import Ticker from "./Ticker";
import Globe3D from "./Globe3D";
import { upcomingEvents, formatDate } from "@/lib/events";

const KICKER = "Members & guests only · 21+";

export default function Hero() {
  const next = upcomingEvents()[0];

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/* Two crops of the same 35mm frame: a 16:9 band for desktop, and a 2:3
          crop centred on the dancing figure for portrait viewports. */}
      <div
        className="absolute inset-0 bg-[url('/images/crowd.webp')] bg-cover bg-center md:bg-[url('/images/crowd-wide.webp')]"
        aria-hidden
      />
      {/* This frame is busy edge to edge, with no dark field of its own, so the
          scrim has to build the type's field: heavy left, easing off to the
          right where the crowd stays legible. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/35" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/55" aria-hidden />
      {/* Portrait crop puts the crowd directly behind the type, so below md it
          needs a flat extra stop that desktop doesn't. */}
      <div className="absolute inset-0 bg-ink/45 md:hidden" aria-hidden />

      <div className="relative z-40 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 pb-14 md:px-10 md:pb-12">
        {/* The mirror ball hangs from the ceiling on a cable that starts at the
            very top of the page: the container carries no top padding, and the
            ball is the first thing in it. Kept in flow rather than absolute,
            because on a short laptop an absolute ball punches straight through
            the headline, whereas in flow the stack below simply moves down.
            At lg the box is the header logo's own width, so centring inside it
            drops the ball on the logo's centre line. Only the cable is inert.
            The ball itself has to stay grabbable. */}
        <div
          className="flex w-full animate-rise flex-col items-center opacity-0 lg:w-44"
          style={{ animationDelay: "200ms" }}
        >
          {/* Cable length is the ball's drop. It lengthens only when the
              viewport is tall enough to spend the pixels; on a short laptop
              the whole stack is already fighting for room. */}
          <span
            className="pointer-events-none h-32 w-px bg-bone/20 lg:h-12 lg:[@media(min-height:860px)]:h-28"
            aria-hidden
          />
          <Globe3D className="h-40 w-40 lg:h-28 lg:w-28 xl:h-36 xl:w-36" />
        </div>

        {/* Everything else sinks to the floor of the frame */}
        <div className="flex-1" />

        {/* The kicker belongs with the headline, in the black column. The
            top-right corner is where the light shaft blows out. */}
        <p
          className="mb-6 mt-6 animate-rise text-center text-[10px] font-semibold uppercase tracking-door text-signal opacity-0 md:text-left"
          style={{ animationDelay: "120ms" }}
        >
          {KICKER}
        </p>

        <h1
          className="animate-rise text-center text-[clamp(40px,8.5vw,96px)] font-extrabold uppercase leading-[0.9] tracking-tightest text-bone opacity-0 md:max-w-5xl md:text-left"
          style={{ animationDelay: "240ms" }}
        >
          Whatever
          <br className="hidden md:inline" /> the night asks,
          <br />
          the <span className="text-signal">floor</span> answers.
        </h1>

        <div
          className="mt-10 flex animate-rise flex-col items-center gap-7 border-t border-bone/15 pt-7 text-center opacity-0 md:mt-8 md:flex-row md:items-end md:justify-between md:text-left"
          style={{ animationDelay: "400ms" }}
        >
          <p className="max-w-sm text-[11px] font-medium uppercase leading-relaxed tracking-[0.16em] text-bone/60">
            A private club on Ios. Twenty-one and over. No list, no entry. Find us on the
            map, the door does the rest.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center md:gap-7">
            {next && (
              <span className="text-[10px] font-semibold uppercase tabular-nums tracking-door text-bone/65">
                Next · {formatDate(next.date).long} ·{" "}
                <span className="text-bone">{next.artists}</span>
              </span>
            )}
            <Link
              href="/reserve"
              className="whitespace-nowrap border border-signal bg-signal px-10 py-4 text-[11px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-signal"
            >
              Reserve
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Ticker />
      </div>
    </section>
  );
}

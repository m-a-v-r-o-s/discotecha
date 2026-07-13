"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Ticker from "./Ticker";
import Globe3D from "./Globe3D";
import { upcomingEvents, formatDate } from "@/lib/events";

export default function Hero() {
  const plate = useRef<HTMLDivElement>(null);
  const next = upcomingEvents()[0];

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -30;
        const y = (e.clientY / window.innerHeight - 0.5) * -22;
        el.style.transform = `scale(1.1) translate3d(${x}px, ${y}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      <div
        ref={plate}
        className="absolute inset-0 scale-110 bg-cover bg-center transition-transform duration-[900ms] ease-out"
        style={{ backgroundImage: "url(/images/eye.webp)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/70" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pb-14 pt-28 md:justify-between md:px-10 md:pb-20 md:pt-32">
        {/* On mobile the ball is the centrepiece; on desktop it rides the top-right eyebrow */}
        <div
          className="flex animate-rise items-center justify-center gap-6 opacity-0 md:justify-between"
          style={{ animationDelay: "80ms" }}
        >
          <span className="hidden text-[10px] font-semibold uppercase tracking-door text-signal md:block">
            Members &amp; guests only · 21+
          </span>
          <Globe3D className="h-40 w-40 shrink-0 md:h-32 md:w-32 lg:h-40 lg:w-40" />
        </div>

        <h1
          className="mt-9 max-w-3xl animate-rise text-center text-[34px] font-extrabold uppercase leading-[0.92] tracking-tightest text-bone opacity-0 sm:text-[52px] md:mt-0 md:text-left md:text-[74px]"
          style={{ animationDelay: "160ms" }}
        >
          No matter the question,
          <br />
          <span className="text-signal">Paros</span> is always the answer.
        </h1>

        <div
          className="mt-10 flex animate-rise flex-col items-center gap-6 text-center opacity-0 md:mt-0 md:flex-row md:items-end md:justify-between md:text-left"
          style={{ animationDelay: "320ms" }}
        >
          <p className="mx-auto max-w-sm text-[11px] font-medium uppercase leading-relaxed tracking-[0.16em] text-bone/60 md:mx-0">
            A private club on Paros. Twenty-one and over. No list, no entry. Find us on the
            map, the door does the rest.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            {next && (
              <span className="text-[10px] font-semibold uppercase tracking-door text-bone/50">
                Next · {formatDate(next.date).long} · <span className="text-bone">{next.artists}</span>
              </span>
            )}
            <Link
              href="/reserve"
              className="border border-signal bg-signal px-8 py-4 text-[11px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-signal"
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

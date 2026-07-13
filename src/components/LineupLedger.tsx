"use client";

import Link from "next/link";
import { useState } from "react";
import { EVENTS, formatDate, type ClubEvent } from "@/lib/events";

/**
 * Rows alternate their indent and the rule fills whatever gap is left,
 * the same device as the printed line-up poster. The offsets are not
 * random: they cycle so the page reads as a ledger, not a list.
 */
const OFFSETS = ["ml-0", "ml-[14%]", "ml-[6%]", "ml-[22%]", "ml-[2%]", "ml-[16%]"];

export default function LineupLedger({ events = EVENTS }: { events?: ClubEvent[] }) {
  const [hot, setHot] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-[3px]">
      {events.map((e, i) => {
        const d = formatDate(e.date);
        const past = e.date < today;
        const active = hot === e.date;

        return (
          <Link
            key={e.date}
            href={past ? "#lineup" : `/reserve?date=${e.date}`}
            onMouseEnter={() => setHot(e.date)}
            onMouseLeave={() => setHot(null)}
            aria-disabled={past}
            tabIndex={past ? -1 : 0}
            className={`group flex items-center gap-4 py-3 transition-colors duration-300 ${
              OFFSETS[i % OFFSETS.length]
            } ${past ? "pointer-events-none opacity-25" : ""} ${
              active ? "text-signal" : "text-bone"
            }`}
          >
            <span className="flex shrink-0 items-baseline gap-2 md:gap-3">
              <span className="text-[15px] font-extrabold uppercase leading-none tracking-tightest md:text-[26px]">
                {e.artists}
              </span>
              {e.tag && (
                <span className="hidden text-[9px] font-semibold uppercase tracking-door text-signal sm:inline">
                  {e.tag}
                </span>
              )}
            </span>

            <span className="leader" aria-hidden />

            <span className="flex shrink-0 items-center gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-current md:text-[12px]">
                {d.day} {d.short}
              </span>
              <span
                className={`hidden w-[86px] text-right text-[9px] font-semibold uppercase tracking-door transition-opacity duration-300 md:inline ${
                  active && !past ? "text-signal opacity-100" : "opacity-0"
                }`}
              >
                Reserve →
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

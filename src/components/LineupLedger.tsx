import Link from "next/link";
import { EVENTS, formatDate, type ClubEvent } from "@/lib/events";

/**
 * Rows alternate their indent and the rule fills whatever gap is left,
 * the same device as the printed line-up poster. The offsets are not
 * random: they cycle so the page reads as a ledger, not a list.
 */
const OFFSETS = ["ml-0", "ml-[14%]", "ml-[6%]", "ml-[22%]", "ml-[2%]", "ml-[16%]"];

/**
 * Hover and focus are carried by CSS group state rather than React state: a
 * pointer-only `onMouseEnter` left keyboard users with no way to see which
 * row they were on, and re-rendered the whole season on every mouse move.
 * The leader rule is a desktop device. On a phone a long booking (three
 * names and an ampersand) needs the width the rule was eating.
 */
export default function LineupLedger({ events = EVENTS }: { events?: ClubEvent[] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-[3px]">
      {events.map((e, i) => {
        const d = formatDate(e.date);
        const past = e.date < today;
        const indent = OFFSETS[i % OFFSETS.length];

        const row = (
          <>
            <span className="flex min-w-0 items-baseline gap-2 md:gap-3">
              <span className="text-[15px] font-extrabold uppercase leading-tight tracking-tightest [overflow-wrap:anywhere] md:text-[26px]">
                {e.artists}
              </span>
              {e.tag && (
                <span className="hidden shrink-0 text-[9px] font-semibold uppercase tracking-door text-signal sm:inline">
                  {e.tag}
                </span>
              )}
            </span>

            <span className="leader hidden sm:block" aria-hidden />

            <span className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
              <span className="text-[10px] font-medium uppercase tabular-nums tracking-[0.18em] text-current md:text-[12px]">
                {d.day} {d.short}
              </span>
              {!past && (
                <span
                  aria-hidden
                  className="hidden w-[86px] text-right text-[9px] font-semibold uppercase tracking-door opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:inline"
                >
                  Reserve →
                </span>
              )}
            </span>
          </>
        );

        // A night that has been and gone is a record, not a destination, so it
        // is rendered as one instead of a link that refuses to be clicked.
        if (past) {
          return (
            <p key={e.date} className={`flex items-center gap-4 py-3 text-bone/35 ${indent}`}>
              {row}
            </p>
          );
        }

        return (
          <Link
            key={e.date}
            href={`/reserve?date=${e.date}`}
            className={`group flex items-center gap-4 py-3 text-bone transition-colors duration-300 hover:text-signal focus-visible:text-signal ${indent}`}
          >
            {row}
          </Link>
        );
      })}
    </div>
  );
}

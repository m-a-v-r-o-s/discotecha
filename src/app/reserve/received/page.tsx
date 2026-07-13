import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/events";

export const metadata: Metadata = { title: "Reservation" };
export const dynamic = "force-dynamic";

export default async function ReceivedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; paid?: string }>;
}) {
  const reference = (await searchParams).ref ?? "";
  const reservation = reference
    ? await prisma.reservation.findUnique({ where: { reference } })
    : null;

  if (!reservation) {
    return (
      <>
        <Header />
        <main className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col justify-center px-6 pt-36 md:px-10">
          <h1 className="mb-5 text-[32px] font-extrabold uppercase tracking-tightest text-bone md:text-[48px]">
            No reservation under that reference.
          </h1>
          <p className="mb-9 max-w-md text-[13px] leading-relaxed text-bone/55">
            Check the link in your confirmation, or start again.
          </p>
          <Link
            href="/reserve"
            className="w-fit border border-signal px-8 py-4 text-[11px] font-extrabold uppercase tracking-door text-signal transition-colors hover:bg-signal hover:text-ink"
          >
            Start again
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const isTable = reservation.kind === "TABLE";
  const confirmed = reservation.status === "CONFIRMED";
  const d = formatDate(reservation.eventDate);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <div className="max-w-2xl">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
            {confirmed ? "You're in" : "Received"}
          </p>
          <h1 className="mb-7 text-[38px] font-extrabold uppercase leading-[0.9] tracking-tightest text-bone md:text-[64px]">
            {confirmed ? "The table is held." : "We have your name."}
          </h1>
          <p className="mb-14 max-w-md text-[13px] leading-relaxed text-bone/55">
            {confirmed
              ? "The address and the door instructions are on their way to your phone. Bring ID."
              : isTable
                ? "As soon as the deposit clears we'll confirm and send you the address."
                : "Guest list is decided closer to the night. We'll message you either way, usually the same day."}
          </p>

          <dl className="grid gap-px border border-bone/15 bg-bone/15 sm:grid-cols-2">
            {[
              ["Reference", reservation.reference],
              ["Night", `${d.long} · ${reservation.eventName}`],
              ["Name", reservation.name],
              ["Party", `${reservation.guests}`],
              ...(isTable
                ? ([
                    ["Table", reservation.tierId?.toUpperCase() ?? "Not set"],
                    ["Minimum spend", "TBD"],
                    ["Deposit", "TBD"],
                  ] as [string, string][])
                : []),
              ["Status", reservation.status],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-6">
                <dt className="mb-2 text-[9px] uppercase tracking-door text-ash">{k}</dt>
                <dd className="text-[14px] font-semibold uppercase tracking-[0.04em] text-bone">
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-[10px] uppercase tracking-[0.14em] text-ash">
            Give the reference at the door. Screenshot it, the signal is bad down there.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://wa.me/306942601351"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-bone/25 px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-door text-bone transition-colors hover:border-signal hover:text-signal"
            >
              Message the door
            </a>
            <Link
              href="/"
              className="border border-bone/25 px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-door text-bone transition-colors hover:border-bone"
            >
              Back to the room
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

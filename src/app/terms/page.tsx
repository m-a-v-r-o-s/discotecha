import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms behind a Nocturne reservation: age policy, deposits and refunds, guest list, door conduct, and admission.",
  openGraph: {
    title: "Terms of service · Nocturne",
    description: "The terms behind a Nocturne reservation, deposit, and admission.",
    type: "website",
    url: "/terms",
  },
};

const SECTIONS = [
  {
    head: "Age and admission",
    body: [
      "Nocturne is 21 and over, every night, no exceptions. ID is checked at the door. A confirmed reservation gets you to the front of that conversation, not past it.",
      "Right of admission is reserved. A confirmed reservation is an invitation, not a contract guaranteeing entry regardless of conduct or capacity on the night.",
    ],
  },
  {
    head: "Tables and deposits",
    body: [
      "A table reservation is held on a deposit, charged through Stripe when you book. The deposit is credited against the table's minimum spend on the night, not charged on top of it.",
      "Cancel more than 48 hours before the night and the deposit is refunded. Cancel later, or don't show, and it's forfeited: the table was held for you and turned other requests away.",
      "Tables are held until 01:00. After that, an unclaimed table is released and the deposit is treated as a late cancellation.",
    ],
  },
  {
    head: "Guest list",
    body: [
      "A guest list request is exactly that: a request, not a booking. We reply to every one, usually the same day, and confirming it is at our discretion based on the night's numbers.",
    ],
  },
  {
    head: "House rules",
    body: [
      "Twenty-one and over, ID every time.",
      "Phones stay down on the dance floor. Shoot the bar, the ceiling, your friends; not the floor, not the booth.",
      "The address is sent with your confirmation, not published in advance.",
      "The room decides. Staff may refuse or remove anyone for reasons of safety, capacity, or conduct.",
    ],
  },
  {
    head: "Liability",
    body: [
      "Nocturne is not liable for indirect or consequential loss arising from a cancelled, changed, or refused reservation, to the extent permitted by law. Nothing here limits liability that cannot be excluded under Greek or EU consumer law.",
    ],
  },
  {
    head: "Changes and law",
    body: [
      "These terms may be updated between seasons; the version in force is the one posted here. They're governed by the laws of Greece, without prejudice to any mandatory consumer protections in your own country of residence.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
            The small print
          </p>
          <h1 className="mb-6 text-[38px] font-extrabold uppercase leading-[0.9] tracking-tightest text-bone md:text-[64px]">
            Terms of
            <br />
            service
          </h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-bone/55">
            These are the terms a reservation is made under. Reserving a table or joining the
            guest list means you've read and accepted them.
          </p>
        </div>

        <div className="mb-16 max-w-2xl border border-signal/40 bg-signal/[0.06] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-signal">
            Template, not legal advice
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-bone/60">
            This is a genuinely-intended draft, not a substitute for a lawyer. Have it reviewed
            against your actual policies and local consumer law before relying on it.
          </p>
        </div>

        <div className="space-y-14">
          {SECTIONS.map((s) => (
            <section key={s.head}>
              <h2 className="mb-4 text-[20px] font-extrabold uppercase tracking-tightest text-bone md:text-[26px]">
                {s.head}
              </h2>
              <div className="max-w-2xl space-y-3 text-[13px] leading-relaxed text-bone/55">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 max-w-2xl text-[11px] leading-relaxed text-ash">
          Questions about these terms? Call us on{" "}
          <a href="tel:+302286000000" className="text-bone underline underline-offset-2 hover:text-signal">
            +30 22860 00000
          </a>{" "}
          or ask at the door. Nocturne · Chora, Ios 840 01, Cyclades.
        </p>
      </main>
      <Footer />
    </>
  );
}

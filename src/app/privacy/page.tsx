import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Nocturne collects, uses and protects the data behind a reservation: what we hold, why, for how long, and your rights over it.",
  openGraph: {
    title: "Privacy policy · Nocturne",
    description: "What Nocturne holds on a reservation, why, and your rights over it.",
    type: "website",
    url: "/privacy",
  },
};

const SECTIONS = [
  {
    head: "What we collect",
    body: [
      "When you reserve a table or ask for the guest list: your name, email, phone, party size, and, if you give it, your Instagram handle and a note.",
      "When you take a table, Stripe processes your deposit. We receive that a payment cleared and its amount; we never see or store your card number.",
      "The age gate sets one cookie confirming you cleared it. It carries no date of birth, only a yes/no.",
    ],
  },
  {
    head: "Why we collect it",
    body: [
      "To hold a table, run the guest list, and get you and your deposit matched up at the door.",
      "To reach you if a night changes or your reservation needs a follow-up.",
      "With your consent, to understand how the site is used well enough to improve it. See the cookie policy for that part in full.",
    ],
  },
  {
    head: "Who it's shared with",
    body: [
      "Stripe, to process a table deposit. Their handling of your payment details is covered by Stripe's own privacy policy, not this one.",
      "Nobody else. We don't sell reservation data, and we don't hand guest lists to promoters or third parties.",
    ],
  },
  {
    head: "How long we keep it",
    body: [
      "Reservation records are kept for the season plus a reasonable window after, for accounting and in case a deposit needs resolving. After that they're deleted on request or on a routine cleanup.",
    ],
  },
  {
    head: "Your rights",
    body: [
      "Under the GDPR you can ask to see what we hold on you, have it corrected, have it deleted, or object to how it's used. You can also ask for it in a portable format, and you can complain to your national data protection authority if you think we've got it wrong.",
      "To exercise any of these, use the contact below. We'll respond within a reasonable time.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
            The small print
          </p>
          <h1 className="mb-6 text-[38px] font-extrabold uppercase leading-[0.9] tracking-tightest text-bone md:text-[64px]">
            Privacy
            <br />
            policy
          </h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-bone/55">
            Nocturne (Chora, Ios 840 01, Cyclades, Greece) is the data controller for the
            information below. This page covers what we hold on a reservation and your rights over
            it; cookies specifically are covered on their{" "}
            <a href="/cookies" className="text-bone underline underline-offset-2 hover:text-signal">
              own page
            </a>
            .
          </p>
        </div>

        <div className="mb-16 max-w-2xl border border-signal/40 bg-signal/[0.06] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-signal">
            Template, not legal advice
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-bone/60">
            This is a genuinely-intended draft, not a substitute for a lawyer. Have it reviewed
            against your actual data handling and local law before relying on it.
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
          Questions about your data, or want to exercise your rights above? Call us on{" "}
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

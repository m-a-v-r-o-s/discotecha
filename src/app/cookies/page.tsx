import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Cookie policy" };

const CATEGORIES = [
  {
    name: "Strictly necessary",
    always: true,
    body: "These keep the site working and cannot be switched off. They remember that you passed the age gate, carry your reservation through checkout, and protect the forms from abuse. No consent is required for these, and they store no marketing data.",
    items: [
      ["dsc_door", "Remembers you confirmed you are 21 or over.", "180 days"],
      ["dsc_cookie_consent", "Stores your cookie choices so we don't ask again.", "Local, until cleared"],
      ["Stripe", "Set on the checkout page to process your deposit securely.", "Session / per Stripe"],
    ],
  },
  {
    name: "Analytics",
    always: false,
    body: "Optional. With your consent we measure how the site is used — pages visited, rough device and country — in aggregate, so we can improve it. Off unless you opt in.",
    items: [],
  },
  {
    name: "Marketing",
    always: false,
    body: "Optional. With your consent we measure which campaigns bring people to the door. Off unless you opt in. We do not sell your data.",
    items: [],
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
            The small print
          </p>
          <h1 className="mb-6 text-[38px] font-extrabold uppercase leading-[0.9] tracking-tightest text-bone md:text-[64px]">
            Cookie
            <br />
            policy
          </h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-bone/55">
            Cookies are small files a site stores on your device. Under the GDPR and the ePrivacy
            rules we only set non-essential cookies after you agree to them. You choose from the
            banner at the bottom of the site, and you can change your mind any time by clearing this
            site&apos;s data in your browser, which brings the banner back.
          </p>
        </div>

        <div className="space-y-14">
          {CATEGORIES.map((c) => (
            <section key={c.name}>
              <div className="mb-4 flex items-baseline gap-4">
                <h2 className="text-[20px] font-extrabold uppercase tracking-tightest text-bone md:text-[26px]">
                  {c.name}
                </h2>
                <span className="text-[9px] font-semibold uppercase tracking-door text-signal">
                  {c.always ? "Always on" : "Optional · off by default"}
                </span>
              </div>
              <p className="max-w-2xl text-[13px] leading-relaxed text-bone/55">{c.body}</p>

              {c.items.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-bone/15 text-[9px] uppercase tracking-door text-ash">
                        <th className="py-3 pr-6 font-semibold">Name</th>
                        <th className="py-3 pr-6 font-semibold">Purpose</th>
                        <th className="py-3 font-semibold">Retention</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.items.map(([name, purpose, retention]) => (
                        <tr key={name} className="border-b border-bone/10 align-top">
                          <td className="py-3 pr-6 text-[12px] font-semibold uppercase tracking-[0.06em] text-bone">
                            {name}
                          </td>
                          <td className="py-3 pr-6 text-[12px] leading-relaxed text-bone/60">
                            {purpose}
                          </td>
                          <td className="py-3 text-[12px] text-bone/60">{retention}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        <p className="mt-16 max-w-2xl text-[11px] leading-relaxed text-ash">
          Questions about your data? Reach us on{" "}
          <a
            href="https://wa.me/306942601351"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone underline underline-offset-2 hover:text-signal"
          >
            WhatsApp
          </a>{" "}
          or by phone. Discotecha · Paros, Cyclades.
        </p>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dsc_cookie_consent";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean, marketing: boolean) {
  const consent: Consent = { necessary: true, analytics, marketing, ts: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* storage blocked — nothing to persist, banner will simply reappear */
  }
  // Let the rest of the app react (e.g. to load analytics only after opt-in).
  window.dispatchEvent(new CustomEvent("cookie-consent", { detail: consent }));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  function decide(a: boolean, m: boolean) {
    writeConsent(a, m);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-bone/15 bg-ink/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-7 md:px-10 md:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-door text-signal">
              Cookies
            </p>
            <p className="text-[12px] leading-relaxed tracking-[0.04em] text-bone/70">
              We use strictly necessary cookies to run the door and your reservation. With your
              consent we also use optional cookies to understand how the site is used. You can accept
              all, keep only what&apos;s necessary, or choose for yourself. Read more in our{" "}
              <a href="/cookies" className="text-bone underline underline-offset-2 hover:text-signal">
                cookie policy
              </a>
              .
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <button
              onClick={() => setManage((v) => !v)}
              className="border border-bone/25 px-6 py-3 text-[10px] font-semibold uppercase tracking-door text-bone transition-colors duration-300 hover:border-bone"
              aria-expanded={manage}
            >
              Manage
            </button>
            <button
              onClick={() => decide(false, false)}
              className="border border-bone/25 px-6 py-3 text-[10px] font-semibold uppercase tracking-door text-bone transition-colors duration-300 hover:border-bone"
            >
              Necessary only
            </button>
            <button
              onClick={() => decide(true, true)}
              className="border border-signal bg-signal px-6 py-3 text-[10px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-signal"
            >
              Accept all
            </button>
          </div>
        </div>

        {manage && (
          <div className="grid gap-4 border-t border-bone/10 pt-6 sm:grid-cols-3">
            <label className="flex cursor-not-allowed items-start gap-3 opacity-70">
              <input type="checkbox" checked disabled className="mt-[3px] accent-signal" />
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-bone">
                  Necessary
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-ash">
                  Age gate, reservations and security. Always on.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-[3px] accent-signal"
              />
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-bone">
                  Analytics
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-ash">
                  Anonymous stats on how the site is used.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-[3px] accent-signal"
              />
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-bone">
                  Marketing
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-ash">
                  Measuring campaigns that bring people to the door.
                </span>
              </span>
            </label>

            <div className="sm:col-span-3">
              <button
                onClick={() => decide(analytics, marketing)}
                className="border border-signal px-6 py-3 text-[10px] font-semibold uppercase tracking-door text-signal transition-colors duration-300 hover:bg-signal hover:text-ink"
              >
                Save choices
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

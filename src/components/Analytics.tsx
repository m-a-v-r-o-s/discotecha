"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { readConsent, type Consent } from "./CookieConsent";

// No analytics is wired up yet. Set both env vars to a real provider's
// script URL + site id to turn this on; until then it renders nothing.
// The script only loads after the visitor opts in via the cookie banner,
// never before, matching the "off unless you opt in" promise in /cookies.
const SCRIPT_URL = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
const SITE_ID = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID;

export default function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const apply = (c: Consent | null) => setAllowed(!!c?.analytics);
    apply(readConsent());
    const onChange = (e: Event) => apply((e as CustomEvent<Consent>).detail);
    window.addEventListener("cookie-consent", onChange);
    return () => window.removeEventListener("cookie-consent", onChange);
  }, []);

  if (!allowed || !SCRIPT_URL || !SITE_ID) return null;

  return <Script src={SCRIPT_URL} data-site-id={SITE_ID} strategy="afterInteractive" />;
}

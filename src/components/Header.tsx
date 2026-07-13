"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/#lineup", label: "Line up" },
  { href: "/#rules", label: "Door policy" },
  { href: "/#room", label: "The room" },
];

const SOCIAL = [
  { href: "https://www.instagram.com/", label: "Instagram" },
  { href: "https://wa.me/306942601351", label: "WhatsApp" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid || open ? "bg-ink/92 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" aria-label="Discotecha, home" className="shrink-0">
          <Image
            src="/images/wordmark-cut.webp"
            alt="Discotecha"
            width={471}
            height={127}
            priority
            className="h-auto w-28 md:w-32"
          />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[10px] font-semibold uppercase tracking-door text-bone/70 transition-colors hover:text-signal"
            >
              {n.label}
            </Link>
          ))}
          {SOCIAL.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold uppercase tracking-door text-bone/70 transition-colors hover:text-signal"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 flex-col items-end justify-center gap-[5px] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className={`block h-[1.5px] bg-bone transition-all duration-300 ${
              open ? "w-6 translate-y-[6.5px] rotate-45" : "w-6"
            }`}
          />
          <span
            className={`block h-[1.5px] bg-bone transition-all duration-300 ${
              open ? "w-6 -translate-y-[6.5px] -rotate-45" : "w-4"
            }`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-6">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="py-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-bone/80"
            >
              {n.label}
            </Link>
          ))}
          {SOCIAL.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-bone/80"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

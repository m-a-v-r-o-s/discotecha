"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const COOKIE = "club_door";
const MIN_AGE = 21;

function hasPassed() {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=1`));
}

export default function DoorGate() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [refused, setRefused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const eyeRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setOpen(!hasPassed());
  }, []);

  // aria-modal="true" hides the rest of the document from assistive tech, so
  // the gate has to take focus or a screen reader lands on nothing.
  useEffect(() => {
    if (open) dayRef.current?.focus();
  }, [open]);

  // The room drifts behind the gate: you can see it before you are let in.
  useEffect(() => {
    if (!open) return;
    const el = eyeRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 26;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.08)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, mounted]);

  function enter() {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (!y || !m || !d || y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) {
      setRefused(true);
      return;
    }
    const dob = new Date(y, m - 1, d);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
    if (dob > cutoff) {
      setRefused(true);
      return;
    }
    document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
    setLeaving(true);
    setTimeout(() => setOpen(false), 800);
  }

  if (!mounted || !open) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center bg-ink transition-opacity duration-700 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
    >
      <div
        ref={eyeRef}
        className="pointer-events-none absolute inset-0 bg-[url('/images/crowd.webp')] bg-cover bg-center opacity-[0.55] transition-transform duration-500 ease-out md:bg-[url('/images/crowd-wide.webp')]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/85" aria-hidden />

      <div className="relative w-full max-w-md px-7 text-center">
        <Logo className="mx-auto mb-10 h-auto w-72" />

        <p className="mb-1 text-[10px] font-semibold uppercase tracking-door text-signal">
          Members &amp; guests only
        </p>
        {/* Not an h1: the page behind the gate owns that, and a modal prompt
            should not compete with it in the document outline. */}
        <p className="mb-8 text-[13px] font-medium uppercase leading-relaxed tracking-[0.14em] text-bone/70">
          Twenty-one and over.
          <br />
          Give us your date of birth.
        </p>

        <div
          className="mb-5 flex items-end gap-3"
          onKeyDown={(e) => e.key === "Enter" && enter()}
        >
          <input
            ref={dayRef}
            className="field text-center"
            inputMode="numeric"
            maxLength={2}
            placeholder="DD"
            value={day}
            onChange={(e) => {
              setDay(e.target.value.replace(/\D/g, ""));
              setRefused(false);
            }}
            aria-label="Day of birth"
          />
          <input
            className="field text-center"
            inputMode="numeric"
            maxLength={2}
            placeholder="MM"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value.replace(/\D/g, ""));
              setRefused(false);
            }}
            aria-label="Month of birth"
          />
          <input
            className="field text-center"
            inputMode="numeric"
            maxLength={4}
            placeholder="YYYY"
            value={year}
            onChange={(e) => {
              setYear(e.target.value.replace(/\D/g, ""));
              setRefused(false);
            }}
            aria-label="Year of birth"
          />
        </div>

        <button
          onClick={enter}
          className="w-full border border-bone/25 py-4 text-[11px] font-semibold uppercase tracking-door text-bone transition-colors duration-300 hover:border-signal hover:bg-signal hover:text-ink"
        >
          Step inside
        </button>

        <p
          className={`mt-5 text-[10px] uppercase tracking-[0.2em] transition-opacity duration-300 ${
            refused ? "text-signal opacity-100" : "opacity-0"
          }`}
          role={refused ? "alert" : undefined}
        >
          Not tonight. The door is 21+.
        </p>

        <p className="mt-10 text-[9px] uppercase tracking-[0.2em] text-ash">
          Ios · Cyclades · Right of admission reserved
        </p>
      </div>
    </div>
  );
}

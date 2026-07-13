"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { upcomingEvents, formatDate } from "@/lib/events";
import { TIERS, GUESTLIST_MAX } from "@/lib/tiers";

type Kind = "TABLE" | "GUESTLIST";

export default function ReserveForm({
  initialKind = "TABLE",
  initialDate = "",
}: {
  initialKind?: Kind;
  initialDate?: string;
}) {
  const router = useRouter();
  const events = useMemo(() => upcomingEvents(), []);

  const [kind, setKind] = useState<Kind>(initialKind);
  const [date, setDate] = useState(initialDate || events[0]?.date || "");
  const [tierId, setTierId] = useState("booth");
  const [guests, setGuests] = useState(2);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [note, setNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const visibleTiers = TIERS;
  const tier = visibleTiers.find((t) => t.id === tierId) ?? visibleTiers[0];

  async function submit() {
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !date) {
      setError("Name, email, phone and a night. We need all four.");
      return;
    }
    setBusy(true);

    const payload = {
      kind,
      eventDate: date,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      instagram: instagram.trim() || undefined,
      guests,
      note: note.trim() || undefined,
      tierId: kind === "TABLE" ? tier?.id : undefined,
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "That didn't go through. Try again.");
        setBusy(false);
        return;
      }

      // Tables pay a deposit before they're held. Guest list just waits.
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      router.push(`/reserve/received?ref=${data.reference}`);
    } catch {
      setError("The line dropped. Try again, or message us on WhatsApp.");
      setBusy(false);
    }
  }

  const maxGuests = kind === "GUESTLIST" ? GUESTLIST_MAX : 12;

  return (
    <div className="grid gap-16 md:grid-cols-[1fr_360px] md:gap-20">
      {/* ── Form ──────────────────────────────────────────────── */}
      <div>
        {/* Kind */}
        <fieldset className="mb-12">
          <legend className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
            What are you asking for
          </legend>
          <div className="grid grid-cols-2 gap-px bg-bone/15">
            {(["TABLE", "GUESTLIST"] as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setGuests(k === "GUESTLIST" ? 2 : 2);
                }}
                aria-pressed={kind === k}
                className={`px-5 py-6 text-left transition-colors duration-300 ${
                  kind === k ? "bg-signal text-ink" : "bg-ink text-bone hover:bg-pitch"
                }`}
              >
                <span className="block text-[13px] font-extrabold uppercase tracking-[0.06em]">
                  {k === "TABLE" ? "A table" : "Guest list"}
                </span>
                <span
                  className={`mt-1.5 block text-[10px] uppercase tracking-[0.12em] ${
                    kind === k ? "text-ink/70" : "text-ash"
                  }`}
                >
                  {k === "TABLE"
                    ? "Held on deposit, confirmed instantly"
                    : `Up to ${GUESTLIST_MAX}, we reply by message`}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Night */}
        <fieldset className="mb-12">
          <legend className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
            Which night
          </legend>
          <select
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Night"
          >
            {events.map((e) => {
              const d = formatDate(e.date);
              return (
                <option key={e.date} value={e.date}>
                  {d.long} · {e.artists}
                </option>
              );
            })}
          </select>
          {events.length === 0 && (
            <p className="mt-4 text-[12px] text-ash">
              The season is over. Follow us for next summer.
            </p>
          )}
        </fieldset>

        {/* Table tier */}
        {kind === "TABLE" && (
          <fieldset className="mb-12">
            <legend className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
              Which table
            </legend>
            <div className="flex flex-col gap-px bg-bone/15">
              {visibleTiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTierId(t.id)}
                  aria-pressed={tierId === t.id}
                  className={`flex items-center justify-between gap-4 px-5 py-5 text-left transition-colors duration-300 ${
                    tierId === t.id ? "bg-signal text-ink" : "bg-ink text-bone hover:bg-pitch"
                  }`}
                >
                  <span>
                    <span className="block text-[14px] font-extrabold uppercase tracking-[0.04em]">
                      {t.name}
                    </span>
                    <span
                      className={`mt-1 block text-[10px] uppercase tracking-[0.12em] ${
                        tierId === t.id ? "text-ink/70" : "text-ash"
                      }`}
                    >
                      {t.seats} guests · TBD minimum
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[10px] uppercase tracking-door opacity-60">
                      Deposit
                    </span>
                    <span className="block text-[15px] font-semibold">TBD</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Party */}
        <fieldset className="mb-12">
          <legend className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
            How many of you
          </legend>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setGuests(n)}
                aria-pressed={guests === n}
                className={`h-11 w-11 border text-[13px] font-semibold transition-colors duration-200 ${
                  guests === n
                    ? "border-signal bg-signal text-ink"
                    : "border-bone/20 text-bone/70 hover:border-bone"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Who */}
        <fieldset className="mb-12">
          <legend className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
            Who&apos;s coming
          </legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <input
              className="field"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Full name"
              autoComplete="name"
            />
            <input
              className="field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              autoComplete="email"
            />
            <input
              className="field"
              type="tel"
              placeholder="Phone (WhatsApp)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="Phone"
              autoComplete="tel"
            />
            <input
              className="field"
              placeholder="Instagram (optional)"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              aria-label="Instagram"
            />
          </div>
          <textarea
            className="field mt-6"
            rows={2}
            placeholder="Anything we should know"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Note"
          />
        </fieldset>

        {error && (
          <p role="alert" className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-signal">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy || events.length === 0}
          className="w-full border border-signal bg-signal py-5 text-[11px] font-extrabold uppercase tracking-door text-ink transition-colors duration-300 hover:bg-transparent hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? "One moment"
            : kind === "TABLE"
              ? "Hold the table"
              : "Send the request"}
        </button>

        <p className="mt-5 text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ash">
          {kind === "TABLE"
            ? "The deposit comes off your minimum spend. Cancel more than 48 hours out and it's refunded."
            : "Guest list is a request, not a booking. We reply to every one, usually the same day."}
        </p>
      </div>

      {/* ── Aside ─────────────────────────────────────────────── */}
      <aside className="md:sticky md:top-28 md:self-start">
        <div className="border border-bone/15 p-7">
          <h3 className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
            Before you send it
          </h3>
          <ul className="space-y-4 text-[12px] leading-relaxed text-bone/55">
            <li>Everyone in the party is 21+ and carrying ID.</li>
            <li>The address is sent to your phone once you&apos;re confirmed.</li>
            <li>Doors 23:30. Tables held until 01:00, then released.</li>
            <li>No phones on the floor.</li>
          </ul>

          <a
            href="https://wa.me/306942601351"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 block border-t border-bone/15 pt-6 text-[10px] font-semibold uppercase tracking-door text-bone transition-colors hover:text-signal"
          >
            Rather just message us? →
          </a>
        </div>
      </aside>
    </div>
  );
}

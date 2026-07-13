"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/events";

export type Row = {
  id: string;
  reference: string;
  kind: string;
  status: string;
  eventDate: string;
  eventName: string;
  name: string;
  email: string;
  phone: string;
  instagram: string | null;
  guests: number;
  note: string | null;
  tierId: string | null;
  deposit: number | null;
  minimumSpend: number | null;
  paid: boolean;
  createdAt: string;
};

const FILTERS = ["PENDING", "CONFIRMED", "DECLINED", "ALL"] as const;
type Filter = (typeof FILTERS)[number];

export default function AdminBook({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  const nights = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of visible) {
      const list = map.get(r.eventDate) ?? [];
      list.push(r);
      map.set(r.eventDate, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [visible]);

  const counts = useMemo(
    () => ({
      pending: rows.filter((r) => r.status === "PENDING").length,
      confirmed: rows.filter((r) => r.status === "CONFIRMED").length,
      heads: rows.filter((r) => r.status === "CONFIRMED").reduce((n, r) => n + r.guests, 0),
      deposits: rows.filter((r) => r.paid).reduce((n, r) => n + (r.deposit ?? 0), 0),
    }),
    [rows]
  );

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  function exportCsv() {
    const head = [
      "reference",
      "status",
      "kind",
      "date",
      "artists",
      "name",
      "guests",
      "phone",
      "email",
      "instagram",
      "table",
      "deposit",
      "paid",
      "note",
    ];
    const body = visible.map((r) =>
      [
        r.reference,
        r.status,
        r.kind,
        r.eventDate,
        r.eventName,
        r.name,
        r.guests,
        r.phone,
        r.email,
        r.instagram ?? "",
        r.tierId ?? "",
        r.deposit ?? "",
        r.paid ? "yes" : "no",
        (r.note ?? "").replace(/[\n,]/g, " "),
      ].join(",")
    );
    const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `discotecha-${filter.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-door text-signal">
            The book
          </p>
          <h1 className="text-[32px] font-extrabold uppercase leading-none tracking-tightest text-bone md:text-[44px]">
            Reservations
          </h1>
        </div>
        <button
          onClick={logout}
          className="text-[10px] font-semibold uppercase tracking-door text-ash transition-colors hover:text-signal"
        >
          Sign out
        </button>
      </div>

      {/* Counts */}
      <div className="mb-12 grid grid-cols-2 gap-px bg-bone/15 md:grid-cols-4">
        {[
          ["Waiting on you", counts.pending],
          ["Confirmed", counts.confirmed],
          ["Heads confirmed", counts.heads],
          ["Deposits taken", `€${counts.deposits}`],
        ].map(([k, v]) => (
          <div key={String(k)} className="bg-ink p-6">
            <p className="mb-2 text-[9px] uppercase tracking-door text-ash">{k}</p>
            <p className="text-[26px] font-extrabold tabular-nums tracking-tightest text-bone">{v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-door transition-colors ${
              filter === f
                ? "border-signal bg-signal text-ink"
                : "border-bone/20 text-bone/60 hover:border-bone"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={exportCsv}
          className="ml-auto border border-bone/20 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-door text-bone/60 transition-colors hover:border-bone"
        >
          Export CSV
        </button>
      </div>

      {nights.length === 0 && (
        <p className="border border-bone/15 p-10 text-[13px] text-bone/50">
          Nothing here. When someone puts their name down it lands in this list.
        </p>
      )}

      {nights.map(([date, list]) => {
        const d = formatDate(date);
        return (
          <section key={date} className="mb-14">
            <div className="mb-5 flex items-center gap-4">
              <h2 className="shrink-0 text-[14px] font-extrabold uppercase tracking-[0.06em] text-signal">
                {d.long}
              </h2>
              <span className="leader text-bone" aria-hidden />
              <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-ash">
                {list.reduce((n, r) => n + r.guests, 0)} heads · {list.length} bookings
              </span>
            </div>

            <div className="flex flex-col gap-px bg-bone/15">
              {list.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-5 bg-ink p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="text-[15px] font-extrabold uppercase tracking-[0.04em] text-bone">
                        {r.name}
                      </span>
                      <span className="border border-bone/25 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-door text-bone/60">
                        {r.kind === "TABLE" ? (r.tierId ?? "table") : "guest list"}
                      </span>
                      <span className="text-[10px] uppercase tracking-door text-ash">
                        {r.guests} guests
                      </span>
                      {r.paid && (
                        <span className="text-[9px] font-semibold uppercase tracking-door text-signal">
                          €{r.deposit} paid
                        </span>
                      )}
                      <span className="font-mono text-[10px] tracking-widest text-ash">
                        {r.reference}
                      </span>
                    </div>
                    <p className="truncate text-[12px] text-bone/50">
                      {r.phone} · {r.email}
                      {r.instagram ? ` · ${r.instagram}` : ""}
                    </p>
                    {r.note && <p className="mt-2 text-[12px] italic text-bone/40">“{r.note}”</p>}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`mr-2 text-[9px] font-semibold uppercase tracking-door ${
                        r.status === "CONFIRMED"
                          ? "text-signal"
                          : r.status === "PENDING"
                            ? "text-bone/50"
                            : "text-ash line-through"
                      }`}
                    >
                      {r.status}
                    </span>
                    <button
                      onClick={() => setStatus(r.id, "CONFIRMED")}
                      disabled={busyId === r.id || r.status === "CONFIRMED"}
                      className="border border-signal px-4 py-2 text-[10px] font-semibold uppercase tracking-door text-signal transition-colors hover:bg-signal hover:text-ink disabled:opacity-25"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setStatus(r.id, "DECLINED")}
                      disabled={busyId === r.id || r.status === "DECLINED"}
                      className="border border-bone/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-door text-bone/60 transition-colors hover:border-bone hover:text-bone disabled:opacity-25"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

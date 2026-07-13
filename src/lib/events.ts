export type ClubEvent = {
  date: string; // ISO
  artists: string;
  support?: string;
  tag?: string;
  poster?: string;
};

// The whole season lives here. Edit this array, the site follows.
export const EVENTS: ClubEvent[] = [
  { date: "2026-07-10", artists: "DA MIKE", tag: "OPENING" },
  { date: "2026-07-11", artists: "THODORIS TRIANTAFILLOU" },
  { date: "2026-07-12", artists: "ALEX PM" },
  {
    date: "2026-07-17",
    artists: "INNASSI & METAXXA",
    support: "AVATOS",
    poster: "/images/flyer-innassi.webp",
  },
  { date: "2026-07-18", artists: "NICO RAC & LUC" },
  { date: "2026-07-19", artists: "USELESS CO & ZORZ POOL" },
  {
    date: "2026-07-24",
    artists: "ECHONOMIST & ALEX PM",
    support: "AVATOS",
    poster: "/images/flyer-echonomist.webp",
  },
  { date: "2026-07-25", artists: "LOUIE DIMÁ & LUC" },
  { date: "2026-07-26", artists: "MANWITHTHESPEAKER & OKÁLO" },
  { date: "2026-07-31", artists: "BRB" },
  { date: "2026-08-01", artists: "DA MIKE" },
  { date: "2026-08-02", artists: "LE CROQUE" },
  { date: "2026-08-07", artists: "LOUIE DIMÁ & LUC" },
  { date: "2026-08-08", artists: "REIGN OF TIME & PEN." },
  { date: "2026-08-09", artists: "LEX (ATHENS) & G.FAMELIARIS" },
  { date: "2026-08-14", artists: "NIVK JANE B2B AVATOS" },
  { date: "2026-08-15", artists: "ALEX PM", tag: "CLOSING" },
];

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return {
    day: DAYS[d.getDay()],
    short: `${d.getDate()}.${d.getMonth() + 1}`,
    long: `${DAYS[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`,
  };
}

export function upcomingEvents(from = new Date()) {
  const today = from.toISOString().slice(0, 10);
  return EVENTS.filter((e) => e.date >= today);
}

export function findEvent(date: string) {
  return EVENTS.find((e) => e.date === date) ?? null;
}

export type ClubEvent = {
  date: string; // ISO
  artists: string;
  support?: string;
  tag?: string;
  poster?: string;
};

// The whole season lives here. Edit this array, the site follows.
// Every name below is invented for the template. Swap in the real bookings.
export const EVENTS: ClubEvent[] = [
  { date: "2026-07-10", artists: "KID ORFEO", tag: "OPENING" },
  { date: "2026-07-11", artists: "STAVROS KALANTZIS" },
  { date: "2026-07-12", artists: "ARIS DM" },
  { date: "2026-07-17", artists: "VELISSA & MASTIHA", support: "ANEMOS" },
  { date: "2026-07-18", artists: "MARCO REV & VELO" },
  { date: "2026-07-19", artists: "IDLE CO & ZAZA POOL" },
  { date: "2026-07-24", artists: "SONOMIST & ARIS DM", support: "ANEMOS" },
  { date: "2026-07-25", artists: "TOMMY DELÁ & VELO" },
  { date: "2026-07-26", artists: "KIDWITHTHEKEYS & OKTÁVO" },
  { date: "2026-07-31", artists: "IRL" },
  { date: "2026-08-01", artists: "KID ORFEO" },
  { date: "2026-08-02", artists: "LE MARQUIS" },
  { date: "2026-08-07", artists: "TOMMY DELÁ & VELO" },
  { date: "2026-08-08", artists: "ORDER OF HOURS & INK." },
  { date: "2026-08-09", artists: "VEX (ATHENS) & N.STAVERIS" },
  { date: "2026-08-14", artists: "NIKA VANE B2B ANEMOS" },
  { date: "2026-08-15", artists: "ARIS DM", tag: "CLOSING" },
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

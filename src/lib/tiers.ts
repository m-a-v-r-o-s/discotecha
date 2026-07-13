export type Tier = {
  id: string;
  name: string;
  seats: string;
  minimumSpend: number; // euros
  deposit: number; // euros, charged now via Stripe
  blurb: string;
};

export const TIERS: Tier[] = [
  {
    id: "booth",
    name: "BOOTH",
    seats: "2–4",
    minimumSpend: 400,
    deposit: 150,
    blurb: "Edge of the floor. Close enough to feel the bass in the glass.",
  },
  {
    id: "banquette",
    name: "BANQUETTE",
    seats: "4–6",
    minimumSpend: 800,
    deposit: 250,
    blurb: "The long side of the room. Bottle service, one host for the night.",
  },
  {
    id: "floor",
    name: "FLOOR TABLE",
    seats: "6–10",
    minimumSpend: 1600,
    deposit: 500,
    blurb: "On the floor, inside the noise. Priority entry for the whole party.",
  },
];

export const GUESTLIST_MAX = 4;

export function findTier(id: string) {
  return TIERS.find((t) => t.id === id) ?? null;
}

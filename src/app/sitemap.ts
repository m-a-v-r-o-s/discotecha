import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Only the pages worth a stranger landing on from search. /admin is gated and
// noindexed, /api is not a page, and /reserve/received is a per-reservation
// receipt (needs a ?ref=) rather than a canonical page to rank.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/reserve", "/cookies", "/privacy", "/terms"];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}

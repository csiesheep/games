// Hub Worker for games.csiesheep.com. It OWNS the subdomain root: it serves
// the landing page (index.html, via static assets) and the domain-root files
// that belong to the whole subdomain, not to any single game.
//
// Each individual game is a separate Worker attached by a more-specific Route
// (e.g. games.csiesheep.com/betrayal_sound_board/*). Cloudflare matches the
// most-specific route first, so those game paths peel off to their own Workers
// and everything else — including "/" — falls through to this hub.
//
// `run_worker_first: true` (wrangler.jsonc) lets this script answer the root
// files before the static-asset handler runs.

const ORIGIN = "https://games.csiesheep.com";

// Google requires ads.txt at the domain root to authorise AdSense for the
// whole subdomain (one file covers every game underneath it).
const ADS_TXT = "google.com, pub-3643717374169188, DIRECT, f08c47fec0942fa0\n";

// Cloudflare's Managed robots.txt is prepended to this response and supplies
// the crawl rules already; we only add the Sitemap directive so we don't emit
// a duplicate "User-agent: *" group.
const ROBOTS_TXT = "Sitemap: " + ORIGIN + "/sitemap.xml\n";

// The one sitemap for the whole subdomain. Add a line per game as it launches.
//
// Only the landing page of each game goes here. Grave Errand serves its own
// prefix-scoped sitemap covering its five pages
// (/zombie_in_the_pocket/sitemap.xml) — this file cannot reference that one,
// because a <urlset> and a <sitemapindex> are different documents and mixing
// them is invalid. Crawlers reach the rest by following the links from the
// landing page, which is what they are for; submitting the prefix sitemap to
// Search Console separately just makes it faster.
const SITEMAP_URLS = [
  { loc: ORIGIN + "/", lastmod: "2026-08-20", priority: "1.0" },
  { loc: ORIGIN + "/betrayal_sound_board/", lastmod: "2026-08-16", priority: "0.9" },
  { loc: ORIGIN + "/zombie_in_the_pocket/", lastmod: "2026-08-20", priority: "0.9" },
];
const SITEMAP_XML =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  SITEMAP_URLS.map(
    (u) =>
      "  <url>\n" +
      "    <loc>" + u.loc + "</loc>\n" +
      "    <lastmod>" + u.lastmod + "</lastmod>\n" +
      "    <priority>" + u.priority + "</priority>\n" +
      "  </url>\n"
  ).join("") +
  "</urlset>\n";

// TODO: when you create the Search Console property for games.csiesheep.com,
// add its verification file path here (serve it directly, as the betrayal
// repo does, so the static-asset .html redirect doesn't interfere).

function text(body, type = "text/plain; charset=utf-8") {
  return new Response(body, { headers: { "content-type": type } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/ads.txt") return text(ADS_TXT);
    if (url.pathname === "/robots.txt") return text(ROBOTS_TXT);
    if (url.pathname === "/sitemap.xml") return text(SITEMAP_XML, "application/xml; charset=utf-8");

    return env.ASSETS.fetch(request);
  },
};

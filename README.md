# games.csiesheep.com — hub

The landing page and root owner for `games.csiesheep.com`. It serves the
directory of games and the domain-root files (`ads.txt`, `robots.txt`,
`sitemap.xml`) that apply to the whole subdomain.

Each game is its **own** repo + Cloudflare Worker, attached under this
subdomain by a path-scoped Route (e.g. `games.csiesheep.com/<name>/*`).
Cloudflare matches the most-specific route first, so the games peel off to
their own Workers and everything else — including `/` — falls to this hub.

See the runbook: *Deploy a repo under a csiesheep.com subdomain* (Obsidian).

## Structure

```
index.html      the games directory (static — add a card per game)
css/style.css   styles
src/index.js    hub Worker: ads.txt / robots.txt / sitemap.xml, else assets
wrangler.jsonc  Worker config (name: games)
```

## Adding a game

1. Deploy the game's own Worker (its repo, its prefix router).
2. Add a Route `games.csiesheep.com/<name>/*` to that Worker.
3. Add a card to `index.html` here, and a `<url>` line to `SITEMAP_URLS`
   in `src/index.js`.

## Custom Domain

This Worker holds the `games.csiesheep.com` Custom Domain. Individual games
use **Routes**, not Custom Domains, so they can share the hostname.

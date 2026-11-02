# Noridoc: goodsport

Path: @/

### Overview

- A single-page SvelteKit (Svelte 5, runes mode forced in @/vite.config.ts) app that renders the designed Good Sport NYC homepage from the owner's mockups: posts from the Good Sport NYC Substack RSS feed, live team schedules for NYC women's pro teams in scrolling tickers, and a large animated oval that swings as the reader scrolls.
- Deployed as a Cloudflare Worker with static assets, modeled on the sibling sugarcube site, with no database, KV or secrets. A database may be added later.

### How it fits into the larger codebase

```
Browser ──► Cloudflare edge (caches.default, keyed per data center;
              │  reliable only on a custom domain, not *.workers.dev)
              │ miss / no edge cache
              ▼
         Worker (.svelte-kit/cloudflare/_worker.js, built by adapter-cloudflare)
              │
              ▼
         src/routes/+page.server.ts  load()
              ├─► src/lib/server/feed.ts      getFeed(event.fetch) ──► Substack RSS
              ├─► src/lib/server/schedule.ts  getGames()  (global fetch) ──► ESPN / HockeyTech PWHL
              ├─► src/lib/tickers.ts          tickerBands(games, posts, now)
              └─► setHeaders cache-control: public, s-maxage=600, stale-while-revalidate=3600
              │   returns { feed, now, tickers }
              ▼
         src/routes/+layout.svelte  (fonts, app.css, the fixed Oval)
         src/routes/+page.svelte    (section composition from $lib/components)
```

- The only route is `/`. @/src/routes/+page.server.ts fetches the feed and the schedules in parallel, stamps a server-side `now`, builds the ticker text, and sets a public `Cache-Control` header for the edge cache.
- Server-only fetching, parsing and caching lives in @/src/lib/server (see @/src/lib/server/docs.md). Shared pure logic (post classification, ticker text, animation physics) and all page components live in @/src/lib (see @/src/lib/docs.md).
- The adapter (`@sveltejs/adapter-cloudflare` 7.x) is passed inline to the `sveltekit()` plugin in @/vite.config.ts; there is no `svelte.config.js`. Adapter 7 is pinned because adapter 8 requires SvelteKit 3.
- @/wrangler.jsonc names the Worker `goodsport`, points `main` at the adapter's generated worker, serves the adapter's output directory as static assets through the `ASSETS` binding, enables `nodejs_compat` and Workers observability, and declares no other bindings. `App.Platform` in @/src/app.d.ts is therefore left untyped. Adding D1 later means a `d1_databases` entry in @/wrangler.jsonc and typing it on `App.Platform`, as sugarcube does.
- Deployment is intended to be Cloudflare Workers Builds (Git integration): build `npm run build`, deploy `npx wrangler deploy`, production branch `main`. It is configured by hand in the Cloudflare dashboard and is not connected yet; the custom domain is undecided. Setup steps are in @/README.md. Once connected, every merge to `main` ships to production.
- CI in @/.github/workflows/ci.yml runs install, tests, `svelte-check` and a production build on Node 22 for pull requests and pushes to `main`. It only verifies; it does not deploy.

### Core Implementation

- Design system: the palette (red, blue, ink, cream, amber, white) and font-stack custom properties are defined in @/src/app.css, which also declares the pixel font's `@font-face` and the `.layer` stacking rule. @/src/routes/+layout.svelte imports the `@fontsource` packages, imports the stylesheet, preloads the pixel font, and mounts the oval once for the whole page.

| Role | Font | Source |
| --- | --- | --- |
| Display headlines | Alfa Slab One | `@fontsource` |
| Labels, metadata | DM Mono | `@fontsource` |
| Tickers, buttons | Minimal 5x7 pixel font | @/static/fonts (free from dafont) |
| Condensed display | PP Neue Gstaad, stand-in Saira Extra Condensed 700/800 | `@fontsource` |
| Body | PP Neue Gstaad, stand-in Archivo variable | `@fontsource` |

- PP Neue Gstaad is licensed and not yet added. It is listed first in the sans and condensed stacks, so adding its font files and an `@font-face` makes it take over without touching components.
- Page composition in @/src/routes/+page.svelte, top to bottom: top bar, header, hero (the newest post of any kind), three ticker bands, The Latest (a featured post plus numbered weekly issues), The Podcast (newest episodes), On Instagram, Subscribe, and the footer with its credit bar. Post selection (featured = newest remaining post that is neither an issue nor an episode; issues and episodes come from the posts after the hero) relies on the classifiers in @/src/lib/post.ts. Sections that have no posts are omitted; an empty ticker band falls back to the feed title.
- Scroll choreography is declared with data attributes on wrappers in the page: `data-swing-section` marks each section the oval swings across, `data-morph-section` marks the subscribe section where the oval morphs into the card marked `data-oval-target` in @/src/lib/components/Subscribe.svelte.
- Subscribe is a plain GET form to `https://www.goodsportnyc.com/subscribe?email=...`; Substack pre-fills the email on its own page. Nothing is written to Substack from this site.
- `now` is computed in the server load and passed to the page so relative times ("3 hours ago") and ticker windows are identical on server render and hydration. All displayed dates and times use `America/New_York`, so they show the New York calendar date regardless of the runtime timezone (UTC on Workers) or the visitor's timezone.
- Tests run with vitest (`npm test`) under the node environment, collected from `src/**/*.test.ts`. The page is tested by rendering the component to a string with `svelte/server` (no DOM library) and asserting on visible output. Feed and schedule tests inject a fake `fetch` and load fixtures via Vite `?raw` imports; animation and ticker logic is unit tested as pure functions.
- Local runtime parity: `npm run dev` runs plain Vite (Node), while `npm run build` followed by `npx wrangler dev` runs the real Worker bundle in workerd. `npx wrangler deploy --dry-run` validates the config without deploying.

### Things to Know

- Schedules must be fetched with the global `fetch`, not SvelteKit's event `fetch`. SvelteKit's server fetch adds an `Origin` header, and the PWHL (HockeyTech) API answers any request carrying `Origin` with an empty body. The feed still uses the event `fetch`.
- Schedule data comes from unofficial, keyless endpoints (ESPN's site API and HockeyTech's public PWHL feed key published by thepwhl.com). They can change or disappear without notice; a failing source drops only that team from the tickers.
- There are three independent cache layers: per-isolate module caches for the feed and for schedules (ten minutes each, best-effort because isolates are evicted and many run concurrently), and adapter-cloudflare 7's `caches.default` response cache per data center honoring `s-maxage=600`. The Workers Cache API ignores `stale-while-revalidate`, so that directive only matters to downstream caches. Because the whole page is cached, server-computed relative times and ticker windows can lag by up to the cache lifetime.
- Substack may answer Cloudflare egress IPs with a 403 or an HTML challenge page. The feed's stale fallback only helps an isolate that has already had one successful fetch; a cold blocked isolate throws and the page returns a 500. Schedule failures never fail the page.
- The edge response cache is not guaranteed on `*.workers.dev`; it is reliable only on a custom domain. Until one is attached, assume every request runs the Worker and only the per-isolate caches limit upstream requests. After deploying, verify with repeated requests and the `cf-cache-status` header.
- The pixel font has only a small glyph set: no curly quotes, en/em dashes or bullet, and its middle dot renders high. Text set in it must be restricted to plain ASCII (ticker text is normalized in @/src/lib/tickers.ts, and separators are a stretched hyphen). It renders crisply only at multiples of 16px.
- Stacking: each section carries the `layer` class, and `:where(.layer) > *` lifts its children to `z-index: 2`, while the fixed oval sits at `z-index: 1`. The oval therefore paints above section backgrounds but below section content. New sections must use `layer` to keep this order.
- All motion (oval, ticker marquees, the hero starburst rotation, hover transitions) stops under `prefers-reduced-motion`; the oval jumps directly to its end states.
- Phone layouts are rough and deliberately deferred. The Instagram section is placeholder tiles linking to the profile; a real feed is deferred. Some footer and top bar links (Discord, Donate) are `#` placeholders.
- `.wrangler/` holds local miniflare state from `wrangler dev` and is git-ignored.

Created and maintained by Nori.

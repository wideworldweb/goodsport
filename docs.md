# Noridoc: goodsport

Path: @/

### Overview

- A single-page SvelteKit (Svelte 5, runes mode forced in @/vite.config.ts) app that lists the posts from the Good Sport NYC Substack RSS feed: an `h1` with the feed title, then a `ul` of post links, each with its publish date. The page is intentionally unstyled.
- Deployed as a Cloudflare Worker with static assets, modeled on the sibling sugarcube site, but with no database, KV or secrets yet. A database may be added later.

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
              ├─► src/lib/server/feed.ts  getFeed(event.fetch)
              │       └─► https://www.goodsportnyc.com/feed  (Substack RSS)
              └─► setHeaders cache-control: public, s-maxage=600, stale-while-revalidate=3600
              │
              ▼
         src/routes/+page.svelte  (h1 + list of links with dates)
```

- The only route is `/`. @/src/routes/+page.server.ts calls `getFeed` with SvelteKit's event `fetch` and returns `{ feed }`; it sets a public `Cache-Control` header so the response can be cached at the edge where the edge cache is in effect.
- All feed fetching, parsing and caching lives in @/src/lib/server (see @/src/lib/server/docs.md). Because it is under `$lib/server`, SvelteKit refuses to bundle it into client code.
- The adapter (`@sveltejs/adapter-cloudflare` 7.x) is passed inline to the `sveltekit()` plugin in @/vite.config.ts; there is no `svelte.config.js`. Adapter 7 is pinned because adapter 8 requires SvelteKit 3.
- @/wrangler.jsonc names the Worker `goodsport`, points `main` at the adapter's generated worker, serves the adapter's output directory as static assets through the `ASSETS` binding, enables `nodejs_compat` and Workers observability, and declares no other bindings. `App.Platform` in @/src/app.d.ts is therefore left untyped. Adding D1 later means a `d1_databases` entry in @/wrangler.jsonc and typing it on `App.Platform`, as sugarcube does.
- Deployment is intended to be Cloudflare Workers Builds (Git integration): build `npm run build`, deploy `npx wrangler deploy`, production branch `main`. It is configured by hand in the Cloudflare dashboard and is not connected yet; the custom domain is undecided. Setup steps are in @/README.md. Once connected, every merge to `main` ships to production.
- CI in @/.github/workflows/ci.yml runs install, tests, `svelte-check` and a production build on Node 22 for pull requests and pushes to `main`. It only verifies; it does not deploy.

### Core Implementation

- @/src/routes/+page.svelte receives `data.feed`, sets the document title and meta description from the channel, and renders each post's title as a link to the Substack post plus a `<time>` element whose `datetime` is the ISO date and whose text is formatted with `Intl.DateTimeFormat('en-US')` in the `America/New_York` timezone as e.g. "Oct 19, 2026". Good Sport is an NYC publication, so the displayed date is the New York calendar date regardless of the runtime timezone (UTC on Workers) or the visitor's browser timezone, and server render and hydration agree. Posts are keyed by link.
- The post objects carry more fields (description, author, image) than the page currently renders; they are kept in the feed model for future use.
- Tests run with vitest (`npm test`) under the node environment, collected from `src/**/*.test.ts`. The page is tested by rendering the component to a string with `svelte/server` (no DOM library). Feed tests inject a fake `fetch` and load RSS fixtures via Vite `?raw` imports.
- Local runtime parity: `npm run dev` runs plain Vite (Node), while `npm run build` followed by `npx wrangler dev` runs the real Worker bundle in workerd. `npx wrangler deploy --dry-run` validates the config without deploying.

### Things to Know

- There are two independent cache layers. The module-level cache in @/src/lib/server/feed.ts lives per Worker isolate and is best-effort (isolates are evicted and many run concurrently). Separately, adapter-cloudflare 7 stores responses in `caches.default` per data center, honoring the page's `s-maxage=600`; the Workers Cache API ignores `stale-while-revalidate`, so that directive only matters to any downstream cache that respects it.
- Substack may answer Cloudflare egress IPs with a 403 or an HTML challenge page. The stale fallback in the feed module only helps an isolate that has already had one successful fetch; a cold isolate that is blocked will throw and the page returns a 500. When the fallback is used, the feed module logs a `console.warn` with the underlying error, so Substack blocks surface in Workers observability logs.
- The adapter-cloudflare 7 edge response cache uses the Cache API (`caches.default`), which is not guaranteed to work on `*.workers.dev`; it is reliable only on a custom domain. Until a custom domain is attached, assume every request runs the Worker and only the per-isolate memory cache in @/src/lib/server/feed.ts limits Substack requests. After deploying, verify by making repeated requests and checking `cf-cache-status` and response timing.
- Dates always display in New York time (`America/New_York`), so a post published late evening Eastern shows that Eastern date, not the UTC date.
- `.wrangler/` holds local miniflare state from `wrangler dev` and is git-ignored.

Created and maintained by Nori.

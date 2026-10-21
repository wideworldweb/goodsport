# Noridoc: lib/server

Path: @/src/lib/server

### Overview

- Server-only code that fetches the Good Sport NYC Substack RSS feed (https://www.goodsportnyc.com/feed), parses it into a plain `Feed` object, and caches it in memory for ten minutes.
- The single public entry point is `getFeed(fetchFn)` in @/src/lib/server/feed.ts, along with the exported `Feed` and `Post` types.
- Also holds the RSS fixtures used by the tests.

### How it fits into the larger codebase

- Called only by the home page load in @/src/routes/+page.server.ts, which passes SvelteKit's event `fetch`. The `Feed` type is also imported by the page component test in @/src/routes.
- Being under `$lib/server`, SvelteKit guarantees this code never reaches the browser bundle.
- Runs inside a Cloudflare Worker in production (see @/docs.md). Its in-memory cache sits beneath the edge response cache that adapter-cloudflare applies using the page's `Cache-Control` header; the two layers do not know about each other. That edge cache is reliable only on a custom domain, so on `*.workers.dev` this module's cache is the only thing limiting Substack requests.
- External dependency: `fast-xml-parser`, configured to keep attributes with an `@_` prefix so the `<enclosure url>` attribute can be read.

### Core Implementation

- `getFeed` returns the cached feed if it is younger than ten minutes (by its `fetchedAt` timestamp). Otherwise it requests the feed with an RSS/XML `Accept` header, rejects any non-OK status, and parses the body.
- Parsing reads `rss.channel`; if that is missing (for example, an HTML challenge page instead of RSS) it throws. A channel with a single `<item>` is normalized to a one-element list, and a channel with none yields an empty list.
- Each item becomes a `Post` with trimmed text for title, link, description and author (`dc:creator`), `pubDate` re-serialized as an ISO string, and `image` taken from the enclosure URL or `null`. Feed-level title, description and link come from the channel.
- Items whose `pubDate` is missing or unparseable are skipped rather than failing the whole feed.
- Error handling: any failure in fetching or parsing (network error, non-OK status, non-RSS response) falls back to the last successfully parsed feed if one is cached in this module, logging `console.warn('Serving stale feed after fetch failure', err)` so the failure (for example, a Substack block of Cloudflare egress IPs) is visible in Workers observability logs; otherwise the error propagates to the page load and SvelteKit returns an error page.

### Things to Know

- The cache is plain module state. On Workers it is per isolate and lost on eviction, so it reduces Substack requests but is not a guarantee. The fallback only helps an isolate that has succeeded at least once.
- Serving stale data does not refresh `fetchedAt`, so while Substack keeps failing, each request after the ten-minute window retries the fetch before falling back.
- `fetchFn` defaults to the global `fetch`, which lets tests inject a fake. Tests reset the module between cases (`vi.resetModules`) to clear the cache and use fake timers to cross the ten-minute boundary.
- Fixtures are loaded with Vite `?raw` imports rather than `node:fs`, because the project has no Node type definitions and `svelte-check` type-checks test files.

Created and maintained by Nori.

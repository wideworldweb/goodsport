# Noridoc: lib/server

Path: @/src/lib/server

### Overview

- Server-only data fetching for the homepage: the Good Sport NYC Substack RSS feed (https://www.goodsportnyc.com/feed) parsed into a `Feed`, and NYC women's pro team schedules normalized into `Game` records.
- Public entry points are `getFeed(fetchFn)` in @/src/lib/server/feed.ts and `getGames(fetchFn)` plus the `TEAMS` list in @/src/lib/server/schedule.ts, along with their exported types.
- Also holds the recorded RSS and JSON fixtures used by the tests.

### How it fits into the larger codebase

- Both entry points are called only by the home page load in @/src/routes/+page.server.ts. The feed gets SvelteKit's event `fetch`; schedules get the global `fetch` (see Things to Know).
- `Post`, `Game` and `TEAMS` are imported by shared code in @/src/lib (post classification in @/src/lib/post.ts, ticker text in @/src/lib/tickers.ts) and by components as types. Being under `$lib/server`, SvelteKit refuses to bundle this code into the browser, so any module that imports values (not just types) from here can only run on the server.
- Runs inside a Cloudflare Worker in production (see @/docs.md). Its in-memory caches sit beneath the edge response cache that adapter-cloudflare applies using the page's `Cache-Control` header; the layers do not know about each other.
- External dependencies: `fast-xml-parser` for RSS (attributes kept with an `@_` prefix so enclosure attributes can be read); ESPN's unofficial site API for the Liberty (WNBA), Gotham FC (NWSL) and Brooklyn FC (USL Super League); HockeyTech's `modulekit` feed for the PWHL Sirens, using the public client key that thepwhl.com itself ships. None require secrets.

### Core Implementation

- Feed: `getFeed` returns the cached feed if younger than ten minutes (by `fetchedAt`); otherwise it requests the feed with an RSS/XML `Accept` header, rejects non-OK statuses, and parses `rss.channel`, throwing if it is missing (e.g. an HTML challenge page). A single `<item>` is normalized to a list; none yields an empty list. Items with missing or unparseable `pubDate` are skipped.
- Each item becomes a `Post` with trimmed, entity-decoded title, link, description and author (`dc:creator`), and `pubDate` as ISO. The enclosure is classified by MIME type: an `audio/*` enclosure becomes `audio` (podcast episodes), an `image/*` enclosure becomes `image`; when there is no image enclosure, `image` falls back to the first `<img src>` in `content:encoded`, else `null`.
- Entity decoding exists because Substack wraps titles and descriptions in CDATA, so numeric and common named entities (e.g. `&#8217;`) arrive undecoded from the XML parser. Unknown entities are left as-is.
- Schedules: `TEAMS` declares each team's display name, the month its next season starts (used by the tickers when nothing is scheduled), and its source. ESPN sources read one team schedule endpoint and identify "us" vs the opponent by team id. The PWHL source first lists seasons, keeps those overlapping a window from three weeks back to about six weeks ahead, fetches each kept season's schedule, and filters games by the team's full name.
- Both sources normalize to `Game`: team, opponent short name, home flag, ISO start, venue (PWHL venue strings are trimmed at the first `|`), final flag, and scores only for final games.
- `getGames` fetches all teams with `Promise.allSettled` and caches the combined result for ten minutes (one minute if any team failed, so it is retried soon). Every upstream request has a short timeout, so a hung API can't stall the page. A team whose source fails is logged with `console.warn('Schedule unavailable for <team>', err)` and simply contributes no games, so one league's outage never blanks the tickers or fails the page.
- Feed error handling: any fetch or parse failure falls back to the last successful feed in this isolate, logging `console.warn('Serving stale feed after fetch failure', err)`; with nothing cached the error propagates and SvelteKit returns an error page.

### Things to Know

- Schedules must use the global `fetch`. SvelteKit's server-side event `fetch` adds an `Origin` header, and the HockeyTech PWHL API returns an empty body for any request with `Origin`, which surfaces as a JSON parse failure that silently drops the Sirens.
- After a source failure the schedule cache holds the partial result for only a minute, then retries; there is no stale fallback for schedules, unlike the feed.
- Serving a stale feed does not refresh `fetchedAt`, so while Substack keeps failing, each request after the ten-minute window retries before falling back.
- Caches are plain module state: per isolate on Workers and lost on eviction.
- The ESPN and HockeyTech endpoints are unofficial and undocumented; response shapes are typed only for the fields used. Fixtures are recorded responses trimmed to that shape.
- `fetchFn` defaults to the global `fetch` in both modules, which lets tests inject a fake that routes URLs to fixtures. Tests reset modules between cases (`vi.resetModules`) to clear caches and use fake timers to cross cache boundaries.
- Fixtures are loaded with Vite `?raw` imports rather than `node:fs`, because the project has no Node type definitions and `svelte-check` type-checks test files.

Created and maintained by Nori.

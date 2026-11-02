# Agent notes: goodsport

A SvelteKit app on Cloudflare Workers that renders the designed Good Sport NYC homepage: Substack RSS posts, team-schedule tickers, and a scroll-driven animated oval. See `docs.md` (root), `src/lib/docs.md` and `src/lib/server/docs.md` for how it works, and `README.md` for deploy setup.

## Commands

- `npm test`: vitest (node environment, `src/**/*.test.ts`)
- `npm run check`: svelte-check / TypeScript
- `npm run build`, then `npx wrangler dev`: run the built Worker locally
- `npx wrangler deploy --dry-run`: validate the Worker config

## Rules

- Never push to `main`. Work on a feature branch and open a PR.
- Treat every merge to `main` as a production release. Once Cloudflare Workers Builds is connected, merging to `main` deploys.
- Every change comes with tests, and with updates to `docs.md` files, this file and `README.md` whenever behavior changes.
- Do not hit the live Substack feed or schedule APIs in tests. Use the fixtures in `src/lib/server/fixtures` and inject a fake `fetch`.
- Keep the Cloudflare adapter on 7.x while the app is on SvelteKit 2 (adapter 8 requires SvelteKit 3).

## Gotchas

- Design system (palette and font-stack CSS variables, `.layer` stacking rule) lives in `src/app.css`; fonts are imported in `src/routes/+layout.svelte`. Use the variables, not raw colours. PP Neue Gstaad is first in the font stacks but not yet added (licensed); Saira Extra Condensed and Archivo are stand-ins.
- The Minimal 5x7 pixel font (`static/fonts`) has a tiny glyph set: no curly quotes, en/em dashes or bullet, and the middle dot renders high. Keep text set in it plain ASCII and sized in multiples of 16px.
- Fetch schedules with the global `fetch`, never SvelteKit's event `fetch`: it adds an `Origin` header and the PWHL API then returns an empty body.
- Ticker data sources (ESPN site API, HockeyTech PWHL feed) are unofficial and keyless. Expect them to break; a failing source must only drop that team.
- Sections need the `layer` class so their content sits above the fixed oval. Respect `prefers-reduced-motion` for any new motion, and follow the org `smooth-web-animation` skill.
- Phone layouts are rough and deliberately deferred. The Instagram section is placeholder tiles; a real feed is deferred.

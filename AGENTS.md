# Agent notes: goodsport

A SvelteKit app on Cloudflare Workers that renders the Good Sport NYC Substack RSS feed as a plain list of post links. See `docs.md` (root) and `src/lib/server/docs.md` for how it works, and `README.md` for deploy setup.

## Commands

- `npm test`: vitest (node environment, `src/**/*.test.ts`)
- `npm run check`: svelte-check / TypeScript
- `npm run build`, then `npx wrangler dev`: run the built Worker locally
- `npx wrangler deploy --dry-run`: validate the Worker config

## Rules

- Never push to `main`. Work on a feature branch and open a PR.
- Treat every merge to `main` as a production release. Once Cloudflare Workers Builds is connected, merging to `main` deploys.
- Every change comes with tests, and with updates to `docs.md` files, this file and `README.md` whenever behavior changes.
- Do not hit the live Substack feed in tests. Use the XML fixtures in `src/lib/server/fixtures` and inject a fake `fetch`.
- Keep the Cloudflare adapter on 7.x while the app is on SvelteKit 2 (adapter 8 requires SvelteKit 3).

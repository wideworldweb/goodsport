# Good Sport

A bare page listing the posts from the Good Sport NYC Substack (https://www.goodsportnyc.com/feed): the feed title, then each post as a link with its publish date. SvelteKit (Svelte 5) deployed as a Cloudflare Worker. There is no server-side database or secrets yet.

## Commands

```sh
npm install
npm run dev                    # vite dev server
npm test                       # vitest
npm run check                  # svelte-check / TypeScript
npm run build                  # build the Worker into .svelte-kit/cloudflare
npx wrangler dev               # run the built Worker locally in workerd (build first)
npx wrangler deploy --dry-run  # validate wrangler.jsonc and the bundle without deploying
```

CI (`.github/workflows/ci.yml`) runs `npm ci`, test, check and build on pull requests and on `main`. CI does not deploy.

## Deploying (GitHub → Cloudflare)

Deploys are meant to run through Cloudflare's Git integration (Workers Builds). **This is not connected yet.** One-time setup in the Cloudflare dashboard:

1. **Connect the repo**: Workers & Pages → Create → Workers → Import a repository → pick this repo. Settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Production branch: `main`
2. **Domain**: Worker → Settings → Domains & Routes → add the custom domain when one is chosen (until then it serves on its `workers.dev` URL).
   - The edge response cache (adapter-cloudflare's use of the Cache API, `caches.default`) is reliable only on a custom domain and is not guaranteed on `workers.dev`. Until a custom domain is attached, assume every request runs the Worker and only the per-isolate in-memory feed cache limits requests to Substack.
   - After deploying, verify caching by requesting the page repeatedly and checking the `cf-cache-status` header and response timing.

No secrets or bindings are needed. Once connected, every merge to `main` ships to production.

### Adding a database later

Add a `d1_databases` entry to `wrangler.jsonc` and type the binding on `App.Platform` in `src/app.d.ts` (the sugarcube repo follows the same pattern). If migrations are involved, add them to the deploy command ahead of `wrangler deploy`.

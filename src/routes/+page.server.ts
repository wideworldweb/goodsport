import { getFeed } from '$lib/server/feed';
import { getGames } from '$lib/server/schedule';
import { tickerBands } from '$lib/tickers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	// Schedules use the global fetch: SvelteKit's fetch adds an Origin header, and the PWHL's API answers that with an empty body.
	const [feed, games] = await Promise.all([getFeed(fetch), getGames()]);
	const now = Date.now();
	setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' });
	return { feed, now, tickers: tickerBands(games, feed.posts, now) };
};

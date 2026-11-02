import { getFeed } from '$lib/server/feed';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const feed = await getFeed(fetch);
	setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' });
	return { feed };
};

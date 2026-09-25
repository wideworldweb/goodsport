import { XMLParser } from 'fast-xml-parser';

const FEED_URL = 'https://www.goodsportnyc.com/feed';
const TTL_MS = 10 * 60 * 1000;

export interface Post {
	title: string;
	link: string;
	description: string;
	pubDate: string;
	author: string;
	image: string | null;
}

export interface Feed {
	title: string;
	description: string;
	link: string;
	posts: Post[];
	fetchedAt: number;
}

let cache: Feed | null = null;

function text(value: unknown): string {
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number') return String(value);
	return '';
}

export async function getFeed(fetchFn: typeof fetch = fetch): Promise<Feed> {
	if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache;

	let xml: string;
	try {
		const res = await fetchFn(FEED_URL, {
			headers: { accept: 'application/rss+xml, application/xml' }
		});
		if (!res.ok) throw new Error(`Feed request failed with status ${res.status}`);
		xml = await res.text();
	} catch (err) {
		// Substack occasionally rejects datacenter IPs; serve stale data if we have it
		if (cache) return cache;
		throw err;
	}

	const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
	const doc = parser.parse(xml);
	const channel = doc?.rss?.channel;
	if (!channel) throw new Error('Unexpected feed format: missing <channel>');

	const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);

	const posts: Post[] = rawItems.map((item: Record<string, unknown>) => ({
		title: text(item.title),
		link: text(item.link),
		description: text(item.description),
		pubDate: new Date(text(item.pubDate)).toISOString(),
		author: text(item['dc:creator']),
		image: (item.enclosure as Record<string, string> | undefined)?.['@_url'] ?? null
	}));

	cache = {
		title: text(channel.title),
		description: text(channel.description),
		link: text(channel.link),
		posts,
		fetchedAt: Date.now()
	};
	return cache;
}

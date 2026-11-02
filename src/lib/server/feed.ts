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

function parseFeed(xml: string): Feed {
	const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
	const doc = parser.parse(xml);
	const channel = doc?.rss?.channel;
	if (!channel) throw new Error('Unexpected feed format: missing <channel>');

	const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);

	const posts: Post[] = rawItems.flatMap((item: Record<string, unknown>) => {
		const published = new Date(text(item.pubDate));
		if (Number.isNaN(published.getTime())) return [];
		return {
			title: text(item.title),
			link: text(item.link),
			description: text(item.description),
			pubDate: published.toISOString(),
			author: text(item['dc:creator']),
			image: (item.enclosure as Record<string, string> | undefined)?.['@_url'] ?? null
		};
	});

	return {
		title: text(channel.title),
		description: text(channel.description),
		link: text(channel.link),
		posts,
		fetchedAt: Date.now()
	};
}

async function fetchFeed(fetchFn: typeof fetch): Promise<Feed> {
	const res = await fetchFn(FEED_URL, {
		headers: { accept: 'application/rss+xml, application/xml' }
	});
	if (!res.ok) throw new Error(`Feed request failed with status ${res.status}`);
	return parseFeed(await res.text());
}

export async function getFeed(fetchFn: typeof fetch = fetch): Promise<Feed> {
	if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache;

	try {
		cache = await fetchFeed(fetchFn);
	} catch (err) {
		// Substack occasionally rejects datacenter IPs or serves a challenge page; serve stale data if we have it
		if (!cache) throw err;
		console.warn('Serving stale feed after fetch failure', err);
		return cache;
	}
	return cache;
}

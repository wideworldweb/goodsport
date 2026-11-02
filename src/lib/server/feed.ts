import { XMLParser } from 'fast-xml-parser';

const FEED_URL = 'https://www.goodsportnyc.com/feed';
const TTL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 5000;

export interface Post {
	title: string;
	link: string;
	description: string;
	pubDate: string;
	author: string;
	image: string | null;
	audio: string | null;
}

export interface Feed {
	title: string;
	description: string;
	link: string;
	posts: Post[];
	fetchedAt: number;
}

let cache: Feed | null = null;

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

// Substack wraps titles and descriptions in CDATA, so HTML entities inside them reach us undecoded.
function decodeEntities(value: string): string {
	return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
		if (code[0] !== '#') return NAMED_ENTITIES[code.toLowerCase()] ?? match;
		const point = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
		return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
	});
}

function text(value: unknown): string {
	if (typeof value === 'string') return decodeEntities(value.trim());
	if (typeof value === 'number') return String(value);
	return '';
}

function firstImageIn(html: string): string | null {
	return html.match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1] ?? null;
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
		const enclosure = item.enclosure as Record<string, string> | undefined;
		const enclosureType = enclosure?.['@_type'] ?? '';
		const enclosureUrl = enclosure?.['@_url'] ?? null;
		return {
			title: text(item.title),
			link: text(item.link),
			description: text(item.description),
			pubDate: published.toISOString(),
			author: text(item['dc:creator']),
			image: enclosureType.startsWith('image/')
				? enclosureUrl
				: firstImageIn(text(item['content:encoded'])),
			audio: enclosureType.startsWith('audio/') ? enclosureUrl : null
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
		headers: { accept: 'application/rss+xml, application/xml' },
		signal: AbortSignal.timeout(TIMEOUT_MS)
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

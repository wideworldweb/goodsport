import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import badDatesXml from './fixtures/bad-dates.xml?raw';
import feedXml from './fixtures/feed.xml?raw';
import singleItemXml from './fixtures/single-item.xml?raw';

const fixtures: Record<string, string> = {
	'feed.xml': feedXml,
	'single-item.xml': singleItemXml,
	'bad-dates.xml': badDatesXml
};

const TEN_MINUTES = 10 * 60 * 1000;

function fakeFetch(...responses: Array<() => Response>) {
	let call = 0;
	return (async () => responses[Math.min(call++, responses.length - 1)]()) as typeof fetch;
}

const ok = (name: string) => () => new Response(fixtures[name], { status: 200 });

async function loadGetFeed() {
	vi.resetModules();
	return (await import('./feed')).getFeed;
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-10-21T12:00:00Z'));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('getFeed', () => {
	it('returns the channel details and every post from a Substack feed', async () => {
		const getFeed = await loadGetFeed();

		const feed = await getFeed(fakeFetch(ok('feed.xml')));

		expect(feed.title).toBe('Good Sport NYC');
		expect(feed.description).toBe(
			'Good Sport NYC is a newsletter and podcast about the culture of women’s sports in New York City.'
		);
		expect(feed.link).toBe('https://www.goodsportnyc.com');
		expect(feed.posts).toEqual([
			{
				title: "[Good Sport NYC] Women's Sports in New York: Oct 19 - 25",
				link: 'https://www.goodsportnyc.com/p/weekly-oct-19',
				description: "Everything you should know this week as a women's sports fan in NYC.",
				pubDate: '2026-10-19T23:43:05.000Z',
				author: 'Christiana Cromer',
				image: 'https://substackcdn.com/image/oct-19.webp'
			},
			{
				title: 'Liberty & Gotham: a season recap',
				link: 'https://www.goodsportnyc.com/p/season-recap',
				description: 'Looking back at the year.',
				pubDate: '2026-10-13T12:00:00.000Z',
				author: 'Christiana Cromer',
				image: null
			}
		]);
	});

	it('returns a single post when the feed has only one item', async () => {
		const getFeed = await loadGetFeed();

		const feed = await getFeed(fakeFetch(ok('single-item.xml')));

		expect(feed.posts.map((p) => p.title)).toEqual(['Hello world']);
	});

	it('skips posts with a missing or invalid publish date and keeps the rest', async () => {
		const getFeed = await loadGetFeed();

		const feed = await getFeed(fakeFetch(ok('bad-dates.xml')));

		expect(feed.posts.map((p) => p.title)).toEqual(['Good date']);
	});

	it('rejects with the status code when the feed request fails and nothing is cached', async () => {
		const getFeed = await loadGetFeed();

		await expect(
			getFeed(fakeFetch(() => new Response('Forbidden', { status: 403 })))
		).rejects.toThrow(/403/);
	});

	it('rejects when the response is not an RSS feed and nothing is cached', async () => {
		const getFeed = await loadGetFeed();

		await expect(
			getFeed(fakeFetch(() => new Response('<html><body>Just a moment...</body></html>')))
		).rejects.toThrow();
	});

	it('serves repeat requests within ten minutes without refetching', async () => {
		const getFeed = await loadGetFeed();
		const fetchFn = fakeFetch(ok('feed.xml'), ok('single-item.xml'));

		await getFeed(fetchFn);
		vi.advanceTimersByTime(TEN_MINUTES - 1);
		const feed = await getFeed(fetchFn);

		expect(feed.posts).toHaveLength(2);
	});

	it('refetches once ten minutes have passed', async () => {
		const getFeed = await loadGetFeed();
		const fetchFn = fakeFetch(ok('feed.xml'), ok('single-item.xml'));

		await getFeed(fetchFn);
		vi.advanceTimersByTime(TEN_MINUTES);
		const feed = await getFeed(fetchFn);

		expect(feed.posts.map((p) => p.title)).toEqual(['Hello world']);
	});

	it.each([
		[
			'throws a network error',
			() => {
				throw new TypeError('fetch failed');
			}
		],
		['is rejected', () => new Response('Forbidden', { status: 403 })],
		['returns something that is not RSS', () => new Response('<html><body>Just a moment...</body></html>')]
	])('serves the last good feed when a refetch %s', async (_, failure) => {
		const getFeed = await loadGetFeed();
		const fetchFn = fakeFetch(ok('feed.xml'), failure);

		await getFeed(fetchFn);
		vi.advanceTimersByTime(TEN_MINUTES);
		const feed = await getFeed(fetchFn);

		expect(feed.posts).toHaveLength(2);
	});
});

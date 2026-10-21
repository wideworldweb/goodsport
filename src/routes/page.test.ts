import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import type { Feed } from '$lib/server/feed';
import Page from './+page.svelte';

function feed(posts: Feed['posts'], title = 'Good Sport NYC'): Feed {
	return {
		title,
		description: 'A newsletter about women’s sports in NYC.',
		link: 'https://www.goodsportnyc.com',
		posts,
		fetchedAt: 0
	};
}

const renderPage = (f: Feed) =>
	render(Page, { props: { data: { feed: f }, params: {} } as never }).body;

describe('home page', () => {
	it('links to every post with its title and publish date', () => {
		const body = renderPage(
			feed([
				{
					title: 'Weekly guide',
					link: 'https://www.goodsportnyc.com/p/weekly',
					description: 'This week.',
					pubDate: '2026-10-19T16:00:00.000Z',
					author: 'Christiana Cromer',
					image: null
				},
				{
					title: 'Season recap',
					link: 'https://www.goodsportnyc.com/p/recap',
					description: 'The year.',
					pubDate: '2026-10-13T16:00:00.000Z',
					author: 'Christiana Cromer',
					image: null
				}
			])
		);

		expect(body).toMatch(/<a href="https:\/\/www\.goodsportnyc\.com\/p\/weekly"[^>]*>Weekly guide<\/a>/);
		expect(body).toMatch(/<a href="https:\/\/www\.goodsportnyc\.com\/p\/recap"[^>]*>Season recap<\/a>/);
		expect(body).toContain('Oct 19, 2026');
		expect(body).toContain('Oct 13, 2026');
	});

	it('shows publish dates in New York time', () => {
		const body = renderPage(
			feed([
				{
					title: 'Sunday night guide',
					link: 'https://www.goodsportnyc.com/p/sunday',
					description: '',
					pubDate: '2026-10-19T02:30:00.000Z',
					author: '',
					image: null
				}
			])
		);

		expect(body).toContain('Oct 18, 2026');
	});

	it('renders the feed title when there are no posts yet', () => {
		const body = renderPage(feed([], 'Test Feed Title'));

		expect(body).toMatch(/<h1[^>]*>Test Feed Title<\/h1>/);
	});
});

import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import type { Feed, Post } from '$lib/server/feed';
import Page from './+page.svelte';

const NOW = Date.parse('2026-10-20T16:00:00.000Z');

function feed(posts: Post[], title = 'Good Sport NYC'): Feed {
	return {
		title,
		description: 'A newsletter about women’s sports in NYC.',
		link: 'https://www.goodsportnyc.com',
		posts,
		fetchedAt: 0
	};
}

function post(overrides: Partial<Post>): Post {
	return {
		title: 'Untitled',
		link: 'https://www.goodsportnyc.com/p/untitled',
		description: '',
		pubDate: '2026-10-19T16:00:00.000Z',
		author: 'Christiana Cromer',
		image: null,
		...overrides
	};
}

const weeklyIssue = post({
	title: "[Good Sport NYC] Women's Sports in New York: Oct 19 - 25",
	link: 'https://www.goodsportnyc.com/p/oct-19-25',
	description: 'Everything you should know this week as a women’s sports fan in NYC.',
	pubDate: '2026-10-19T16:00:00.000Z',
	image: 'https://substackcdn.com/image/fetch/oct-19.jpg'
});

const renderPage = (f: Feed, now = NOW) =>
	render(Page, { props: { data: { feed: f, now }, params: {} } as never }).body;

const decode = (s: string) =>
	s
		.replace(/&#39;|&#x27;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');

const textOf = (html: string) =>
	decode(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' '))
		.replace(/\s+/g, ' ')
		.trim();

const attr = (tag: string, name: string) =>
	decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? '');

const links = (html: string) =>
	[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attrs, inner]) => ({
		href: attr(attrs, 'href'),
		text: textOf(inner)
	}));

const images = (html: string) =>
	[...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => ({ src: attr(tag, 'src'), alt: attr(tag, 'alt') }));

const headings = (html: string) =>
	[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(([, inner]) => textOf(inner));

const listItems = (html: string) =>
	[...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, inner]) => inner);

describe('home page hero', () => {
	it('headlines the newest post without the newsletter prefix and links to it', () => {
		const body = renderPage(feed([weeklyIssue]));

		expect(headings(body)).toEqual(["Women's Sports in New York: Oct 19 - 25"]);
		expect(textOf(body)).not.toContain('[Good Sport NYC]');
		expect(links(body)).toContainEqual({
			href: 'https://www.goodsportnyc.com/p/oct-19-25',
			text: "Read this week's issue"
		});
		expect(textOf(body)).toContain('Everything you should know this week as a women’s sports fan in NYC.');
	});

	it('labels a weekly issue with the date range from its title, set with an en dash', () => {
		expect(textOf(renderPage(feed([weeklyIssue])))).toMatch(/Latest issue\W+Oct 19 – 25/);
	});

	it('labels a post without a date range with its New York publish date', () => {
		const body = renderPage(
			feed([
				post({
					title: 'WNBA Finals Game 6 Moves to a Workday Matinee',
					pubDate: '2026-10-27T02:30:00.000Z'
				})
			])
		);

		expect(textOf(body)).toMatch(/Latest issue\W+Oct 26\b/);
	});

	it('says how long ago the newest post went out', () => {
		const at = (iso: string) => textOf(renderPage(feed([weeklyIssue]), Date.parse(iso)));

		expect(at('2026-10-19T19:00:00.000Z')).toContain('3 hours ago');
		expect(at('2026-10-20T16:00:00.000Z')).toContain('1 day ago');
		expect(at('2026-10-22T17:00:00.000Z')).toContain('3 days ago');
	});

	it('shows the newest post’s image with its title as alt text', () => {
		expect(images(renderPage(feed([weeklyIssue])))).toContainEqual({
			src: 'https://substackcdn.com/image/fetch/oct-19.jpg',
			alt: "Women's Sports in New York: Oct 19 - 25"
		});
	});

	it('renders the hero without a photo when the newest post has no image', () => {
		const body = renderPage(feed([post({ title: 'No photo this week' })]));

		expect(headings(body)).toEqual(['No photo this week']);
		expect(images(body).map((img) => img.alt)).toEqual(['Good Sport NYC']);
	});
});

describe('home page chrome', () => {
	it('shows the tagline, logo, nav and subscribe link even with no posts', () => {
		const body = renderPage(feed([], 'Test Feed Title'));
		const hrefs = links(body).map((link) => link.href);

		expect(textOf(body).toLowerCase()).toContain("women's sports culture in new york city");
		expect(images(body).map((img) => img.alt)).toContain('Test Feed Title');
		expect(links(body)).toContainEqual({
			href: 'https://www.goodsportnyc.com/subscribe',
			text: 'Subscribe'
		});
		expect(hrefs).toContain('https://www.goodsportnyc.com/podcast');
		expect(hrefs).toContain('https://www.goodsportnyc.com/about');
		expect(headings(body)).toEqual([]);
	});
});

describe('home page post list', () => {
	it('lists older posts below the hero as links with their New York publish dates', () => {
		const items = listItems(
			renderPage(
				feed([
					weeklyIssue,
					post({
						title: 'Season recap',
						link: 'https://www.goodsportnyc.com/p/recap',
						pubDate: '2026-10-13T16:00:00.000Z'
					}),
					post({
						title: 'Sunday night guide',
						link: 'https://www.goodsportnyc.com/p/sunday',
						pubDate: '2026-10-12T02:30:00.000Z'
					})
				])
			)
		);

		const recap = items.find((li) => textOf(li).includes('Season recap'))!;
		const sunday = items.find((li) => textOf(li).includes('Sunday night guide'))!;
		expect(links(recap)).toContainEqual({ href: 'https://www.goodsportnyc.com/p/recap', text: 'Season recap' });
		expect(textOf(recap)).toContain('Oct 13, 2026');
		expect(textOf(sunday)).toContain('Oct 11, 2026');
	});

	it('does not repeat the newest post in the list', () => {
		const items = listItems(renderPage(feed([weeklyIssue, post({ title: 'Season recap' })])));

		expect(items.flatMap(links).map((link) => link.href)).not.toContain(weeklyIssue.link);
	});
});

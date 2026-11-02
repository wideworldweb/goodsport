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
		audio: null,
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
		expect(images(body).filter((img) => img.src !== '/logo.png')).toEqual([]);
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

const section = (html: string, heading: string) => {
	const at = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].find(
		(match) => textOf(match[1]).toLowerCase() === heading.toLowerCase()
	)?.index;
	if (at === undefined) return null;
	const end = html.indexOf('</section>', at);
	return html.slice(at, end < 0 ? undefined : end);
};

const issue = (n: number, day: number) =>
	post({
		title: `[Good Sport NYC] Women's Sports in New York: Sep ${day} - ${day + 6}`,
		link: `https://www.goodsportnyc.com/p/issue-${n}`,
		pubDate: `2026-09-${String(day).padStart(2, '0')}T16:00:00.000Z`,
		image: `https://substackcdn.com/image/issue-${n}.jpg`
	});

const episode = (title: string, slug: string, pubDate: string, description = '') =>
	post({
		title,
		description,
		link: `https://www.goodsportnyc.com/p/${slug}`,
		pubDate,
		image: `https://substackcdn.com/image/${slug}.png`,
		audio: `https://api.substack.com/feed/podcast/${slug}.mp3`
	});

const usOpen = post({
	title: 'Everything at stake at the US Open Women’s Semifinals',
	link: 'https://www.goodsportnyc.com/p/us-open',
	description: 'Q&A with Ryan Willison on the stakes for the four women left.',
	pubDate: '2026-09-10T16:00:00.000Z',
	image: 'https://substackcdn.com/image/us-open.jpg'
});

const fullFeed = feed([
	weeklyIssue,
	episode(
		'Meaning Making in Sports Media with Harry Krinsky',
		'harry',
		'2026-10-15T11:00:00.000Z',
		'Listen now (66 mins) | I talked to the co-host of Nothing But Respect about making meaning in sports.'
	),
	issue(1, 21),
	episode('The Sports Media Nepisode with Ashtyn Butuso', 'ashtyn', '2026-10-01T11:00:00.000Z'),
	issue(2, 14),
	episode("Inside Pro Women's Rugby with NY Exiles' Faith Morley", 'faith', '2026-09-18T11:00:00.000Z'),
	usOpen,
	issue(3, 7),
	issue(4, 1),
	episode(
		'Why I’m Building a Women’s Sports Media Company',
		'why',
		'2026-08-28T11:00:00.000Z',
		'Listen now | The origin story and the big vision for Good Sport.'
	),
	episode('Are the New York Liberty okay?', 'liberty', '2026-08-14T11:00:00.000Z')
]);

describe('the latest section', () => {
	it('features the newest regular post with its image, date and description', () => {
		const latest = section(renderPage(fullFeed), 'The Latest')!;

		expect(links(latest)).toContainEqual({
			href: 'https://www.goodsportnyc.com/p/us-open',
			text: 'Everything at stake at the US Open Women’s Semifinals'
		});
		expect(images(latest).map((img) => img.src)).toContain('https://substackcdn.com/image/us-open.jpg');
		expect(textOf(latest)).toContain('Q&A with Ryan Willison on the stakes for the four women left.');
		expect(textOf(latest)).toMatch(/Newsletter\W+Sep 10/);
	});

	it('numbers the three newest weekly issues after the hero, without the newsletter prefix', () => {
		const latest = section(renderPage(fullFeed), 'The Latest')!;
		const text = textOf(latest);

		expect(text).toMatch(
			/01[\s\S]*Women's Sports in New York: Sep 21 - 27[\s\S]*02[\s\S]*Women's Sports in New York: Sep 14 - 20[\s\S]*03[\s\S]*Women's Sports in New York: Sep 7 - 13/
		);
		expect(text).not.toContain('Sep 1 - 7');
		expect(text).not.toContain('[Good Sport NYC]');
		expect(links(latest).map((link) => link.href)).not.toContain(weeklyIssue.link);
	});

	it('links to the full archive', () => {
		expect(links(section(renderPage(fullFeed), 'The Latest')!)).toContainEqual({
			href: 'https://www.goodsportnyc.com/archive',
			text: 'See all'
		});
	});

	it('shows dates in New York time', () => {
		const late = post({ title: 'Late night post', link: 'https://www.goodsportnyc.com/p/late', pubDate: '2026-09-11T02:30:00.000Z' });
		const latest = section(renderPage(feed([weeklyIssue, late])), 'The Latest')!;

		expect(textOf(latest)).toMatch(/Sep 10\b/);
	});
});

describe('the podcast section', () => {
	it('shows the four newest episodes, named after their guests, linking to each episode', () => {
		const podcast = section(renderPage(fullFeed), 'The Podcast')!;
		const episodeHrefs = [...new Set(links(podcast).map((link) => link.href).filter((href) => href.includes('/p/')))];

		expect(episodeHrefs).toEqual([
			'https://www.goodsportnyc.com/p/harry',
			'https://www.goodsportnyc.com/p/ashtyn',
			'https://www.goodsportnyc.com/p/faith',
			'https://www.goodsportnyc.com/p/why'
		]);
		const text = textOf(podcast);
		expect(text).toContain('Harry Krinsky');
		expect(text).toContain('Ashtyn Butuso');
		expect(text).toContain('Faith Morley');
	});

	it('uses a short card name for episodes whose titles do not name a guest', () => {
		const podcast = section(renderPage(fullFeed), 'The Podcast')!;

		expect(links(podcast).map((link) => link.text)).toContain('Why Good Sport');
	});

	it('lists each episode’s full title and description under its card, without the listen-now prefix', () => {
		const podcast = section(renderPage(fullFeed), 'The Podcast')!;
		const text = textOf(podcast);

		expect(links(podcast)).toContainEqual({
			href: 'https://www.goodsportnyc.com/p/harry',
			text: 'Meaning Making in Sports Media with Harry Krinsky'
		});
		expect(text).toContain('I talked to the co-host of Nothing But Respect about making meaning in sports.');
		expect(text).toContain('The origin story and the big vision for Good Sport.');
		expect(text).not.toContain('Listen now');
		expect(text).toMatch(/Podcast\W+Oct 15/);
	});

	it('links to all episodes', () => {
		expect(links(section(renderPage(fullFeed), 'The Podcast')!)).toContainEqual({
			href: 'https://www.goodsportnyc.com/podcast',
			text: 'All episodes'
		});
	});

	it('does not repeat an episode that is already the hero', () => {
		const heroEpisode = episode('Fresh episode with Sue Bird', 'sue', '2026-10-28T11:00:00.000Z');
		const podcast = section(renderPage(feed([heroEpisode, ...fullFeed.posts])), 'The Podcast')!;

		expect(links(podcast).map((link) => link.href)).not.toContain(heroEpisode.link);
	});
});

describe('sections without posts', () => {
	it('leaves out the latest and podcast sections when there is nothing to show', () => {
		const body = renderPage(feed([weeklyIssue]));

		expect(section(body, 'The Latest')).toBeNull();
		expect(section(body, 'The Podcast')).toBeNull();
	});
});

const forms = (html: string) =>
	[...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)].map(([, attrs, inner]) => ({
		action: attr(attrs, 'action'),
		method: attr(attrs, 'method').toLowerCase(),
		inputs: [...inner.matchAll(/<input\b[^>]*>/g)].map(([tag]) => ({
			name: attr(tag, 'name'),
			type: attr(tag, 'type'),
			required: /\srequired(?:=""|\s|>|\/)/.test(tag)
		})),
		buttons: [...inner.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map(([, text]) => textOf(text))
	}));

describe('the instagram section', () => {
	it('links to the Good Sport Instagram account', () => {
		const instagram = section(renderPage(fullFeed), 'On Instagram')!;

		expect(links(instagram)).toContainEqual({
			href: 'https://www.instagram.com/goodsport.nyc/',
			text: 'Follow @goodsportnyc'
		});
	});
});

describe('the subscribe section', () => {
	it('sends the reader’s email to the Substack subscribe page', () => {
		const subscribe = section(renderPage(feed([])), 'Your week in women’s sports, in your inbox.')!;

		expect(forms(subscribe)).toEqual([
			{
				action: 'https://www.goodsportnyc.com/subscribe',
				method: 'get',
				inputs: [{ name: 'email', type: 'email', required: true }],
				buttons: ['Subscribe']
			}
		]);
	});
});

describe('the footer', () => {
	it('links to the site’s sections and Good Sport elsewhere', () => {
		const footer = renderPage(feed([])).match(/<footer\b[\s\S]*<\/footer>/)![0];
		const byText = Object.fromEntries(links(footer).map((link) => [link.text, link.href]));

		expect(byText).toMatchObject({
			News: 'https://www.goodsportnyc.com',
			Podcast: 'https://www.goodsportnyc.com/podcast',
			'NYC Weekly': 'https://www.goodsportnyc.com/archive',
			About: 'https://www.goodsportnyc.com/about',
			Instagram: 'https://www.instagram.com/goodsport.nyc/',
			Substack: 'https://www.goodsportnyc.com',
			Subscribe: 'https://www.goodsportnyc.com/subscribe'
		});
		expect(Object.keys(byText)).toEqual(expect.arrayContaining(['Discord', 'Donate']));
	});
});

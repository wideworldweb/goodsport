import { describe, expect, it } from 'vitest';
import type { Post } from '$lib/server/feed';
import type { Game } from '$lib/server/schedule';
import { tickerBands } from './tickers';

const NOW = Date.parse('2026-11-02T16:00:00Z');

const game = (overrides: Partial<Game>): Game => ({
	team: 'Sirens',
	opponent: 'Fleet',
	home: true,
	start: '2026-12-06T20:00:00.000Z',
	venue: 'Prudential Center',
	final: false,
	teamScore: null,
	opponentScore: null,
	...overrides
});

const post = (title: string, audio: string | null = null): Post => ({
	title,
	link: 'https://www.goodsportnyc.com/p/x',
	description: '',
	pubDate: '2026-10-19T16:00:00.000Z',
	author: '',
	image: null,
	audio
});

describe('up next band', () => {
	it('shows each team’s next game in New York time, soonest first', () => {
		const [upNext] = tickerBands(
			[
				game({}),
				game({ start: '2026-12-12T17:00:00.000Z', opponent: 'Detroit', home: false, venue: 'Little Caesars Arena' }),
				game({ team: 'Gotham FC', opponent: 'Bay FC', home: false, start: '2026-11-09T02:30:00.000Z', venue: 'PayPal Park' })
			],
			[],
			NOW
		);

		expect(upNext.slice(0, 2)).toEqual([
			'Gotham FC at Bay FC, Sun Nov 8, 9:30PM, PayPal Park',
			'Sirens vs Fleet, Sun Dec 6, 3PM, Prudential Center'
		]);
	});

	it('says when an off-season team is back', () => {
		const [upNext] = tickerBands([game({})], [], NOW);

		expect(upNext).toContain('Liberty: Back in May');
		expect(upNext).toContain('Gotham FC: Back in March');
		expect(upNext).not.toContain('Sirens: Back in December');
	});

	it('treats a game more than six weeks out as the off-season', () => {
		const [upNext] = tickerBands([game({ team: 'Liberty', start: '2027-05-15T23:00:00.000Z' })], [], NOW);

		expect(upNext).toContain('Liberty: Back in May');
	});
});

describe('results band', () => {
	it('shows each team’s latest final from the last three weeks, with the team’s score first', () => {
		const [, results] = tickerBands(
			[
				game({ team: 'Gotham FC', opponent: 'Royals', start: '2026-11-01T19:00:00.000Z', final: true, teamScore: 2, opponentScore: 0 }),
				game({ team: 'Gotham FC', opponent: 'Spirit', start: '2026-10-25T19:00:00.000Z', final: true, teamScore: 1, opponentScore: 1 }),
				game({ team: 'Brooklyn FC', opponent: 'Sporting JAX', start: '2026-10-31T18:00:00.000Z', final: true, teamScore: 4, opponentScore: 4 }),
				game({ team: 'Liberty', opponent: 'Dream', start: '2026-10-09T23:30:00.000Z', final: true, teamScore: 83, opponentScore: 85 })
			],
			[],
			NOW
		);

		expect(results).toEqual(['Gotham FC 2-0 Royals', 'Brooklyn FC 4-4 Sporting JAX']);
	});

	it('falls back to what is coming up when nobody has played lately', () => {
		const [upNext, results] = tickerBands([game({})], [], NOW);

		expect(results).toEqual(upNext);
	});
});

describe('every band', () => {
	it('only uses separators the pixel font draws at the right height', () => {
		const bands = tickerBands(
			[{ team: 'Sirens', opponent: 'Fleet', home: true, start: '2026-12-06T20:00:00.000Z', venue: 'Prudential Center', final: false, teamScore: null, opponentScore: null }],
			[post('Meaning Making with Harry Krinsky', 'https://x/ep.mp3')],
			NOW
		);

		expect(bands.flat().join(' ')).not.toMatch(/[·•–—’‘“”]/);
	});
});

describe('good sport band', () => {
	it('names the newest issue and newest episode with straight apostrophes', () => {
		const [, , ours] = tickerBands(
			[],
			[
				post('WNBA Finals Game 6 Moves to a Workday Matinee'),
				post("[Good Sport NYC] Women’s Sports in New York: Oct 19 - 25"),
				post('Meaning Making in Sports Media with Harry Krinsky', 'https://x/ep.mp3')
			],
			NOW
		);

		expect(ours).toEqual([
			"New issue: Women's Sports in New York: Oct 19 - 25",
			'New on the pod: Harry Krinsky',
			'Latest: WNBA Finals Game 6 Moves to a Workday Matinee'
		]);
	});
});

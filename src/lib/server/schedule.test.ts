import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import gotham from './fixtures/espn-gotham.json?raw';
import liberty from './fixtures/espn-liberty.json?raw';
import pwhlSchedule10 from './fixtures/pwhl-schedule-10.json?raw';
import pwhlSchedule11 from './fixtures/pwhl-schedule-11.json?raw';
import pwhlSeasons from './fixtures/pwhl-seasons.json?raw';

type Route = [RegExp, () => Response];

const json = (body: string) => () => new Response(body, { status: 200 });
const fails = () => () => new Response('nope', { status: 503 });

const routes: Route[] = [
	[/basketball\/wnba\/teams\/ny\/schedule/, json(liberty)],
	[/usa\.nwsl\/teams\/15364\/schedule/, json(gotham)],
	[/usa\.w\.usl\.1\/teams\/131452\/schedule/, json('{"events":[]}')],
	[/view=seasons/, json(pwhlSeasons)],
	[/view=schedule.*season_id=11/, json(pwhlSchedule11)],
	[/view=schedule.*season_id=10/, json(pwhlSchedule10)]
];

function fakeFetch(overrides: Route[] = []) {
	const calls: string[] = [];
	const fetchFn = (async (input: RequestInfo | URL) => {
		const url = String(input);
		calls.push(url);
		const route = [...overrides, ...routes].find(([pattern]) => pattern.test(url));
		if (!route) throw new Error(`Unexpected request ${url}`);
		return route[1]();
	}) as typeof fetch;
	return { fetchFn, calls };
}

async function loadGetGames() {
	vi.resetModules();
	return (await import('./schedule')).getGames;
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-11-02T16:00:00Z'));
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('getGames', () => {
	it('collects each team’s games from ESPN and the PWHL', async () => {
		const getGames = await loadGetGames();

		const games = await getGames(fakeFetch().fetchFn);

		expect(games).toEqual(
			expect.arrayContaining([
				{
					team: 'Gotham FC',
					opponent: 'Royals',
					home: true,
					start: '2026-11-01T19:00:00.000Z',
					venue: 'Sports Illustrated Stadium',
					final: true,
					teamScore: 2,
					opponentScore: 0
				},
				{
					team: 'Gotham FC',
					opponent: 'Bay FC',
					home: false,
					start: '2026-11-09T02:00:00.000Z',
					venue: 'PayPal Park',
					final: false,
					teamScore: null,
					opponentScore: null
				},
				{
					team: 'Liberty',
					opponent: 'Dream',
					home: true,
					start: '2026-10-09T23:30:00.000Z',
					venue: 'Barclays Center',
					final: true,
					teamScore: 83,
					opponentScore: 85
				},
				{
					team: 'Sirens',
					opponent: 'Fleet',
					home: true,
					start: '2026-12-06T20:00:00.000Z',
					venue: 'Prudential Center',
					final: false,
					teamScore: null,
					opponentScore: null
				},
				{
					team: 'Sirens',
					opponent: 'Detroit',
					home: false,
					start: '2026-12-12T17:00:00.000Z',
					venue: 'Little Caesars Arena',
					final: false,
					teamScore: null,
					opponentScore: null
				}
			])
		);
		expect(games.filter((game) => game.team === 'Sirens')).toHaveLength(2);
	});

	it('leaves out a team whose source is down and keeps the rest', async () => {
		const getGames = await loadGetGames();

		const games = await getGames(fakeFetch([[/usa\.nwsl/, fails()]]).fetchFn);

		expect(games.some((game) => game.team === 'Gotham FC')).toBe(false);
		expect(games.some((game) => game.team === 'Sirens')).toBe(true);
	});

	it('does not refetch within ten minutes', async () => {
		const getGames = await loadGetGames();
		const { fetchFn, calls } = fakeFetch();

		await getGames(fetchFn);
		const firstRound = calls.length;
		vi.advanceTimersByTime(5 * 60 * 1000);
		await getGames(fetchFn);

		expect(calls.length).toBe(firstRound);
	});
});

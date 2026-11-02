const TTL_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports';
const PWHL = 'https://lscluster.hockeytech.com/feed/index.php?feed=modulekit&key=694cfeed58c932ee&client_code=pwhl&fmt=json';
const HEADERS = { 'user-agent': 'goodsport-site/1.0', accept: 'application/json' };

export interface Game {
	team: string;
	opponent: string;
	home: boolean;
	start: string;
	venue: string;
	final: boolean;
	teamScore: number | null;
	opponentScore: number | null;
}

type Source = { kind: 'espn'; path: string } | { kind: 'pwhl'; teamName: string };

export interface Team {
	name: string;
	/** Month the next season starts, shown while the team has nothing scheduled. */
	returns: string;
	source: Source;
}

export const TEAMS: Team[] = [
	{ name: 'Liberty', returns: 'May', source: { kind: 'espn', path: 'basketball/wnba/teams/ny' } },
	{ name: 'Gotham FC', returns: 'March', source: { kind: 'espn', path: 'soccer/usa.nwsl/teams/15364' } },
	{ name: 'Brooklyn FC', returns: 'March', source: { kind: 'espn', path: 'soccer/usa.w.usl.1/teams/131452' } },
	{ name: 'Sirens', returns: 'December', source: { kind: 'pwhl', teamName: 'New York Sirens' } }
];

let cache: { games: Game[]; fetchedAt: number } | null = null;

async function getJson<T>(fetchFn: typeof fetch, url: string): Promise<T> {
	const res = await fetchFn(url, { headers: HEADERS });
	if (!res.ok) throw new Error(`${url} responded ${res.status}`);
	return res.json() as Promise<T>;
}

interface EspnCompetitor {
	homeAway: 'home' | 'away';
	team: { id: string; shortDisplayName: string };
	score?: { value: number } | string;
}

interface EspnSchedule {
	team: { id: string };
	events: {
		date: string;
		competitions: {
			venue?: { fullName?: string };
			status: { type: { completed: boolean } };
			competitors: EspnCompetitor[];
		}[];
	}[];
}

const espnScore = (competitor: EspnCompetitor) => {
	if (competitor.score === undefined) return null;
	const value = typeof competitor.score === 'string' ? Number(competitor.score) : competitor.score.value;
	return Number.isFinite(value) ? value : null;
};

async function espnGames(fetchFn: typeof fetch, team: Team, path: string): Promise<Game[]> {
	const schedule = await getJson<EspnSchedule>(fetchFn, `${ESPN}/${path}/schedule`);
	return schedule.events.flatMap((event) => {
		const competition = event.competitions[0];
		const us = competition?.competitors.find((c) => c.team.id === schedule.team.id);
		const them = competition?.competitors.find((c) => c.team.id !== schedule.team.id);
		if (!us || !them) return [];
		const final = competition.status.type.completed;
		return {
			team: team.name,
			opponent: them.team.shortDisplayName,
			home: us.homeAway === 'home',
			start: new Date(event.date).toISOString(),
			venue: competition.venue?.fullName ?? '',
			final,
			teamScore: final ? espnScore(us) : null,
			opponentScore: final ? espnScore(them) : null
		};
	});
}

interface PwhlSeason {
	season_id: string;
	start_date: string;
	end_date: string;
}

interface PwhlGame {
	home_team_name: string;
	visiting_team_name: string;
	home_team_nickname: string;
	visiting_team_nickname: string;
	GameDateISO8601: string;
	venue_name: string;
	final: string;
	home_goal_count: string;
	visiting_goal_count: string;
}

async function pwhlGames(fetchFn: typeof fetch, team: Team, teamName: string): Promise<Game[]> {
	const { SiteKit } = await getJson<{ SiteKit: { Seasons: PwhlSeason[] } }>(fetchFn, `${PWHL}&view=seasons`);
	const now = Date.now();
	const relevant = SiteKit.Seasons.filter(
		(season) =>
			Date.parse(season.end_date) >= now - 21 * DAY_MS && Date.parse(season.start_date) <= now + 45 * DAY_MS
	);
	const schedules = await Promise.all(
		relevant.map((season) =>
			getJson<{ SiteKit: { Schedule: PwhlGame[] } }>(fetchFn, `${PWHL}&view=schedule&season_id=${season.season_id}`)
		)
	);
	return schedules
		.flatMap((schedule) => schedule.SiteKit.Schedule)
		.filter((game) => game.home_team_name === teamName || game.visiting_team_name === teamName)
		.map((game) => {
			const home = game.home_team_name === teamName;
			const final = game.final === '1';
			const [teamGoals, opponentGoals] = home
				? [game.home_goal_count, game.visiting_goal_count]
				: [game.visiting_goal_count, game.home_goal_count];
			return {
				team: team.name,
				opponent: home ? game.visiting_team_nickname : game.home_team_nickname,
				home,
				start: new Date(game.GameDateISO8601).toISOString(),
				venue: game.venue_name.split('|')[0].trim(),
				final,
				teamScore: final ? Number(teamGoals) : null,
				opponentScore: final ? Number(opponentGoals) : null
			};
		});
}

function teamGames(fetchFn: typeof fetch, team: Team): Promise<Game[]> {
	return team.source.kind === 'espn'
		? espnGames(fetchFn, team, team.source.path)
		: pwhlGames(fetchFn, team, team.source.teamName);
}

export async function getGames(fetchFn: typeof fetch = fetch): Promise<Game[]> {
	if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.games;

	const results = await Promise.allSettled(TEAMS.map((team) => teamGames(fetchFn, team)));
	const games = results.flatMap((result, i) => {
		if (result.status === 'fulfilled') return result.value;
		// One league's API being down shouldn't blank the tickers; that team just drops out until the next refresh.
		console.warn(`Schedule unavailable for ${TEAMS[i].name}`, result.reason);
		return [];
	});
	cache = { games, fetchedAt: Date.now() };
	return games;
}

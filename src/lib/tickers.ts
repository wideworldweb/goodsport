import { episodeName, headline, isEpisode, isIssue } from '$lib/post';
import type { Post } from '$lib/server/feed';
import { TEAMS, type Game } from '$lib/server/schedule';

const DAY_MS = 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW = 42 * DAY_MS;
const RESULTS_WINDOW = 21 * DAY_MS;

const timeZone = 'America/New_York';
const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone });
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone });

// The ticker's pixel font has no curly quotes or long dashes.
const plain = (text: string) => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-');

function kickoff(iso: string): string {
	const date = new Date(iso);
	const time = timeFmt.format(date).replace(':00', '').replace(' ', '');
	return `${dayFmt.format(date).replace(',', '')} · ${time}`;
}

function upNext(games: Game[], now: number): string[] {
	const next = TEAMS.map((team) =>
		games
			.filter((game) => game.team === team.name && !game.final)
			.filter((game) => Date.parse(game.start) >= now && Date.parse(game.start) - now <= UPCOMING_WINDOW)
			.sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0]
	);
	const scheduled = next
		.filter((game): game is Game => game !== undefined)
		.sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
		.map((game) =>
			[`${game.team} ${game.home ? 'vs' : 'at'} ${game.opponent}`, kickoff(game.start), game.venue]
				.filter(Boolean)
				.join(' · ')
		);
	const offSeason = TEAMS.filter((_, i) => next[i] === undefined).map((team) => `${team.name} · Back in ${team.returns}`);
	return [...scheduled, ...offSeason].map(plain);
}

function results(games: Game[], now: number): string[] {
	return TEAMS.flatMap((team) => {
		const latest = games
			.filter((game) => game.team === team.name && game.final && game.teamScore !== null)
			.filter((game) => now - Date.parse(game.start) <= RESULTS_WINDOW)
			.sort((a, b) => Date.parse(b.start) - Date.parse(a.start))[0];
		return latest ? [plain(`${latest.team} ${latest.teamScore}-${latest.opponentScore} ${latest.opponent}`)] : [];
	});
}

function fromPosts(posts: Post[]): string[] {
	const issue = posts.find(isIssue);
	const episode = posts.find(isEpisode);
	const latest = posts.find((post) => !isIssue(post) && !isEpisode(post));
	return [
		issue && `New issue · ${headline(issue.title)}`,
		episode && `New on the pod · ${episodeName(episode.title)}`,
		latest && `Latest · ${latest.title}`
	]
		.filter((item): item is string => Boolean(item))
		.map(plain);
}

/** Text for the three ticker bands: what's coming up, recent results, and Good Sport's own posts. */
export function tickerBands(games: Game[], posts: Post[], now: number): [string[], string[], string[]] {
	const next = upNext(games, now);
	const recent = results(games, now);
	return [next, recent.length > 0 ? recent : next, fromPosts(posts)];
}

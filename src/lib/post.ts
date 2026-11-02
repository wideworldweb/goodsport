import type { Post } from '$lib/server/feed';

const NEWSLETTER_PREFIX = /^\[Good Sport NYC\]\s*/i;
const DATE_RANGE = /([A-Z][a-z]{2,8}\.? \d{1,2}(?:st|nd|rd|th)?)\s*[-–—]\s*((?:[A-Z][a-z]{2,8}\.? )?\d{1,2}(?:st|nd|rd|th)?)\s*$/;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const timeZone = 'America/New_York';
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone });

export const headline = (title: string) => title.replace(NEWSLETTER_PREFIX, '');

export const isEpisode = (post: Post) => post.audio !== null;

export const isIssue = (post: Post) =>
	!isEpisode(post) && (NEWSLETTER_PREFIX.test(post.title) || DATE_RANGE.test(post.title));

export function guestName(title: string): string {
	const guest = title.match(/\bwith\s+(.+)$/i)?.[1];
	if (!guest) return title;
	return guest.replace(/^.*['’]s?\s+/, '');
}

export const shortDateOf = (iso: string) => shortDate.format(new Date(iso));

export function issueLabel(title: string, iso: string): string {
	const range = headline(title).match(DATE_RANGE);
	return range ? `${range[1]} – ${range[2]}` : shortDateOf(iso);
}

export function timeAgo(iso: string, now: number): string {
	const elapsed = Math.max(0, now - new Date(iso).getTime());
	if (elapsed < HOUR_MS) return 'just now';
	if (elapsed < DAY_MS) {
		const hours = Math.floor(elapsed / HOUR_MS);
		return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	}
	const days = Math.floor(elapsed / DAY_MS);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}

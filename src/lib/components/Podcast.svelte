<script lang="ts">
	import type { Post } from '$lib/server/feed';
	import { guestName, shortDateOf } from '$lib/post';
	import SectionHeader from './SectionHeader.svelte';

	let { episodes }: { episodes: Post[] } = $props();

	const tones = ['blue', 'red', 'amber', 'ink'] as const;
</script>

<section class="podcast">
	<SectionHeader title="The Podcast" href="https://www.goodsportnyc.com/podcast" linkText="All episodes" tone="on-cream" />

	<ul>
		{#each episodes as episode, i (episode.link)}
			<li>
				<a class="card {tones[i % tones.length]}" href={episode.link}>
					<span class="name">{guestName(episode.title)}</span>
				</a>
				<p class="meta">Podcast <span aria-hidden="true">•</span> {shortDateOf(episode.pubDate)}</p>
			</li>
		{/each}
	</ul>
</section>

<style>
	.podcast {
		padding: clamp(4rem, 9vw, 8rem) var(--page-pad);
		background: var(--cream);
		color: var(--ink);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		padding: 0 clamp(0.75rem, 1.6vw, 1.5rem);
		border-left: 2px dotted var(--ink);
	}

	li:first-child {
		padding-left: 0;
		border-left: none;
	}

	li:last-child {
		padding-right: 0;
	}

	.card {
		position: relative;
		display: block;
		overflow: hidden;
		aspect-ratio: 3 / 4;
		padding: 1.25rem 1.1rem;
		border-radius: 1.25rem;
		background: var(--bg);
		color: var(--fg);
		text-decoration: none;
		transition: transform 150ms ease-out;
	}

	.card::after {
		content: '';
		position: absolute;
		top: -6%;
		left: -20%;
		width: 150%;
		aspect-ratio: 1 / 0.6;
		border: 4px solid var(--accent);
		border-radius: 50%;
		transform: rotate(-17deg);
		pointer-events: none;
	}

	.card:hover {
		transform: translateY(-4px);
	}

	.blue {
		--bg: var(--blue);
		--fg: var(--cream);
		--accent: var(--cream);
	}

	.red {
		--bg: var(--red);
		--fg: var(--cream);
		--accent: var(--cream);
	}

	.amber {
		--bg: var(--amber);
		--fg: var(--ink);
		--accent: var(--ink);
	}

	.ink {
		--bg: var(--ink);
		--fg: var(--amber);
		--accent: var(--amber);
	}

	.name {
		position: relative;
		display: block;
		font-family: var(--font-condensed);
		font-weight: 800;
		font-size: clamp(2rem, 4.4vw, 4rem);
		line-height: 0.86;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.meta {
		margin: 0.9rem 0 0;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}

	@media (max-width: 48rem) {
		ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			row-gap: 2rem;
		}

		li:nth-child(odd) {
			padding-left: 0;
			border-left: none;
		}
	}
</style>

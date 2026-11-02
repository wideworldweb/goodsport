<script lang="ts">
	import type { Post } from '$lib/server/feed';
	import { episodeName, episodeSummary, shortDateOf } from '$lib/post';
	import SectionHeader from './SectionHeader.svelte';

	let { episodes }: { episodes: Post[] } = $props();

	const tones = ['blue', 'red', 'amber', 'ink'] as const;
</script>

<section class="podcast layer">
	<SectionHeader title="The Podcast" href="https://www.goodsportnyc.com/podcast" linkText="All episodes" tone="on-cream" />

	<ul>
		{#each episodes as episode, i (episode.link)}
			{@const tone = tones[i % tones.length]}
			<li>
				<a
					class="card {tone}"
					class:play-left={tone === 'blue' || tone === 'amber'}
					href={episode.link}
					tabindex="-1"
					aria-hidden="true"
				>
					<span class="name">{episodeName(episode.title)}</span>
					<span class="play" aria-hidden="true"></span>
				</a>
				<p class="meta">Podcast <span aria-hidden="true">•</span> {shortDateOf(episode.pubDate)}</p>
				<h3><a href={episode.link}>{episode.title}</a></h3>
				{#if episodeSummary(episode.description)}
					<p class="summary">{episodeSummary(episode.description)}</p>
				{/if}
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
		--gap: clamp(1.5rem, 3.2vw, 3rem);
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 2rem var(--gap);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		position: relative;
	}

	li + li::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(var(--gap) / -2);
		border-left: 2px dotted var(--ink);
	}

	.card {
		position: relative;
		display: block;
		overflow: hidden;
		aspect-ratio: 1;
		padding: 1rem 0.9rem;
		border-radius: 1rem;
		background: var(--bg);
		color: var(--fg);
		text-decoration: none;
		transition: transform 150ms ease-out;
	}

	.card::before {
		content: '';
		position: absolute;
		top: 22%;
		left: -12%;
		width: 125%;
		aspect-ratio: 1 / 0.6;
		border: 3px solid var(--accent);
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
		--play-bg: var(--cream);
		--play-fg: var(--blue);
	}

	.red {
		--bg: var(--red);
		--fg: var(--cream);
		--accent: var(--cream);
		--play-bg: var(--cream);
		--play-fg: var(--red);
	}

	.amber {
		--bg: var(--amber);
		--fg: var(--ink);
		--accent: var(--ink);
		--play-bg: var(--ink);
		--play-fg: var(--amber);
	}

	.ink {
		--bg: var(--ink);
		--fg: var(--amber);
		--accent: var(--amber);
		--play-bg: var(--amber);
		--play-fg: var(--ink);
	}

	.name {
		position: relative;
		display: block;
		margin-top: 12%;
		font-family: var(--font-condensed);
		font-weight: 800;
		font-size: clamp(2.25rem, 4.8vw, 4.5rem);
		line-height: 0.86;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.play {
		position: absolute;
		right: 0.9rem;
		bottom: 0.9rem;
		width: clamp(2rem, 3vw, 2.4rem);
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--play-bg);
	}

	.play-left .play {
		right: auto;
		left: 0.9rem;
	}

	.play::after {
		content: '';
		position: absolute;
		inset: 0;
		margin: auto;
		width: 32%;
		height: 36%;
		translate: 10% 0;
		background: var(--play-fg);
		clip-path: polygon(0 0, 100% 50%, 0 100%);
	}

	.meta {
		margin: 1rem 0 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h3 {
		margin: 0 0 0.75rem;
		font-size: clamp(1rem, 1.4vw, 1.15rem);
		font-weight: 600;
		line-height: 1.25;
	}

	h3 a {
		text-decoration: none;
	}

	h3 a:hover {
		text-decoration: underline dotted;
		text-underline-offset: 0.15em;
	}

	.summary {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}

	@media (max-width: 48rem) {
		ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		li:nth-child(odd)::before {
			display: none;
		}
	}
</style>

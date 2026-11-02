<script lang="ts">
	import type { Post } from '$lib/server/feed';
	import { headline, shortDateOf } from '$lib/post';
	import SectionHeader from './SectionHeader.svelte';

	let { featured, issues }: { featured: Post | undefined; issues: Post[] } = $props();
</script>

<section class="latest layer">
	<SectionHeader title="The Latest" href="https://www.goodsportnyc.com/archive" linkText="See all" tone="on-blue" />

	<div class="columns">
		{#if featured}
			<article class="featured">
				{#if featured.image}
					<img src={featured.image} alt="" width="1200" height="675" loading="lazy" />
				{/if}
				<p class="meta">Newsletter <span aria-hidden="true">•</span> {shortDateOf(featured.pubDate)}</p>
				<h3><a href={featured.link}>{headline(featured.title)}</a></h3>
				{#if featured.description}
					<p class="description">{featured.description}</p>
				{/if}
			</article>
		{/if}

		{#if issues.length > 0}
			<ol class="issues">
				{#each issues as issue, i (issue.link)}
					<li>
						<span class="number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
						<div>
							<p class="meta">Newsletter <span aria-hidden="true">•</span> {shortDateOf(issue.pubDate)}</p>
							<a href={issue.link}>{headline(issue.title)}</a>
						</div>
						{#if issue.image}
							<img src={issue.image} alt="" width="400" height="300" loading="lazy" />
						{/if}
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</section>

<style>
	.latest {
		padding: clamp(4rem, 9vw, 8rem) var(--page-pad) clamp(3rem, 6vw, 5rem);
		background: var(--blue);
		color: var(--cream);
	}

	.columns {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}

	.featured {
		padding-right: clamp(1.5rem, 3vw, 2.5rem);
	}

	.featured img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border-radius: 1rem;
		margin-bottom: 1.75rem;
	}

	.meta {
		margin: 0 0 0.6rem;
		color: var(--amber);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h3 {
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(1.75rem, 3vw, 2.4rem);
		line-height: 1.05;
	}

	a {
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline dotted;
		text-underline-offset: 0.15em;
	}

	.description {
		margin: 0;
		font-size: 1rem;
		line-height: 1.55;
	}

	.issues {
		margin: 0;
		padding: 0 0 0 clamp(1.5rem, 3vw, 2.5rem);
		list-style: none;
		border-left: 2px dotted currentColor;
	}

	.issues li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) clamp(7rem, 13vw, 12rem);
		gap: 1.25rem;
		align-items: start;
		padding: 0 0 1.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 2px dotted currentColor;
	}

	.issues li:last-child {
		border-bottom: none;
	}

	.number {
		color: var(--amber);
		font-family: var(--font-display);
		font-size: clamp(2rem, 3.4vw, 2.75rem);
		line-height: 1;
	}

	.issues a {
		font-size: clamp(1.1rem, 1.9vw, 1.6rem);
		line-height: 1.25;
	}

	.issues img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: 0.75rem;
	}

	@media (max-width: 48rem) {
		.columns {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}

		.featured {
			padding-right: 0;
		}

		.issues {
			padding-left: 0;
			border-left: none;
		}
	}
</style>

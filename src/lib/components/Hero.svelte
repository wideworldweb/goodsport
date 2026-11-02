<script lang="ts">
	import type { Post } from '$lib/server/feed';
	import { headline, issueLabel, timeAgo } from '$lib/post';

	let { post, byline, now }: { post: Post; byline: string; now: number } = $props();

	const title = $derived(headline(post.title));

	const SPIKES = 14;
	const starburst = Array.from({ length: SPIKES * 2 }, (_, i) => {
		const angle = (Math.PI * i) / SPIKES;
		const radius = i % 2 === 0 ? 50 : 41;
		return `${(50 + radius * Math.cos(angle)).toFixed(1)}% ${(50 + radius * Math.sin(angle)).toFixed(1)}%`;
	}).join(', ');
</script>

<section class="hero layer">
	<div class="copy">
		<p class="label">
			<span class="dot" aria-hidden="true"></span>
			Latest issue
			<span aria-hidden="true">•</span>
			<time datetime={post.pubDate}>{issueLabel(post.title, post.pubDate)}</time>
		</p>
		<h1>{title}</h1>
		{#if post.description}
			<p class="description">{post.description}</p>
		{/if}
		<p class="byline">
			<span class="avatar" aria-hidden="true"></span>
			{byline}
			<span aria-hidden="true">•</span>
			{timeAgo(post.pubDate, now)}
		</p>
		<a class="read" href={post.link}>Read this week's issue</a>
	</div>

	<div class="art">
		{#if post.image}
			<img src={post.image} alt={title} width="900" height="850" />
		{/if}
		<div class="badge" aria-hidden="true">
			<span class="burst" style:clip-path="polygon({starburst})"></span>
			<span class="badge-label">New<br />issue</span>
		</div>
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
		gap: clamp(1.5rem, 5vw, 4rem);
		padding: 1.25rem var(--page-pad) 0;
		background: var(--blue);
		color: var(--cream);
	}

	.copy {
		padding-bottom: 2.5rem;
	}

	.label {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		margin: 0;
		padding-bottom: 1.25rem;
		border-bottom: 2px dotted currentColor;
		color: var(--amber);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background: currentColor;
	}

	h1 {
		margin: 1.5rem 0 1.75rem;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.25rem, 5.6vw, 4.25rem);
		line-height: 0.98;
		letter-spacing: -0.01em;
		text-wrap: balance;
	}

	.description {
		max-width: 26rem;
		margin: 0 0 1.75rem;
		font-size: clamp(1rem, 1.6vw, 1.1rem);
		line-height: 1.45;
	}

	.byline {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		margin: 0 0 2.25rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.avatar {
		width: 1.6rem;
		height: 1.6rem;
		border: 1.5px solid currentColor;
		border-radius: 50%;
	}

	.read {
		display: inline-flex;
		gap: 1.25rem;
		padding: 0.55rem 1rem 0.5rem 0.9rem;
		background: var(--red);
		color: var(--cream);
		font-family: var(--font-pixel);
		font-size: 32px;
		line-height: 1;
		letter-spacing: 0.08em;
		text-decoration: none;
		transition:
			transform 150ms ease-out,
			box-shadow 150ms ease-out;
	}

	.read::after {
		content: '';
		align-self: center;
		width: 0.7em;
		height: 0.7em;
		background: currentColor;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 7' shape-rendering='crispEdges'%3E%3Cpath d='M3 0h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1v-2h-3v-3h3z'/%3E%3C/svg%3E")
			center / contain no-repeat;
	}

	.read:hover {
		transform: translate(-3px, -3px);
		box-shadow: 3px 3px 0 var(--ink);
	}

	.art {
		position: relative;
		display: flex;
	}

	.art:not(:has(img)) {
		min-height: 9rem;
	}

	.art img {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 22rem;
		object-fit: cover;
		border-radius: 1.5rem 1.5rem 0 0;
	}

	.badge {
		position: absolute;
		top: 1.75rem;
		right: 2rem;
		width: clamp(5.5rem, 12vw, 7.25rem);
		aspect-ratio: 1;
		display: grid;
		place-items: center;
	}

	.burst {
		position: absolute;
		inset: 0;
		background: var(--red);
		will-change: transform;
		animation: spin 24s linear infinite;
	}

	.badge-label {
		position: relative;
		color: var(--cream);
		font-family: var(--font-condensed);
		font-weight: 700;
		font-size: clamp(1.25rem, 2.8vw, 1.75rem);
		line-height: 0.95;
		text-align: center;
		text-transform: uppercase;
		transform: rotate(-12deg);
	}

	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.burst {
			animation: none;
		}

		.read {
			transition: none;
		}
	}

	@media (max-width: 48rem) {
		.hero {
			grid-template-columns: 1fr;
		}

		.copy {
			padding-bottom: 0;
		}

		.read {
			font-size: 16px;
			padding: 0.75rem 1rem;
		}
	}
</style>

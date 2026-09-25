<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const featured = $derived(data.feed.posts[0]);
	const rest = $derived(data.feed.posts.slice(1));

	const dateFmt = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const formatDate = (iso: string) => dateFmt.format(new Date(iso));

	const isGuide = (title: string) => /good sport (nyc )?guide/i.test(title);

	const tickerItems = [
		'Good Sport NYC',
		'Women’s Sports',
		'New York City',
		'Liberty',
		'Gotham FC',
		'The Weekly Guide',
		'Podcast'
	];
</script>

<svelte:head>
	<title>Good Sport NYC — Women’s Sports Culture in New York City</title>
	<meta name="description" content={data.feed.description} />
</svelte:head>

<div class="page">
	<div class="ticker" aria-hidden="true">
		<div class="ticker-track">
			{#each [0, 1] as copy (copy)}
				<span class="ticker-copy">
					{#each tickerItems as item (item)}
						<span class="ticker-item">{item}</span><span class="ticker-star">★</span>
					{/each}
				</span>
			{/each}
		</div>
	</div>

	<header class="masthead">
		<p class="kicker">A newsletter &amp; podcast by Christiana Cromer</p>
		<h1 class="wordmark">
			<span class="line">Good</span>
			<span class="line hollow">Sport</span>
			<span class="line nyc">NYC<span class="dot">.</span></span>
		</h1>
		<p class="tagline">{data.feed.description}</p>
		<div class="cta">
			<a class="btn solid" href="https://www.goodsportnyc.com/subscribe">Subscribe free</a>
			<a class="btn" href={data.feed.link}>Read on Substack</a>
		</div>
	</header>

	{#if featured}
		<section class="featured" aria-label="Latest post">
			<a class="featured-card" href={featured.link}>
				{#if featured.image}
					<div class="featured-media">
						<img src={featured.image} alt="" loading="eager" />
					</div>
				{/if}
				<div class="featured-body">
					<p class="meta">
						<span class="tag" class:guide={isGuide(featured.title)}>
							{isGuide(featured.title) ? 'The Guide' : 'Feature'}
						</span>
						<time datetime={featured.pubDate}>{formatDate(featured.pubDate)}</time>
						<span class="latest">Latest</span>
					</p>
					<h2>{featured.title}</h2>
					<p class="desc">{featured.description}</p>
					<span class="read-more">Read it →</span>
				</div>
			</a>
		</section>
	{/if}

	<section class="archive" aria-label="Recent posts">
		<h3 class="section-title">Recent dispatches</h3>
		<div class="grid">
			{#each rest as post, i (post.link)}
				<a class="card" href={post.link} style:--i={i}>
					{#if post.image}
						<div class="card-media">
							<img src={post.image} alt="" loading="lazy" />
						</div>
					{/if}
					<p class="meta">
						<span class="tag" class:guide={isGuide(post.title)}>
							{isGuide(post.title) ? 'The Guide' : 'Feature'}
						</span>
						<time datetime={post.pubDate}>{formatDate(post.pubDate)}</time>
					</p>
					<h4>{post.title}</h4>
					<p class="desc">{post.description}</p>
				</a>
			{/each}
		</div>
	</section>

	<footer>
		<p class="footer-mark">Good Sport NYC<span class="dot">.</span></p>
		<p>
			© {new Date().getFullYear()} Christiana Cromer · Powered by the
			<a href="https://www.goodsportnyc.com/feed">Substack feed</a>
		</p>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		background: var(--paper, #faf5ec);
		color: #161412;
		font-family: 'Archivo', sans-serif;
	}

	.page {
		--paper: #faf5ec;
		--ink: #161412;
		--orange: #ff4d00;
		--seafoam: #5fc8ab;
		--rule: 2px solid var(--ink);
		min-height: 100vh;
		background:
			radial-gradient(ellipse 80% 50% at 70% -10%, rgba(95, 200, 171, 0.25), transparent 60%),
			var(--paper);
	}

	/* ── Ticker ─────────────────────────────── */
	.ticker {
		overflow: hidden;
		border-bottom: var(--rule);
		background: var(--ink);
		color: var(--paper);
		padding: 0.5rem 0;
	}
	.ticker-track {
		display: flex;
		width: max-content;
		animation: scroll 28s linear infinite;
	}
	.ticker-copy {
		display: flex;
		align-items: center;
	}
	.ticker-item {
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		white-space: nowrap;
		padding: 0 1.25rem;
	}
	.ticker-star {
		color: var(--orange);
	}
	@keyframes scroll {
		to {
			transform: translateX(-50%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ticker-track {
			animation: none;
		}
	}

	/* ── Masthead ───────────────────────────── */
	.masthead {
		padding: clamp(3rem, 8vw, 6rem) clamp(1.25rem, 5vw, 4rem) clamp(2.5rem, 6vw, 4rem);
		border-bottom: var(--rule);
	}
	.kicker {
		font-family: 'Space Mono', monospace;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		margin: 0 0 1rem;
	}
	.wordmark {
		font-family: 'Anton', sans-serif;
		font-weight: 400;
		text-transform: uppercase;
		font-size: clamp(3.5rem, 14vw, 11rem);
		line-height: 0.9;
		margin: 0;
		letter-spacing: 0.01em;
	}
	.wordmark .line {
		display: block;
	}
	.hollow {
		color: transparent;
		-webkit-text-stroke: 3px var(--ink);
	}
	.nyc {
		color: var(--orange);
	}
	.dot {
		color: var(--seafoam);
	}
	.tagline {
		max-width: 34rem;
		font-size: clamp(1.05rem, 2vw, 1.3rem);
		line-height: 1.45;
		margin: 1.5rem 0 2rem;
	}
	.cta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.btn {
		font-family: 'Space Mono', monospace;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		color: var(--ink);
		border: var(--rule);
		padding: 0.8rem 1.6rem;
		background: var(--paper);
		box-shadow: 4px 4px 0 var(--ink);
		transition:
			transform 120ms ease,
			box-shadow 120ms ease;
	}
	.btn:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0 var(--ink);
	}
	.btn:active {
		transform: translate(2px, 2px);
		box-shadow: 1px 1px 0 var(--ink);
	}
	.btn.solid {
		background: var(--orange);
		color: var(--paper);
	}

	/* ── Featured ───────────────────────────── */
	.featured {
		border-bottom: var(--rule);
	}
	.featured-card {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		text-decoration: none;
		color: inherit;
	}
	.featured-media {
		border-right: var(--rule);
		overflow: hidden;
		aspect-ratio: 3 / 2;
	}
	.featured-media img,
	.card-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 400ms ease;
	}
	.featured-card:hover img,
	.card:hover img {
		transform: scale(1.04);
	}
	.featured-body {
		padding: clamp(1.5rem, 4vw, 3rem);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
	}
	.featured-body h2 {
		font-family: 'Anton', sans-serif;
		font-weight: 400;
		text-transform: uppercase;
		font-size: clamp(1.6rem, 3.5vw, 2.6rem);
		line-height: 1.05;
		margin: 0;
	}
	.read-more {
		font-family: 'Space Mono', monospace;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--orange);
	}
	.featured-card:hover .read-more {
		text-decoration: underline;
	}

	/* ── Meta / tags ────────────────────────── */
	.meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0;
	}
	.tag {
		background: var(--orange);
		color: var(--paper);
		padding: 0.25rem 0.6rem;
	}
	.tag.guide {
		background: var(--seafoam);
		color: var(--ink);
	}
	.latest {
		border: 1px solid var(--ink);
		padding: 0.2rem 0.55rem;
	}
	.desc {
		line-height: 1.55;
		margin: 0;
		color: rgba(22, 20, 18, 0.75);
	}

	/* ── Archive grid ───────────────────────── */
	.archive {
		padding: clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem);
	}
	.section-title {
		font-family: 'Anton', sans-serif;
		font-weight: 400;
		text-transform: uppercase;
		font-size: clamp(1.4rem, 3vw, 2rem);
		margin: 0 0 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.section-title::after {
		content: '';
		flex: 1;
		border-top: var(--rule);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		gap: 2rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
		animation: rise 500ms ease both;
		animation-delay: calc(var(--i) * 60ms);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.card {
			animation: none;
		}
	}
	.card-media {
		border: var(--rule);
		overflow: hidden;
		aspect-ratio: 3 / 2;
	}
	.card h4 {
		font-family: 'Anton', sans-serif;
		font-weight: 400;
		text-transform: uppercase;
		font-size: 1.25rem;
		line-height: 1.1;
		margin: 0;
	}
	.card:hover h4 {
		color: var(--orange);
	}
	.card .desc {
		font-size: 0.95rem;
	}

	/* ── Footer ─────────────────────────────── */
	footer {
		border-top: var(--rule);
		background: var(--ink);
		color: var(--paper);
		padding: 2.5rem clamp(1.25rem, 5vw, 4rem);
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
	}
	.footer-mark {
		font-family: 'Anton', sans-serif;
		text-transform: uppercase;
		font-size: 1.6rem;
		margin: 0 0 0.75rem;
	}
	footer a {
		color: var(--seafoam);
	}

	/* ── Responsive ─────────────────────────── */
	@media (max-width: 48rem) {
		.featured-card {
			grid-template-columns: 1fr;
		}
		.featured-media {
			border-right: none;
			border-bottom: var(--rule);
		}
	}
</style>

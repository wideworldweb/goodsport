<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Ticker from '$lib/components/Ticker.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import { formatDate, headline } from '$lib/post';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const latest = $derived(data.feed.posts[0]);
	const older = $derived(data.feed.posts.slice(1));

	const tickerItems = ['This week', 'Liberty', 'Gotham FC', 'Sirens', 'Exiles', 'What to watch, where'];
</script>

<svelte:head>
	<title>{data.feed.title}</title>
	<meta name="description" content={data.feed.description} />
</svelte:head>

<TopBar />
<Header title={data.feed.title} />

<main>
	{#if latest}
		<Hero post={latest} byline={data.feed.title} now={data.now} />
	{/if}

	<div class="tickers">
		<Ticker items={tickerItems} background="var(--cream)" color="var(--red)" seconds={38} />
		<Ticker items={tickerItems} background="var(--amber)" color="var(--blue)" direction="right" seconds={44} />
		<Ticker items={tickerItems} background="var(--red)" color="var(--cream)" seconds={41} />
	</div>

	{#if older.length > 0}
		<section class="archive" aria-labelledby="archive-heading">
			<h2 id="archive-heading">More from {data.feed.title}</h2>
			<ul>
				{#each older as post (post.link)}
					<li>
						<a href={post.link}>{headline(post.title)}</a>
						<time datetime={post.pubDate}>{formatDate(post.pubDate)}</time>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>

<style>
	.archive {
		max-width: 56rem;
		padding: 3rem var(--page-pad) 4rem;
	}

	h2 {
		margin: 0 0 1.5rem;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(1.75rem, 3.5vw, 2.5rem);
		color: var(--blue);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1.5rem;
		padding: 0.9rem 0;
		border-bottom: 2px dotted var(--ink);
	}

	li a {
		font-size: 1.1rem;
		font-weight: 600;
		text-decoration: none;
	}

	li a:hover {
		color: var(--red);
	}

	time {
		flex: none;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
</style>

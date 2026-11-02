<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Instagram from '$lib/components/Instagram.svelte';
	import Latest from '$lib/components/Latest.svelte';
	import Podcast from '$lib/components/Podcast.svelte';
	import Subscribe from '$lib/components/Subscribe.svelte';
	import Ticker from '$lib/components/Ticker.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import { isEpisode, isIssue } from '$lib/post';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const hero = $derived(data.feed.posts[0]);
	const rest = $derived(data.feed.posts.slice(1));
	const featured = $derived(rest.find((post) => !isEpisode(post) && !isIssue(post)));
	const issues = $derived(rest.filter(isIssue).slice(0, 3));
	const episodes = $derived(rest.filter(isEpisode).slice(0, 4));

	const tickerItems = ['This week', 'Liberty', 'Gotham FC', 'Sirens', 'Exiles', 'What to watch, where'];
</script>

<svelte:head>
	<title>{data.feed.title}</title>
	<meta name="description" content={data.feed.description} />
</svelte:head>

<div data-swing-section>
	<TopBar />
	<Header title={data.feed.title} />

	{#if hero}
		<Hero post={hero} byline={data.feed.title} now={data.now} />
	{/if}

	<div class="tickers">
		<Ticker items={tickerItems} background="var(--cream)" color="var(--red)" seconds={38} />
		<Ticker items={tickerItems} background="var(--amber)" color="var(--blue)" direction="right" seconds={44} />
		<Ticker items={tickerItems} background="var(--red)" color="var(--cream)" seconds={41} />
	</div>
</div>

<main>
	{#if featured || issues.length > 0}
		<div data-swing-section>
			<Latest {featured} {issues} />
		</div>
	{/if}

	{#if episodes.length > 0}
		<div data-swing-section>
			<Podcast {episodes} />
		</div>
	{/if}

	<div data-swing-section>
		<Instagram />
	</div>

	<div data-morph-section>
		<Subscribe />
	</div>
</main>

<Footer />

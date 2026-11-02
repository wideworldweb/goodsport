<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const dateFmt = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'America/New_York'
	});
	const formatDate = (iso: string) => dateFmt.format(new Date(iso));
</script>

<svelte:head>
	<title>{data.feed.title}</title>
	<meta name="description" content={data.feed.description} />
</svelte:head>

<h1>{data.feed.title}</h1>

<ul>
	{#each data.feed.posts as post (post.link)}
		<li>
			<a href={post.link}>{post.title}</a>
			<time datetime={post.pubDate}>{formatDate(post.pubDate)}</time>
		</li>
	{/each}
</ul>

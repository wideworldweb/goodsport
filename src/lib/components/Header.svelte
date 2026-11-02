<script lang="ts">
	let { title }: { title: string } = $props();

	const nav = [
		{ label: 'News', href: 'https://www.goodsportnyc.com' },
		{ label: 'Podcast', href: 'https://www.goodsportnyc.com/podcast' },
		{ label: 'NYC Weekly', href: 'https://www.goodsportnyc.com/archive' },
		{ label: 'About', href: 'https://www.goodsportnyc.com/about' }
	];
</script>

<header>
	<a class="logo" href="/">
		<img src="/logo.png" alt={title} width="998" height="668" />
	</a>
	<nav aria-label="Main">
		{#each nav as item (item.label)}
			<a href={item.href}>{item.label}</a>
		{/each}
	</nav>
	<a class="subscribe" href="https://www.goodsportnyc.com/subscribe">Subscribe</a>
</header>

<style>
	header {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		background: var(--blue);
		color: var(--cream);
		padding-left: var(--page-pad);
	}

	.logo {
		display: block;
		padding: 0.25rem 0 0;
	}

	.logo img {
		display: block;
		width: clamp(7.5rem, 16vw, 10.5rem);
		height: auto;
	}

	nav {
		display: flex;
		justify-content: flex-end;
		gap: clamp(1rem, 2.6vw, 2rem);
		padding: 1.4rem clamp(1rem, 2.6vw, 2rem) 0;
	}

	nav a,
	.subscribe {
		font-family: var(--font-condensed);
		font-stretch: 72%;
		font-weight: 700;
		text-transform: uppercase;
		text-decoration: none;
		letter-spacing: 0.02em;
	}

	nav a {
		font-size: clamp(1rem, 1.9vw, 1.25rem);
		background: linear-gradient(currentColor, currentColor) 0 100% / 0 2px no-repeat;
		transition: background-size 150ms ease-out;
	}

	nav a:hover {
		background-size: 100% 2px;
	}

	.subscribe {
		display: block;
		padding: 0.6rem clamp(1.25rem, 3vw, 2.4rem) 0.7rem;
		background: var(--red);
		color: var(--cream);
		font-size: clamp(1.5rem, 3.4vw, 2.4rem);
		line-height: 1.1;
		transition: background-color 150ms ease-out;
	}

	.subscribe:hover {
		background: color-mix(in srgb, var(--red) 82%, var(--ink));
	}

	@media (max-width: 48rem) {
		header {
			grid-template-columns: 1fr auto;
		}

		nav {
			display: none;
		}

		.subscribe {
			font-size: 1.25rem;
		}
	}
</style>

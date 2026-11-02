<script lang="ts">
	const links = [
		{ label: 'Newsletter', href: 'https://www.goodsportnyc.com' },
		{ label: 'Podcast', href: 'https://www.goodsportnyc.com/podcast' },
		{ label: 'Discord', href: '#discord' }
	];
</script>

<div class="top-bar layer">
	<p>Women's sports culture in New York City</p>
	<nav aria-label="Elsewhere">
		{#each links as link, i (link.label)}
			{#if i > 0}<span aria-hidden="true">•</span>{/if}
			<a href={link.href}>{link.label}</a>
		{/each}
	</nav>
</div>

<style>
	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem var(--page-pad);
		background: var(--amber);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	p {
		margin: 0;
	}

	nav {
		display: flex;
		gap: 0.9rem;
	}

	a {
		text-decoration: none;
		background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
		transition: background-size 150ms ease-out;
	}

	a:hover {
		background-size: 100% 1px;
	}

	@media (max-width: 40rem) {
		p {
			display: none;
		}

		.top-bar {
			justify-content: center;
		}
	}
</style>

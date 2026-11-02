<script lang="ts">
	const columns = [
		{
			heading: 'Explore',
			links: [
				{ label: 'News', href: 'https://www.goodsportnyc.com' },
				{ label: 'Podcast', href: 'https://www.goodsportnyc.com/podcast' },
				{ label: 'NYC Weekly', href: 'https://www.goodsportnyc.com/archive' },
				{ label: 'About', href: 'https://www.goodsportnyc.com/about' }
			]
		},
		{
			heading: 'Follow',
			links: [
				{ label: 'Instagram', href: 'https://www.instagram.com/goodsport.nyc/' },
				{ label: 'Substack', href: 'https://www.goodsportnyc.com' },
				{ label: 'Discord', href: '#discord' }
			]
		},
		{
			heading: 'Support',
			links: [
				{ label: 'Subscribe', href: 'https://www.goodsportnyc.com/subscribe' },
				{ label: 'Donate', href: '#donate' },
				{ label: 'TK TK TK', href: '#tk' }
			]
		}
	];

	const year = new Date().getFullYear();
</script>

<footer class="layer">
	<div class="top">
		<img class="logo" src="/logo.png" alt="" width="998" height="668" />
		<nav aria-label="Footer">
		{#each columns as column (column.heading)}
			<div>
				<h2>{column.heading}</h2>
				<ul>
					{#each column.links as link (link.label)}
						<li><a href={link.href}>{link.label}</a></li>
					{/each}
				</ul>
			</div>
		{/each}
		</nav>
	</div>

	<div class="credit">
		<p>© {year} Good Sport NYC<span aria-hidden="true">•</span>Women's sports culture in New York City</p>
		<p>A sports media company from <a href="https://www.goodsportnyc.com/about">Christiana Cromer</a></p>
	</div>
</footer>

<style>
	footer {
		padding: 2.5rem var(--page-pad) 1.5rem;
		background: var(--blue);
		color: var(--cream);
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		padding-bottom: 2.5rem;
		margin-bottom: 2rem;
		border-bottom: 2px dotted var(--cream);
	}

	.credit {
		display: flex;
		justify-content: space-between;
		gap: 1rem 2rem;
		flex-wrap: wrap;
		padding: 0.75rem 1.75rem;
		background: var(--amber);
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.credit p {
		margin: 0;
	}

	.credit span {
		margin: 0 1.25rem;
	}

	.credit a {
		font-size: inherit;
		font-weight: 400;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.logo {
		width: clamp(9rem, 22vw, 16rem);
		height: auto;
	}

	nav {
		display: flex;
		gap: clamp(2rem, 6vw, 5rem);
	}

	h2 {
		margin: 0 0 0.9rem;
		color: var(--amber);
		font-family: var(--font-mono);
		font-weight: 400;
		font-size: 0.625rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li + li {
		margin-top: 0.55rem;
	}

	a {
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline dotted;
		text-underline-offset: 0.2em;
	}

	@media (max-width: 40rem) {
		.top {
			flex-direction: column;
		}
	}
</style>

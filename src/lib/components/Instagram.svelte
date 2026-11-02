<script lang="ts">
	const PROFILE = 'https://www.instagram.com/goodsport.nyc/';
	const tiles = ['blue', 'red', 'amber', 'cream', 'blue', 'amber'] as const;
</script>

<section class="instagram layer">
	<h2>On Instagram</h2>

	<ul>
		{#each tiles as tone, i (i)}
			<li>
				<a class="tile {tone}" href={PROFILE} aria-label="Good Sport on Instagram">
					<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">
						<rect x="3" y="3" width="18" height="18" rx="5" />
						<circle cx="12" cy="12" r="4.2" />
						<circle cx="17.3" cy="6.7" r="1" class="dot" />
					</svg>
				</a>
			</li>
		{/each}
	</ul>

	<div class="follow">
		<p>@goodsportnyc</p>
		<a class="button" href={PROFILE}>Follow @goodsportnyc</a>
	</div>
</section>

<style>
	.instagram {
		padding: clamp(4rem, 8vw, 7rem) var(--page-pad) clamp(3rem, 6vw, 5rem);
		background: var(--ink);
		color: var(--cream);
	}

	h2 {
		margin: 0 0 2rem;
		font-family: var(--font-condensed);
		font-weight: 800;
		font-size: clamp(3.75rem, 10vw, 8.5rem);
		line-height: 0.82;
		text-transform: uppercase;
		color: transparent;
		-webkit-text-stroke: 1px color-mix(in srgb, var(--cream) 45%, transparent);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		max-width: 52rem;
		margin: 0 auto;
		padding: 0;
		list-style: none;
	}

	.tile {
		position: relative;
		display: block;
		aspect-ratio: 9 / 13;
		border-radius: 0.75rem;
		background: var(--bg);
		transition: transform 150ms ease-out;
	}

	.tile:hover {
		transform: translateY(-4px);
	}

	.blue {
		--bg: var(--blue);
		--fg: var(--cream);
	}

	.red {
		--bg: var(--red);
		--fg: var(--cream);
	}

	.amber {
		--bg: var(--amber);
		--fg: var(--ink);
	}

	.cream {
		--bg: var(--cream);
		--fg: var(--ink);
	}

	.glyph {
		position: absolute;
		top: 0.9rem;
		right: 0.9rem;
		width: 1.4rem;
		fill: none;
		stroke: var(--fg);
		stroke-width: 1.8;
	}

	.glyph .dot {
		fill: var(--fg);
		stroke: none;
	}

	.follow {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
		font-family: var(--font-pixel);
		font-size: 16px;
		letter-spacing: 0.08em;
	}

	.follow p {
		margin: 0;
	}

	.button {
		display: inline-flex;
		gap: 1rem;
		padding: 0.55rem 1rem 0.5rem;
		background: var(--red);
		color: var(--cream);
		text-decoration: none;
		transition:
			transform 150ms ease-out,
			box-shadow 150ms ease-out;
	}

	.button::after {
		content: '→' / '';
		font-family: var(--font-mono);
	}

	.button:hover {
		transform: translate(-3px, -3px);
		box-shadow: 3px 3px 0 var(--cream);
	}

	@media (prefers-reduced-motion: reduce) {
		.tile,
		.button {
			transition: none;
		}
	}

	@media (max-width: 40rem) {
		ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.follow {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>

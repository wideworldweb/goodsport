<script lang="ts">
	const CARD_TILT = 5;
	const rows = Array.from({ length: 8 });
</script>

<section class="subscribe layer">
	<div class="wall" aria-hidden="true">
		{#each rows as _, i (i)}
			<p class:offset={i % 2 === 1}>Good Sport Be a Good Sport Good Sport Be a Good Sport</p>
		{/each}
	</div>

	<div class="card" data-oval-target data-oval-angle={CARD_TILT} style:--card-tilt="{CARD_TILT}deg">
		<h2>Your week in women’s sports, in your inbox.</h2>
		<p class="pitch">
			Every week, we send a guide for when and how to watch the WNBA Liberty, NWSL Gotham FC, PWHL Sirens,
			and WER Exiles. We also highlight events and parties, and curated news and content.
		</p>
		<form method="get" action="https://www.goodsportnyc.com/subscribe">
			<label class="visually-hidden" for="subscribe-email">Email address</label>
			<input id="subscribe-email" name="email" type="email" placeholder="your@email.com" autocomplete="email" required />
			<button type="submit">Subscribe</button>
		</form>
	</div>
</section>

<style>
	.subscribe {
		position: relative;
		display: grid;
		place-items: center;
		overflow: hidden;
		padding: clamp(5rem, 9vw, 7rem) var(--page-pad);
		background: var(--amber);
	}

	.wall {
		position: absolute;
		inset: 0;
		z-index: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.wall p {
		margin: 0;
		white-space: nowrap;
		color: var(--red);
		font-family: var(--font-condensed);
		font-weight: 800;
		font-size: clamp(5.5rem, 14vw, 12rem);
		line-height: 0.7;
		letter-spacing: -0.015em;
		text-transform: uppercase;
		paint-order: stroke fill;
		-webkit-text-stroke: 0.03em var(--blue);
	}

	.wall .offset {
		translate: -0.55em 0;
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: min(62rem, 80vw);
		aspect-ratio: 1 / 0.5;
		padding: 0 16%;
		border-radius: 50%;
		background: var(--cream);
		color: var(--ink);
		text-align: center;
		rotate: var(--card-tilt);
	}

	.card > * {
		transition: opacity 300ms ease-out;
	}

	.card:global([data-oval-state='waiting']) {
		background-color: transparent;
	}

	.card:global([data-oval-state='waiting']) > * {
		opacity: 0;
	}

	h2 {
		margin: 0 0 0.9rem;
		color: var(--blue);
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(1.5rem, 3.4vw, 2.5rem);
		line-height: 1;
	}

	.pitch {
		margin: 0 0 1.25rem;
		font-size: clamp(0.7rem, 1.1vw, 0.8125rem);
		line-height: 1.45;
	}

	form {
		display: flex;
		gap: 0.75rem;
		width: 100%;
	}

	input {
		flex: 1;
		min-width: 0;
		padding: 0.65rem 0.8rem;
		border: 2px solid var(--blue);
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 0.875rem;
	}

	input:focus-visible {
		outline: 2px solid var(--red);
		outline-offset: 2px;
	}

	button {
		padding: 0.5rem 1rem 0.45rem;
		border: none;
		background: var(--red);
		color: var(--cream);
		font-family: var(--font-pixel);
		font-size: 16px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			transform 150ms ease-out,
			box-shadow 150ms ease-out;
	}

	button:hover {
		transform: translate(-3px, -3px);
		box-shadow: 3px 3px 0 var(--blue);
	}

	@media (prefers-reduced-motion: reduce) {
		.card > *,
		button {
			transition: none;
		}
	}
</style>

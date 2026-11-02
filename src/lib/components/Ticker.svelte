<script lang="ts">
	let {
		items,
		background,
		color,
		direction = 'left',
		seconds = 40
	}: {
		items: string[];
		background: string;
		color: string;
		direction?: 'left' | 'right';
		seconds?: number;
	} = $props();

	const COPIES = 4;
	const line = $derived(items.map((item) => `${item} — `).join(''));
</script>

<div
	class="ticker"
	class:right={direction === 'right'}
	style:--bg={background}
	style:--fg={color}
	style:--seconds="{seconds}s"
>
	<p class="visually-hidden">{items.join(', ')}</p>
	<div class="track" aria-hidden="true">
		{#each { length: COPIES }, i (i)}
			<span class="copy">{line}</span>
		{/each}
	</div>
</div>

<style>
	.ticker {
		overflow: hidden;
		background: var(--bg);
		color: var(--fg);
		border-bottom: 2px dotted var(--ink);
	}

	.track {
		display: flex;
		width: max-content;
		padding: 0.7rem 0 0.6rem;
	}

	.copy {
		flex: none;
		padding-right: 0.6em;
		font-family: var(--font-pixel);
		font-size: 32px;
		line-height: 1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		white-space: pre;
		will-change: transform;
		animation: scroll var(--seconds) linear infinite;
	}

	.right .copy {
		animation-direction: reverse;
	}

	@keyframes scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-100%);
		}
	}

	@media (max-width: 40rem) {
		.copy {
			font-size: 16px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.copy {
			animation: none;
		}
	}
</style>

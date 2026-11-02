<script lang="ts">
	let {
		title,
		href,
		linkText,
		tone
	}: { title: string; href: string; linkText: string; tone: 'on-blue' | 'on-cream' } = $props();
</script>

<div class="section-header {tone}">
	<h2>{title}</h2>
	<a class="more" {href}>{linkText}</a>
</div>

<style>
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1.5rem;
		padding-bottom: 2rem;
		margin-bottom: 2.5rem;
		border-bottom: 2px dotted currentColor;
	}

	h2 {
		margin: 0;
		font-family: var(--font-condensed);
		font-weight: 800;
		font-size: clamp(3.75rem, 10vw, 8.5rem);
		line-height: 0.82;
		letter-spacing: -0.01em;
		text-transform: uppercase;
		paint-order: stroke fill;
		-webkit-text-stroke: 0.03em var(--stroke);
	}

	.on-blue h2 {
		color: var(--amber);
		--stroke: var(--cream);
	}

	.on-cream h2 {
		color: var(--blue);
		--stroke: var(--red);
	}

	.more {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.45rem 1.5rem 0.45rem 9rem;
		background: var(--red);
		color: var(--cream);
		font-family: var(--font-condensed);
		font-weight: 700;
		font-size: 1.6rem;
		line-height: 1.1;
		text-transform: uppercase;
		text-decoration: none;
		transition: background-color 150ms ease-out;
	}

	.more::after {
		content: '→' / '';
	}

	.more:hover {
		background: color-mix(in srgb, var(--red) 82%, var(--ink));
	}

	@media (max-width: 48rem) {
		.section-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.more {
			padding-left: 1.5rem;
		}
	}
</style>

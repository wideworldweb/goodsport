<script lang="ts">
	import '@fontsource-variable/archivo/wdth.css';
	import '@fontsource/alfa-slab-one';
	import '@fontsource/dm-mono/400.css';
	import '@fontsource/dm-mono/500.css';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preload" href="/fonts/MinimalFont5x7.ttf" as="font" type="font/ttf" crossorigin="anonymous" />
</svelte:head>

{@render children()}

<script lang="ts">
	import { onMount } from 'svelte';
	import { createPendulum, sectionAngle, sectionTriggers } from '$lib/swing';

	const TILT = 17;

	let oval: HTMLDivElement;

	onMount(() => {
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
		const readingLine = () => scrollY + innerHeight / 2;
		let triggers: number[] = [];
		let frame = 0;
		let last = 0;

		function measure() {
			const furthest = document.documentElement.scrollHeight - innerHeight / 2 - 1;
			const sections = [...document.querySelectorAll('[data-swing-section]')].map((section) => {
				const box = section.getBoundingClientRect();
				return { top: box.top + scrollY, height: box.height };
			});
			triggers = sectionTriggers(sections, furthest);
		}

		measure();
		const pendulum = createPendulum(sectionAngle(triggers, readingLine(), TILT));
		const write = (angle: number) => oval.style.setProperty('--angle', `${angle}deg`);
		write(pendulum.target);

		function tick(now: number) {
			const dt = last ? (now - last) / 1000 : 0;
			last = now;
			const { angle, settled } = pendulum.step(dt);
			write(angle);
			frame = settled ? 0 : requestAnimationFrame(tick);
		}

		function start() {
			if (frame || document.hidden) return;
			last = 0;
			frame = requestAnimationFrame(tick);
		}

		function stop() {
			cancelAnimationFrame(frame);
			frame = 0;
		}

		function update() {
			if (reducedMotion.matches) return;
			const target = sectionAngle(triggers, readingLine(), TILT);
			if (target === pendulum.target) return;
			pendulum.target = target;
			start();
		}

		function remeasure() {
			measure();
			update();
		}

		function onMotionPreference() {
			if (!reducedMotion.matches) return update();
			stop();
			pendulum.target = -TILT;
			write(-TILT);
		}

		function onVisibility() {
			if (document.hidden) stop();
			else start();
		}

		const resizes = new ResizeObserver(remeasure);
		resizes.observe(document.body);
		addEventListener('scroll', update, { passive: true });
		addEventListener('resize', remeasure);
		reducedMotion.addEventListener('change', onMotionPreference);
		document.addEventListener('visibilitychange', onVisibility);
		document.fonts.ready.then(remeasure);
		onMotionPreference();

		return () => {
			stop();
			resizes.disconnect();
			removeEventListener('scroll', update);
			removeEventListener('resize', remeasure);
			reducedMotion.removeEventListener('change', onMotionPreference);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});
</script>

<div class="oval" style:--tilt="{TILT}deg" aria-hidden="true" bind:this={oval}></div>

<style>
	.oval {
		--ratio: 0.6;

		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 1;
		/* Sized so the rotated ellipse's outer edge touches both sides of the viewport. */
		width: calc(100% / sqrt(pow(cos(var(--tilt)), 2) + pow(var(--ratio) * sin(var(--tilt)), 2)));
		aspect-ratio: 1 / var(--ratio);
		border: 24px solid var(--white);
		border-radius: 50%;
		transform: translate(-50%, -50%) rotate(var(--angle, calc(-1 * var(--tilt))));
		will-change: transform;
		pointer-events: none;
	}
</style>

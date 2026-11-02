<script lang="ts">
	import { onMount } from 'svelte';
	import { createMorph, morphFrame, type OvalShape } from '$lib/morph';
	import { createPendulum, sectionAngle, sectionTriggers } from '$lib/swing';

	const TILT = 17;

	let oval: HTMLDivElement;

	onMount(() => {
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
		const card = document.querySelector<HTMLElement>('[data-oval-target]');
		const morphSection = document.querySelector('[data-morph-section]');
		const cardAngle = Number(card?.dataset.ovalAngle ?? 0);
		const readingLine = () => scrollY + innerHeight / 2;

		let triggers: number[] = [];
		let morphTrigger = Infinity;
		let ovalSize = { width: 1, height: 1 };
		let cardSize = { width: 0, height: 0 };
		let cardCentre = { x: 0, y: 0 };
		let frame = 0;
		let last = 0;
		const written = new Map<string, string>();

		const documentBox = (element: Element) => {
			const box = element.getBoundingClientRect();
			return { top: box.top + scrollY, left: box.left + scrollX, width: box.width, height: box.height };
		};

		function measure() {
			const furthest = document.documentElement.scrollHeight - innerHeight / 2 - 1;
			triggers = sectionTriggers([...document.querySelectorAll('[data-swing-section]')].map(documentBox), furthest);
			morphTrigger = morphSection ? sectionTriggers([documentBox(morphSection)], furthest)[0] : Infinity;
			ovalSize = { width: oval.offsetWidth, height: oval.offsetHeight };
			if (card) {
				const box = documentBox(card);
				cardSize = { width: card.offsetWidth, height: card.offsetHeight };
				cardCentre = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
			}
		}

		function set(property: string, value: string) {
			if (written.get(property) === value) return;
			written.set(property, value);
			oval.style.setProperty(property, value);
		}

		function render(angle: number, progress: number) {
			const centre = { x: document.documentElement.clientWidth / 2, y: innerHeight / 2 };
			const big: OvalShape = { ...centre, ...ovalSize, angle };
			const target: OvalShape = { x: cardCentre.x - scrollX, y: cardCentre.y - scrollY, ...cardSize, angle: cardAngle };
			const shape = progress > 0 ? morphFrame(progress, big, target) : { ...big, fill: 0 };
			const landed = progress === 1;

			set('--dx', `${shape.x - centre.x}px`);
			set('--dy', `${shape.y - centre.y}px`);
			set('--sx', `${shape.width / ovalSize.width}`);
			set('--sy', `${shape.height / ovalSize.height}`);
			set('--angle', `${shape.angle}deg`);
			set('--fill', `${shape.fill}`);
			set('opacity', landed ? '0' : '1');

			const state = landed ? 'landed' : 'waiting';
			if (card && card.dataset.ovalState !== state) card.dataset.ovalState = state;
		}

		measure();
		const pendulum = createPendulum(sectionAngle(triggers, readingLine(), TILT));
		const morph = createMorph();

		function tick(now: number) {
			const dt = last ? (now - last) / 1000 : 0;
			last = now;
			const swing = pendulum.step(dt);
			const morphed = morph.step(dt);
			render(swing.angle, morphed.progress);
			frame = swing.settled && morphed.done ? 0 : requestAnimationFrame(tick);
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
			const line = readingLine();
			if (reducedMotion.matches) {
				render(-TILT, line >= morphTrigger ? 1 : 0);
				return;
			}
			const angle = sectionAngle(triggers, line, TILT);
			const forward = line >= morphTrigger;
			if (angle === pendulum.target && forward === morph.forward) return;
			pendulum.target = angle;
			morph.forward = forward;
			start();
		}

		function remeasure() {
			measure();
			update();
		}

		function onMotionPreference() {
			if (reducedMotion.matches) stop();
			update();
		}

		function onVisibility() {
			if (document.hidden) stop();
			else start();
		}

		render(pendulum.target, 0);
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
			if (card) delete card.dataset.ovalState;
		};
	});
</script>

<div class="oval" style:--tilt="{TILT}deg" aria-hidden="true" bind:this={oval}>
	<span class="rim"></span>
	<span class="fill"></span>
</div>

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
		transform: translate(-50%, -50%) translate(var(--dx, 0px), var(--dy, 0px))
			rotate(var(--angle, calc(-1 * var(--tilt)))) scale(var(--sx, 1), var(--sy, 1));
		will-change: transform;
		pointer-events: none;
	}

	.rim,
	.fill {
		position: absolute;
		inset: 0;
		border-radius: 50%;
	}

	.rim {
		border: 24px solid var(--white);
		opacity: calc(1 - var(--fill, 0));
	}

	.fill {
		background: var(--cream);
		opacity: var(--fill, 0);
	}
</style>

import { describe, expect, it } from 'vitest';
import { createMorph, morphFrame } from './morph';

const big = { x: 640, y: 400, width: 1400, height: 840, angle: -17 };
const card = { x: 640, y: 300, width: 620, height: 340, angle: 5 };

describe('morphFrame', () => {
	it('is the big outline oval at the start', () => {
		expect(morphFrame(0, big, card)).toEqual({ ...big, fill: 0 });
	});

	it('has shrunk and tilted onto the card before it starts to fill', () => {
		const frame = morphFrame(0.75, big, card);

		expect(frame).toMatchObject(card);
		expect(frame.fill).toBe(0);
	});

	it('eases the shrink rather than moving at a constant speed', () => {
		const quarter = morphFrame(0.75 / 4, big, card).width;
		const linearQuarter = big.width + (card.width - big.width) / 4;

		expect(quarter).not.toBeCloseTo(linearQuarter, 0);
		expect(quarter).toBeLessThan(big.width);
		expect(quarter).toBeGreaterThan(card.width);
	});

	it('fills in once it has landed', () => {
		expect(morphFrame(0.875, big, card).fill).toBeCloseTo(0.5, 1);
		expect(morphFrame(1, big, card)).toEqual({ ...card, fill: 1 });
	});
});

function run(morph: ReturnType<typeof createMorph>, seconds: number, hz: number) {
	let state = morph.step(0);
	for (let i = 0; i < Math.round(seconds * hz); i++) state = morph.step(1 / hz);
	return state;
}

describe('createMorph', () => {
	it('runs forward to the end in about a second and stops', () => {
		const morph = createMorph();
		morph.forward = true;

		expect(run(morph, 0.5, 60).progress).toBeGreaterThan(0.3);
		expect(run(morph, 1, 60)).toEqual({ progress: 1, done: true });
	});

	it('is at rest at the start until it is told to go forward', () => {
		expect(createMorph().step(1 / 60)).toEqual({ progress: 0, done: true });
	});

	it('reverses from wherever it is', () => {
		const morph = createMorph();
		morph.forward = true;
		const midway = run(morph, 0.4, 60).progress;
		morph.forward = false;

		const after = morph.step(1 / 60).progress;

		expect(after).toBeLessThan(midway);
		expect(run(morph, 2, 60)).toEqual({ progress: 0, done: true });
	});

	it('moves the same at 60Hz and 120Hz', () => {
		const a = createMorph();
		const b = createMorph();
		a.forward = b.forward = true;

		expect(run(a, 0.3, 60).progress).toBeCloseTo(run(b, 0.3, 120).progress, 2);
	});

	it('does not jump after a long frame', () => {
		const morph = createMorph();
		morph.forward = true;

		expect(morph.step(3).progress).toBeLessThan(0.1);
	});
});
